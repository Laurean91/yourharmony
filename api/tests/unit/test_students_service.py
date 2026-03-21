"""Unit tests for StudentService — mocked repositories."""

import os
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

import pytest
from fastapi import HTTPException

os.environ.setdefault("ADMIN_USER", "admin")
os.environ.setdefault("ADMIN_PASSWORD", "testpass")
os.environ.setdefault("FASTAPI_SECRET_KEY", "test-secret-key-for-pytest-only")
os.environ.setdefault("FASTAPI_DATABASE_URL", "sqlite+aiosqlite:///:memory:")
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")

from api.schemas.students import StudentCreate, StudentUpdate  # noqa: E402
from api.services.students import StudentService  # noqa: E402


def make_mock_student(**kwargs) -> MagicMock:
    s = MagicMock()
    s.id = str(uuid4())
    s.name = kwargs.get("name", "Иван Иванов")
    s.age = kwargs.get("age", 10)
    s.phone = kwargs.get("phone", None)
    s.tag = kwargs.get("tag", "Индивидуальное")
    s.notes = kwargs.get("notes", None)
    return s


class TestStudentServiceList:
    async def test_list_returns_all_students(self):
        students = [make_mock_student(), make_mock_student()]
        with patch("api.services.students.StudentRepository") as MockRepo:
            MockRepo.return_value.get_all = AsyncMock(return_value=students)
            service = StudentService(AsyncMock())
            result = await service.list_students()
        assert result == students
        assert len(result) == 2


class TestStudentServiceGet:
    async def test_get_existing_student(self):
        mock_student = make_mock_student()
        with patch("api.services.students.StudentRepository") as MockRepo:
            MockRepo.return_value.get_by_id = AsyncMock(return_value=mock_student)
            service = StudentService(AsyncMock())
            result = await service.get_student(mock_student.id)
        assert result is mock_student

    async def test_get_nonexistent_student_raises_404(self):
        with patch("api.services.students.StudentRepository") as MockRepo:
            MockRepo.return_value.get_by_id = AsyncMock(return_value=None)
            service = StudentService(AsyncMock())
            with pytest.raises(HTTPException) as exc_info:
                await service.get_student("no-such-id")
        assert exc_info.value.status_code == 404


class TestStudentServiceCreate:
    async def test_create_assigns_uuid(self):
        mock_student = make_mock_student()
        with patch("api.services.students.StudentRepository") as MockRepo:
            repo = MockRepo.return_value
            repo.create = AsyncMock(return_value=mock_student)

            service = StudentService(AsyncMock())
            data = StudentCreate(name="Новый Ученик", tag="Групповое")
            await service.create_student(data)

        call_data = repo.create.call_args[0][0]
        assert "id" in call_data  # UUID assigned
        assert call_data["name"] == "Новый Ученик"

    async def test_create_with_all_fields(self):
        mock_student = make_mock_student(name="Анна", age=8, phone="+79001111111")
        with patch("api.services.students.StudentRepository") as MockRepo:
            MockRepo.return_value.create = AsyncMock(return_value=mock_student)
            service = StudentService(AsyncMock())
            data = StudentCreate(name="Анна", age=8, phone="+79001111111")
            result = await service.create_student(data)
        assert result is mock_student


class TestStudentServiceUpdate:
    async def test_update_success(self):
        mock_student = make_mock_student()
        updated = make_mock_student(name="Новое Имя")
        with patch("api.services.students.StudentRepository") as MockRepo:
            repo = MockRepo.return_value
            repo.get_by_id = AsyncMock(return_value=mock_student)
            repo.update = AsyncMock(return_value=updated)

            service = StudentService(AsyncMock())
            result = await service.update_student(
                mock_student.id, StudentUpdate(name="Новое Имя", tag="Индивидуальное")
            )
        assert result is updated

    async def test_update_nonexistent_raises_404(self):
        with patch("api.services.students.StudentRepository") as MockRepo:
            MockRepo.return_value.get_by_id = AsyncMock(return_value=None)
            service = StudentService(AsyncMock())
            with pytest.raises(HTTPException) as exc_info:
                await service.update_student("bad-id", StudentUpdate(name="X", tag="Y"))
        assert exc_info.value.status_code == 404


class TestStudentServiceDelete:
    async def test_delete_success(self):
        mock_student = make_mock_student()
        with patch("api.services.students.StudentRepository") as MockRepo:
            repo = MockRepo.return_value
            repo.get_by_id = AsyncMock(return_value=mock_student)
            repo.delete = AsyncMock()

            service = StudentService(AsyncMock())
            await service.delete_student(mock_student.id)

        repo.delete.assert_called_once_with(mock_student)

    async def test_delete_nonexistent_raises_404(self):
        with patch("api.services.students.StudentRepository") as MockRepo:
            MockRepo.return_value.get_by_id = AsyncMock(return_value=None)
            service = StudentService(AsyncMock())
            with pytest.raises(HTTPException) as exc_info:
                await service.delete_student("no-such-id")
        assert exc_info.value.status_code == 404
