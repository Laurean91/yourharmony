from datetime import datetime
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..models.lesson import Lesson, LessonStudent
from ..models.student import Student


class LessonRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_all(
        self,
        *,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
        tag: Optional[str] = None,
    ) -> list[Lesson]:
        q = (
            select(Lesson)
            .options(
                selectinload(Lesson.lesson_students).selectinload(LessonStudent.student)
            )
            .order_by(Lesson.date)
        )
        if date_from:
            q = q.where(Lesson.date >= date_from)
        if date_to:
            q = q.where(Lesson.date <= date_to)
        if tag:
            q = q.where(Lesson.tag == tag)
        result = await self.db.execute(q)
        return list(result.scalars().all())

    async def get_by_id(self, lesson_id: str) -> Lesson | None:
        result = await self.db.execute(
            select(Lesson)
            .options(
                selectinload(Lesson.lesson_students).selectinload(LessonStudent.student)
            )
            .where(Lesson.id == lesson_id)
        )
        return result.scalar_one_or_none()

    async def create(self, data: dict) -> Lesson:
        lesson = Lesson(**data)
        self.db.add(lesson)
        await self.db.flush()
        return lesson

    async def update(self, lesson: Lesson, data: dict) -> Lesson:
        for key, value in data.items():
            setattr(lesson, key, value)
        await self.db.flush()
        return lesson

    async def delete(self, lesson: Lesson) -> None:
        await self.db.delete(lesson)
        await self.db.flush()

    async def get_enrollment(
        self, lesson_id: str, student_id: str
    ) -> LessonStudent | None:
        result = await self.db.execute(
            select(LessonStudent).where(
                LessonStudent.lessonId == lesson_id,
                LessonStudent.studentId == student_id,
            )
        )
        return result.scalar_one_or_none()

    async def get_enrollment_with_student(
        self, lesson_id: str, student_id: str
    ) -> LessonStudent | None:
        result = await self.db.execute(
            select(LessonStudent)
            .options(selectinload(LessonStudent.student))
            .where(
                LessonStudent.lessonId == lesson_id,
                LessonStudent.studentId == student_id,
            )
        )
        return result.scalar_one_or_none()

    async def get_student(self, student_id: str) -> Student | None:
        return await self.db.get(Student, student_id)
