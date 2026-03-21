from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ..dependencies import get_db
from ..schemas.students import StudentCreate, StudentOut, StudentUpdate
from ..services.students import StudentService


async def list_students(db: AsyncSession = Depends(get_db)) -> list[StudentOut]:
    service = StudentService(db)
    students = await service.list_students()
    return [StudentOut.model_validate(s) for s in students]


async def get_student(student_id: str, db: AsyncSession = Depends(get_db)) -> StudentOut:
    service = StudentService(db)
    student = await service.get_student(student_id)
    return StudentOut.model_validate(student)


async def create_student(
    data: StudentCreate, db: AsyncSession = Depends(get_db)
) -> StudentOut:
    async with db.begin():
        service = StudentService(db)
        student = await service.create_student(data)
    return StudentOut.model_validate(student)


async def update_student(
    student_id: str, data: StudentUpdate, db: AsyncSession = Depends(get_db)
) -> StudentOut:
    async with db.begin():
        service = StudentService(db)
        student = await service.update_student(student_id, data)
    return StudentOut.model_validate(student)


async def delete_student(
    student_id: str, db: AsyncSession = Depends(get_db)
) -> None:
    async with db.begin():
        service = StudentService(db)
        await service.delete_student(student_id)
