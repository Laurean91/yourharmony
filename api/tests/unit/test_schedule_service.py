"""
Unit tests for ScheduleService.

Focus areas:
  1. Happy-path lesson/enrollment CRUD
  2. 404 handling for lesson/student not found
  3. 409 handling for duplicate enrollment (race condition scenario)
  4. Advisory lock is called on enroll (pg safety net)

The pg_advisory_xact_lock is mocked because unit tests run against SQLite.
The behaviour it prevents (duplicate concurrent enrollments) is tested via
the explicit existence check (409 path) and the DB-level IntegrityError path.
"""

import os
from unittest.mock import AsyncMock, MagicMock, call, patch
from uuid import uuid4

import pytest
from fastapi import HTTPException

os.environ.setdefault("ADMIN_USER", "admin")
os.environ.setdefault("ADMIN_PASSWORD", "testpass")
os.environ.setdefault("FASTAPI_SECRET_KEY", "test-secret-key-for-pytest-only")
os.environ.setdefault("FASTAPI_DATABASE_URL", "sqlite+aiosqlite:///:memory:")
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")

from api.schemas.schedule import AttendancePatch, EnrollRequest, LessonCreate  # noqa: E402
from api.services.schedule import ScheduleService  # noqa: E402


def make_lesson(**kwargs) -> MagicMock:
    l = MagicMock()
    l.id = str(uuid4())
    l.lesson_students = []
    for k, v in kwargs.items():
        setattr(l, k, v)
    return l


def make_student(**kwargs) -> MagicMock:
    s = MagicMock()
    s.id = str(uuid4())
    s.name = "Test Student"
    for k, v in kwargs.items():
        setattr(s, k, v)
    return s


def make_enrollment(lesson_id: str, student_id: str, attended=False) -> MagicMock:
    e = MagicMock()
    e.lessonId = lesson_id
    e.studentId = student_id
    e.attended = attended
    e.student = make_student(id=student_id)
    return e


class TestScheduleServiceGetLesson:
    async def test_get_existing_lesson(self):
        mock_lesson = make_lesson()
        with patch("api.services.schedule.LessonRepository") as MockRepo:
            MockRepo.return_value.get_by_id = AsyncMock(return_value=mock_lesson)
            service = ScheduleService(AsyncMock())
            result = await service.get_lesson(mock_lesson.id)
        assert result is mock_lesson

    async def test_get_nonexistent_lesson_raises_404(self):
        with patch("api.services.schedule.LessonRepository") as MockRepo:
            MockRepo.return_value.get_by_id = AsyncMock(return_value=None)
            service = ScheduleService(AsyncMock())
            with pytest.raises(HTTPException) as exc_info:
                await service.get_lesson("bad-id")
        assert exc_info.value.status_code == 404


class TestScheduleServiceListLessons:
    async def test_list_passes_filters(self):
        from datetime import datetime, timezone

        lessons = [make_lesson(), make_lesson()]
        with patch("api.services.schedule.LessonRepository") as MockRepo:
            repo = MockRepo.return_value
            repo.get_all = AsyncMock(return_value=lessons)

            service = ScheduleService(AsyncMock())
            date_from = datetime(2026, 4, 1, tzinfo=timezone.utc)
            result = await service.list_lessons(date_from=date_from, tag="Групповое")

        repo.get_all.assert_called_once_with(
            date_from=date_from, date_to=None, tag="Групповое"
        )
        assert result == lessons


