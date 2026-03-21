from datetime import datetime
from typing import Optional

from fastapi import Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from ..dependencies import get_db
from ..schemas.schedule import (
    AttendancePatch,
    EnrollmentOut,
    EnrollRequest,
    LessonCreate,
    LessonOut,
    LessonUpdate,
)
from ..services.schedule import ScheduleService


async def list_lessons(
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    tag: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
) -> list[LessonOut]:
    service = ScheduleService(db)
    lessons = await service.list_lessons(date_from=date_from, date_to=date_to, tag=tag)
    return [_lesson_out(lesson) for lesson in lessons]


async def get_lesson(lesson_id: str, db: AsyncSession = Depends(get_db)) -> LessonOut:
    service = ScheduleService(db)
    lesson = await service.get_lesson(lesson_id)
    return _lesson_out(lesson)


async def create_lesson(
    data: LessonCreate, db: AsyncSession = Depends(get_db)
) -> LessonOut:
    service = ScheduleService(db)
    lesson = await service.create_lesson(data)
    return _lesson_out(lesson)


async def update_lesson(
    lesson_id: str, data: LessonUpdate, db: AsyncSession = Depends(get_db)
) -> LessonOut:
    service = ScheduleService(db)
    lesson = await service.update_lesson(lesson_id, data)
    return _lesson_out(lesson)


async def delete_lesson(
    lesson_id: str, db: AsyncSession = Depends(get_db)
) -> None:
    service = ScheduleService(db)
    await service.delete_lesson(lesson_id)


async def enroll_student(
    lesson_id: str, data: EnrollRequest, db: AsyncSession = Depends(get_db)
) -> EnrollmentOut:
    service = ScheduleService(db)
    enrollment = await service.enroll_student(lesson_id, data)
    return EnrollmentOut.model_validate(enrollment)


async def update_attendance(
    lesson_id: str,
    student_id: str,
    data: AttendancePatch,
    db: AsyncSession = Depends(get_db),
) -> EnrollmentOut:
    service = ScheduleService(db)
    enrollment = await service.update_attendance(lesson_id, student_id, data)
    return EnrollmentOut.model_validate(enrollment)


async def cancel_enrollment(
    lesson_id: str,
    student_id: str,
    db: AsyncSession = Depends(get_db),
) -> None:
    service = ScheduleService(db)
    await service.cancel_enrollment(lesson_id, student_id)


def _lesson_out(lesson) -> LessonOut:
    """Map Lesson ORM + lesson_students relationship to LessonOut schema."""
    enrollments = [
        EnrollmentOut.model_validate(ls) for ls in lesson.lesson_students
    ]
    data = LessonOut.model_validate(lesson)
    data.enrollments = enrollments
    return data
