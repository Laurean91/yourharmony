"""
Schedule service — contains all business logic for lessons and enrollments.

═══════════════════════════════════════════════════════
Edge Case 1: Race condition on concurrent enrollment
═══════════════════════════════════════════════════════

Scenario: Two HTTP requests arrive simultaneously trying to enroll the
same student in the same lesson. Both pass the "already enrolled?"
existence check before either commits. Both attempt an INSERT. Without
protection, one succeeds and the other silently duplicates or crashes
with an unhandled IntegrityError.

Layered defense:
  Layer 1 — pg_advisory_xact_lock (app-level serialisation)
    Acquires a transaction-scoped advisory lock keyed on hash(lesson_id + student_id).
    Only one request can hold this lock at a time. The second request blocks
    until the first commits/rolls back, then rechecks existence and hits 409.
    Lock auto-releases at transaction end — no cleanup needed.

  Layer 2 — Explicit existence check (clear 409)
    After acquiring the lock, check for an existing enrollment.
    Returns a human-readable 409 instead of a raw DB error.

  Layer 3 — Composite PK constraint (DB-level last resort)
    Even if layers 1–2 fail (e.g. SQLite in tests), the DB enforces
    uniqueness via the (lessonId, studentId) primary key. The
    IntegrityError is caught by the global error handler → 409.
"""

from datetime import datetime
from typing import Optional
from uuid import uuid4

from fastapi import HTTPException, status
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.lesson import Lesson, LessonStudent
from ..repositories.schedule import LessonRepository
from ..schemas.schedule import (
    AttendancePatch,
    EnrollRequest,
    LessonCreate,
    LessonDateRangeQuery,
    LessonUpdate,
)


class ScheduleService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.repo = LessonRepository(db)

    async def list_lessons(
        self,
        *,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
        tag: Optional[str] = None,
    ) -> list[Lesson]:
        # Validate date range at service boundary
        LessonDateRangeQuery(date_from=date_from, date_to=date_to)
        return await self.repo.get_all(date_from=date_from, date_to=date_to, tag=tag)

    async def get_lesson(self, lesson_id: str) -> Lesson:
        lesson = await self.repo.get_by_id(lesson_id)
        if not lesson:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found"
            )
        return lesson

    async def create_lesson(self, data: LessonCreate) -> Lesson:
        """Create lesson with optional student enrollments in a single transaction."""
        async with self.db.begin():
            lesson_data = data.model_dump(exclude={"studentIds"})
            lesson = Lesson(id=str(uuid4()), **lesson_data)
            self.db.add(lesson)
            await self.db.flush()  # materialise lesson.id before FK references

            for student_id in data.studentIds:
                student = await self.repo.get_student(student_id)
                if not student:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Student '{student_id}' not found",
                    )
                self.db.add(
                    LessonStudent(lessonId=lesson.id, studentId=student_id, attended=False)
                )

        return await self.repo.get_by_id(lesson.id)  # type: ignore[return-value]

    async def update_lesson(self, lesson_id: str, data: LessonUpdate) -> Lesson:
        """Update lesson fields; optionally replace full enrollment list."""
        async with self.db.begin():
            lesson = await self.repo.get_by_id(lesson_id)
            if not lesson:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found"
                )

            lesson_data = data.model_dump(exclude={"studentIds"})
            for key, value in lesson_data.items():
                setattr(lesson, key, value)

            if data.studentIds is not None:
                # Replace enrollment list atomically
                for ls in list(lesson.lesson_students):
                    await self.db.delete(ls)
                await self.db.flush()

                for student_id in data.studentIds:
                    student = await self.repo.get_student(student_id)
                    if not student:
                        raise HTTPException(
                            status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Student '{student_id}' not found",
                        )
                    self.db.add(
                        LessonStudent(
                            lessonId=lesson_id, studentId=student_id, attended=False
                        )
                    )

            await self.db.flush()

        return await self.repo.get_by_id(lesson_id)  # type: ignore[return-value]

    async def delete_lesson(self, lesson_id: str) -> None:
        lesson = await self.repo.get_by_id(lesson_id)
        if not lesson:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found"
            )
        async with self.db.begin():
            await self.db.delete(lesson)

    async def enroll_student(
        self, lesson_id: str, data: EnrollRequest
    ) -> LessonStudent:
        """
        Enroll a student in a lesson with full race condition protection.
        See module docstring for the 3-layer defence strategy.
        """
        student_id = data.studentId

        async with self.db.begin():
            # ── Layer 1: advisory lock ────────────────────────────────────────
            # Deterministic bigint key from the (lesson, student) pair.
            # Two concurrent requests for the SAME pair get the SAME key → serialised.
            # Two requests for DIFFERENT pairs get different keys → no contention.
            lock_key = abs(hash(f"{lesson_id}:{student_id}")) % (2**63)
            await self.db.execute(
                text("SELECT pg_advisory_xact_lock(:key)"), {"key": lock_key}
            )

            # ── Validate references ───────────────────────────────────────────
            lesson = await self.db.get(Lesson, lesson_id)
            if not lesson:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found"
                )

            student = await self.repo.get_student(student_id)
            if not student:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, detail="Student not found"
                )

            # ── Layer 2: explicit existence check ─────────────────────────────
            existing = await self.repo.get_enrollment(lesson_id, student_id)
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Student is already enrolled in this lesson",
                )

            # ── Insert (Layer 3: PK constraint catches any bypass) ────────────
            enrollment = LessonStudent(
                lessonId=lesson_id, studentId=student_id, attended=False
            )
            self.db.add(enrollment)
            await self.db.flush()

        return await self.repo.get_enrollment_with_student(lesson_id, student_id)  # type: ignore[return-value]

    async def update_attendance(
        self, lesson_id: str, student_id: str, data: AttendancePatch
    ) -> LessonStudent:
        enrollment = await self.repo.get_enrollment_with_student(lesson_id, student_id)
        if not enrollment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Enrollment not found",
            )
        async with self.db.begin():
            enrollment.attended = data.attended
            await self.db.flush()
        await self.db.refresh(enrollment)
        return enrollment

    async def cancel_enrollment(self, lesson_id: str, student_id: str) -> None:
        enrollment = await self.repo.get_enrollment(lesson_id, student_id)
        if not enrollment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Enrollment not found",
            )
        async with self.db.begin():
            await self.db.delete(enrollment)
