"""
Tests for the three critical edge cases.

Edge Case 1: Race condition on concurrent enrollment
Edge Case 2: Student deletion with active enrollments
Edge Case 3: Timezone-naive datetime rejection
"""

import os
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

import pytest
from fastapi import HTTPException
from pydantic import ValidationError

os.environ.setdefault("ADMIN_USER", "admin")
os.environ.setdefault("ADMIN_PASSWORD", "testpass")
os.environ.setdefault("FASTAPI_SECRET_KEY", "test-secret-key-for-pytest-only")
os.environ.setdefault("FASTAPI_DATABASE_URL", "sqlite+aiosqlite:///:memory:")
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")

from api.schemas.schedule import (  # noqa: E402
    LessonCreate,
    LessonDateRangeQuery,
    LessonUpdate,
)
from api.services.schedule import ScheduleService  # noqa: E402
from api.services.students import StudentService  # noqa: E402


# ═══════════════════════════════════════════════════════════════════════════════
# Edge Case 1: Race condition — concurrent enrollment of the same student
# ═══════════════════════════════════════════════════════════════════════════════

class TestRaceConditionEnrollment:
    """
    Simulates the 'loser' in a race condition: the request that arrives
    after another concurrent request has already inserted the enrollment.

    In production, pg_advisory_xact_lock serialises both requests so the
    second one always hits the existence check (Layer 2) and gets a clean 409.
    The DB PK constraint (Layer 3) is the last resort if the lock is bypassed.
    """

    def _make_db(self):
        db = AsyncMock()
        cm = AsyncMock()
        cm.__aenter__ = AsyncMock(return_value=None)
        cm.__aexit__ = AsyncMock(return_value=False)
        db.begin = MagicMock(return_value=cm)
        return db

    async def test_concurrent_enroll_second_request_gets_409(self):
        """
        Scenario: Request A and Request B both try to enroll student S in lesson L.
        Request A wins and commits. Request B arrives after the lock releases —
        it sees the existing enrollment and raises 409.
        """
        from api.schemas.schedule import EnrollRequest

        lesson = MagicMock(id=str(uuid4()))
        student = MagicMock(id=str(uuid4()))
        existing_enrollment = MagicMock()  # simulates Request A's committed record

        db = self._make_db()
        db.get = AsyncMock(return_value=lesson)  # lesson found

        with patch("api.services.schedule.LessonRepository") as MockRepo:
            repo = MockRepo.return_value
            repo.get_student = AsyncMock(return_value=student)
            repo.get_enrollment = AsyncMock(return_value=existing_enrollment)

            service = ScheduleService(db)
            with pytest.raises(HTTPException) as exc_info:
                await service.enroll_student(
                    lesson.id, EnrollRequest(studentId=student.id)
                )

        assert exc_info.value.status_code == 409
        assert "already enrolled" in exc_info.value.detail.lower()

    async def test_advisory_lock_is_called_before_existence_check(self):
        """
        Advisory lock must be the FIRST operation inside the transaction.
        This guarantees that the existence check happens while the lock is held.
        """
        from api.schemas.schedule import EnrollRequest

        lesson = MagicMock(id="lesson-1")
        student = MagicMock(id="student-1")
        enrollment = MagicMock(lessonId="lesson-1", studentId="student-1", attended=False)
        enrollment.student = student

        db = self._make_db()
        db.get = AsyncMock(return_value=lesson)

        with patch("api.services.schedule.LessonRepository") as MockRepo:
            repo = MockRepo.return_value
            repo.get_student = AsyncMock(return_value=student)
            repo.get_enrollment = AsyncMock(return_value=None)
            repo.get_enrollment_with_student = AsyncMock(return_value=enrollment)

            service = ScheduleService(db)
            await service.enroll_student("lesson-1", EnrollRequest(studentId="student-1"))

        # First execute() call must be the advisory lock
        first_call = db.execute.call_args_list[0]
        sql = str(first_call[0][0])
        assert "pg_advisory_xact_lock" in sql

    async def test_different_students_same_lesson_no_contention(self):
        """Two different students enrolling the same lesson must not block each other."""
        from api.schemas.schedule import EnrollRequest

        lesson = MagicMock(id="lesson-1")
        s1 = MagicMock(id="student-1")
        s2 = MagicMock(id="student-2")
        e1 = MagicMock(lessonId="lesson-1", studentId="student-1")
        e2 = MagicMock(lessonId="lesson-1", studentId="student-2")

        for student, enrollment in [(s1, e1), (s2, e2)]:
            db = self._make_db()
            db.get = AsyncMock(return_value=lesson)
            with patch("api.services.schedule.LessonRepository") as MockRepo:
                repo = MockRepo.return_value
                repo.get_student = AsyncMock(return_value=student)
                repo.get_enrollment = AsyncMock(return_value=None)
                repo.get_enrollment_with_student = AsyncMock(return_value=enrollment)

                service = ScheduleService(db)
                result = await service.enroll_student(
                    "lesson-1", EnrollRequest(studentId=student.id)
                )
            assert result is enrollment  # both succeed independently


