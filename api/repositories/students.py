from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.student import Student


class StudentRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_all(self) -> list[Student]:
        result = await self.db.execute(select(Student).order_by(Student.createdAt.desc()))
        return list(result.scalars().all())

    async def get_by_id(self, student_id: str) -> Student | None:
        return await self.db.get(Student, student_id)

    async def create(self, data: dict) -> Student:
        student = Student(**data)
        self.db.add(student)
        await self.db.flush()
        await self.db.refresh(student)
        return student

    async def update(self, student: Student, data: dict) -> Student:
        for key, value in data.items():
            setattr(student, key, value)
        await self.db.flush()
        await self.db.refresh(student)
        return student

    async def delete(self, student: Student) -> None:
        await self.db.delete(student)
        await self.db.flush()