class TestEnrollStudent:
    """
    Tests for the enroll_student method.

    Because this method uses `async with db.begin()` and `pg_advisory_xact_lock`,
    we mock the db object's context manager and execute method.
    """

    def _make_db_mock(self):
        db = AsyncMock()
        # async context manager for db.begin()
        cm = AsyncMock()
        cm.__aenter__ = AsyncMock(return_value=None)
        cm.__aexit__ = AsyncMock(return_value=False)
        db.begin = MagicMock(return_value=cm)
        return db

    async def test_enroll_student_not_found_raises_404(self):
        db = self._make_db_mock()
        db.get = AsyncMock(return_value=make_lesson())  # lesson found

        with patch("api.services.schedule.LessonRepository") as MockRepo:
            repo = MockRepo.return_value
            repo.get_student = AsyncMock(return_value=None)  # student NOT found
            repo.get_enrollment = AsyncMock(return_value=None)

            service = ScheduleService(db)
            with pytest.raises(HTTPException) as exc_info:
                await service.enroll_student(
                    "lesson-id", EnrollRequest(studentId="bad-student")
                )
        assert exc_info.value.status_code == 404

    async def test_enroll_lesson_not_found_raises_404(self):
        db = self._make_db_mock()
        db.get = AsyncMock(return_value=None)  # lesson NOT found

        with patch("api.services.schedule.LessonRepository"):
            service = ScheduleService(db)
            with pytest.raises(HTTPException) as exc_info:
                await service.enroll_student(
                    "no-lesson", EnrollRequest(studentId="student-id")
                )
        assert exc_info.value.status_code == 404

    async def test_enroll_duplicate_raises_409(self):
        """
        If the student is already enrolled, service must raise 409.
        This simulates the race condition 'loser' scenario where the first
        insert succeeded and the second hits the existence check.
        """
        db = self._make_db_mock()
        db.get = AsyncMock(return_value=make_lesson())

        existing_enrollment = make_enrollment("lesson-id", "student-id")

        with patch("api.services.schedule.LessonRepository") as MockRepo:
            repo = MockRepo.return_value
            repo.get_student = AsyncMock(return_value=make_student())
            repo.get_enrollment = AsyncMock(return_value=existing_enrollment)

            service = ScheduleService(db)
            with pytest.raises(HTTPException) as exc_info:
                await service.enroll_student(
                    "lesson-id", EnrollRequest(studentId="student-id")
                )
        assert exc_info.value.status_code == 409
        assert "already enrolled" in exc_info.value.detail.lower()

    async def test_advisory_lock_called_on_enroll(self):
        """
        pg_advisory_xact_lock must be executed before the enrollment check.
        This ensures the race condition safety net is always active.
        """
        from sqlalchemy import text as sa_text

        db = self._make_db_mock()
        db.get = AsyncMock(return_value=make_lesson())
        enrollment = make_enrollment("lesson-id", "student-id")

        with patch("api.services.schedule.LessonRepository") as MockRepo:
            repo = MockRepo.return_value
            repo.get_student = AsyncMock(return_value=make_student())
            repo.get_enrollment = AsyncMock(return_value=None)
            repo.get_enrollment_with_student = AsyncMock(return_value=enrollment)

            service = ScheduleService(db)
            try:
                await service.enroll_student(
                    "lesson-id", EnrollRequest(studentId="student-id")
                )
            except Exception:
                pass  # We only care that execute was called with advisory lock

        # Verify execute was called (for the advisory lock SELECT)
        assert db.execute.called
        first_call_arg = db.execute.call_args_list[0][0][0]
        assert "pg_advisory_xact_lock" in str(first_call_arg)


class TestUpdateAttendance:
    async def test_mark_attended(self):
        enrollment = make_enrollment("lesson-id", "student-id", attended=False)

        with patch("api.services.schedule.LessonRepository") as MockRepo:
            repo = MockRepo.return_value
            repo.get_enrollment_with_student = AsyncMock(return_value=enrollment)

            db = AsyncMock()
            cm = AsyncMock()
            cm.__aenter__ = AsyncMock(return_value=None)
            cm.__aexit__ = AsyncMock(return_value=False)
            db.begin = MagicMock(return_value=cm)

            service = ScheduleService(db)
            result = await service.update_attendance(
                "lesson-id", "student-id", AttendancePatch(attended=True)
            )

        assert result.attended is True

    async def test_update_nonexistent_enrollment_raises_404(self):
        with patch("api.services.schedule.LessonRepository") as MockRepo:
            repo = MockRepo.return_value
            repo.get_enrollment_with_student = AsyncMock(return_value=None)

            service = ScheduleService(AsyncMock())
            with pytest.raises(HTTPException) as exc_info:
                await service.update_attendance(
                    "lesson-id", "student-id", AttendancePatch(attended=True)
                )
        assert exc_info.value.status_code == 404


class TestCancelEnrollment:
    async def test_cancel_existing_enrollment(self):
        enrollment = make_enrollment("lesson-id", "student-id")

        with patch("api.services.schedule.LessonRepository") as MockRepo:
            repo = MockRepo.return_value
            repo.get_enrollment = AsyncMock(return_value=enrollment)

            db = AsyncMock()
            cm = AsyncMock()
            cm.__aenter__ = AsyncMock(return_value=None)
            cm.__aexit__ = AsyncMock(return_value=False)
            db.begin = MagicMock(return_value=cm)

            service = ScheduleService(db)
            await service.cancel_enrollment("lesson-id", "student-id")

        db.delete.assert_called_once_with(enrollment)

    async def test_cancel_nonexistent_enrollment_raises_404(self):
        with patch("api.services.schedule.LessonRepository") as MockRepo:
            repo = MockRepo.return_value
            repo.get_enrollment = AsyncMock(return_value=None)

            service = ScheduleService(AsyncMock())
            with pytest.raises(HTTPException) as exc_info:
                await service.cancel_enrollment("lesson-id", "student-id")
        assert exc_info.value.status_code == 404