# ═══════════════════════════════════════════════════════════════════════════════
# Edge Case 2: Student deletion with active lesson enrollments
# ═══════════════════════════════════════════════════════════════════════════════

class TestStudentDeletionWithEnrollments:
    """
    ON DELETE CASCADE means deleting a student silently erases all their
    lesson history (attendance records, finance data). The service blocks
    this with 409 and instructs the caller to cancel enrollments first.
    """

    async def test_delete_student_with_enrollments_raises_409(self):
        mock_student = MagicMock(id=str(uuid4()))
        mock_enrollments = [MagicMock(), MagicMock(), MagicMock()]  # 3 enrollments

        with patch("api.services.students.StudentRepository") as MockRepo:
            MockRepo.return_value.get_by_id = AsyncMock(return_value=mock_student)

            db = AsyncMock()
            # db.execute returns a result with 3 enrollments
            mock_result = MagicMock()
            mock_result.scalars.return_value.all.return_value = mock_enrollments
            db.execute = AsyncMock(return_value=mock_result)

            service = StudentService(db)
            with pytest.raises(HTTPException) as exc_info:
                await service.delete_student(mock_student.id)

        assert exc_info.value.status_code == 409
        assert "3" in exc_info.value.detail  # enrollment count in message
        assert "cancel" in exc_info.value.detail.lower()

    async def test_delete_student_without_enrollments_succeeds(self):
        mock_student = MagicMock(id=str(uuid4()))

        with patch("api.services.students.StudentRepository") as MockRepo:
            repo = MockRepo.return_value
            repo.get_by_id = AsyncMock(return_value=mock_student)
            repo.delete = AsyncMock()

            db = AsyncMock()
            mock_result = MagicMock()
            mock_result.scalars.return_value.all.return_value = []  # no enrollments
            db.execute = AsyncMock(return_value=mock_result)

            service = StudentService(db)
            await service.delete_student(mock_student.id)

        repo.delete.assert_called_once_with(mock_student)

    async def test_delete_nonexistent_student_still_404(self):
        with patch("api.services.students.StudentRepository") as MockRepo:
            MockRepo.return_value.get_by_id = AsyncMock(return_value=None)

            service = StudentService(AsyncMock())
            with pytest.raises(HTTPException) as exc_info:
                await service.delete_student("ghost-id")

        assert exc_info.value.status_code == 404


# ═══════════════════════════════════════════════════════════════════════════════
# Edge Case 3: Timezone-naive datetime rejection
# ═══════════════════════════════════════════════════════════════════════════════

class TestTimezoneAwareDatetime:
    """
    Naive datetimes (without timezone) cause TypeError on comparison with
    aware datetimes (e.g. from PostgreSQL TIMESTAMPTZ). Pydantic rejects
    them at the schema boundary so the bug never reaches the DB layer.
    """

    def test_naive_datetime_rejected_in_lesson_create(self):
        with pytest.raises(ValidationError) as exc_info:
            LessonCreate(
                date=datetime(2026, 4, 1, 10, 0),  # no tzinfo!
                tag="Индивидуальное",
            )
        errors = exc_info.value.errors()
        assert any("timezone" in str(e["msg"]).lower() for e in errors)

    def test_aware_datetime_accepted(self):
        lesson = LessonCreate(
            date=datetime(2026, 4, 1, 10, 0, tzinfo=timezone.utc),
            tag="Индивидуальное",
        )
        assert lesson.date.tzinfo is not None

    def test_iso_string_with_z_suffix_accepted(self):
        """'2026-04-01T10:00:00Z' — standard ISO format with UTC indicator."""
        lesson = LessonCreate.model_validate(
            {"date": "2026-04-01T10:00:00Z", "tag": "Индивидуальное"}
        )
        assert lesson.date.tzinfo is not None

    def test_iso_string_without_tz_rejected(self):
        with pytest.raises(ValidationError) as exc_info:
            LessonCreate.model_validate(
                {"date": "2026-04-01T10:00:00", "tag": "Индивидуальное"}
            )
        errors = exc_info.value.errors()
        assert any("timezone" in str(e["msg"]).lower() for e in errors)

    def test_naive_datetime_rejected_in_lesson_update(self):
        with pytest.raises(ValidationError):
            LessonUpdate(
                date=datetime(2026, 4, 1, 10, 0),  # naive
                tag="Индивидуальное",
            )

    def test_date_range_query_from_after_to_raises(self):
        """date_from >= date_to must be rejected."""
        with pytest.raises(ValidationError) as exc_info:
            LessonDateRangeQuery(
                date_from=datetime(2026, 12, 31, tzinfo=timezone.utc),
                date_to=datetime(2026, 1, 1, tzinfo=timezone.utc),
            )
        errors = exc_info.value.errors()
        assert any("date_from" in str(e["msg"]).lower() or "earlier" in str(e["msg"]).lower()
                   for e in errors)

    def test_date_range_query_valid(self):
        q = LessonDateRangeQuery(
            date_from=datetime(2026, 1, 1, tzinfo=timezone.utc),
            date_to=datetime(2026, 12, 31, tzinfo=timezone.utc),
        )
        assert q.date_from < q.date_to
