from uuid import uuid4

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.lesson import LessonStudent
from ..models.student import Student
from ..repositories.students import StudentRepository
from ..schemas.students import StudentCreate, StudentUpdate


class StudentService:
    def __init__(self, db: AsyncSession) -> None:
        self.repo = StudentRepository(db)

    async def list_students(self) -> list[Student]:
        return await self.repo.get_all()

    async def get_student(self, student_id: str) -> Student:
        student = await self.repo.get_by_id(student_id)
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Student not found"
            )
        return student

    async def create_student(self, data: StudentCreate) -> Student:
        return await self.repo.create({"id": str(uuid4()), **data.model_dump()})

    async def update_student(self, student_id: str, data: StudentUpdate) -> Student:
        student = await self.repo.get_by_id(student_id)
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Student not found"
            )
        return await self.repo.update(student, data.model_dump())

    async def delete_student(self, student_id: str) -> None:
        """
        Edge Case 2: Student deletion with active lesson enrollments.

        The DB schema has ON DELETE CASCADE on LessonStudent.studentId, so deleting
        a student silently removes their entire lesson history — including past
        attendance records used for finance reporting.

        Solution: count active enrollments and return HTTP 409 with context.
        The caller (admin) must explicitly cancel all enrollments first,
        making the data loss intentional and visible.
        """
        student = await self.repo.get_by_id(student_id)
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Student not found"
            )

        # Count existing enrollments (future + past) for this student
        result = await self.db.execute(
            select(LessonStudent).where(LessonStudent.studentId == student_id)
        )
        enrollments = result.scalars().all()

        if enrollments:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    f"Cannot delete student: {len(enrollments)} lesson enrollment(s) exist. "
                    "Cancel all enrollments first via DELETE "
                    "/schedule/lessons/{{lessonId}}/enrollments/{{studentId}}."
                ),
            )

        await self.repo.delete(student)

    @property
    def db(self):
        return self.repo.db
