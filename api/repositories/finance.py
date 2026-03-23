from datetime import datetime
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..models.lesson import Lesson, LessonStudent
from ..models.site_settings import SiteSettings
from ..models.student import Student

DEFAULT_PRICE_INDIVIDUAL = 1500.0
DEFAULT_PRICE_GROUP = 800.0


class FinanceRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_prices(self) -> tuple[float, float]:
        result = await self.db.execute(
            select(SiteSettings).where(
                SiteSettings.key.in_(["price_individual", "price_group"])
            )
        )
        rows = {r.key: r.value for r in result.scalars().all()}
        individual = float(rows["price_individual"]) if "price_individual" in rows else DEFAULT_PRICE_INDIVIDUAL
        group = float(rows["price_group"]) if "price_group" in rows else DEFAULT_PRICE_GROUP
        return individual, group

    async def set_prices(self, individual: float, group: float) -> None:
        for key, value in [("price_individual", individual), ("price_group", group)]:
            row = await self.db.get(SiteSettings, key)
            if row:
                row.value = str(value)
            else:
                self.db.add(SiteSettings(key=key, value=str(value)))

    async def get_attended_lesson_students(
        self,
        date_from: datetime,
        date_to: datetime,
        student_id: Optional[str] = None,
    ) -> list[LessonStudent]:
        q = (
            select(LessonStudent)
            .join(LessonStudent.lesson)
            .options(
                selectinload(LessonStudent.lesson),
                selectinload(LessonStudent.student),
            )
            .where(
                LessonStudent.attended.is_(True),
                Lesson.date >= date_from,
                Lesson.date <= date_to,
            )
        )
        if student_id:
            q = q.where(LessonStudent.studentId == student_id)
        result = await self.db.execute(q)
        return list(result.scalars().all())

    async def get_student(self, student_id: str) -> Student | None:
        return await self.db.get(Student, student_id)
