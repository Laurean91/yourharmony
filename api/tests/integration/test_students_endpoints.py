"""Integration tests for /api/v1/students endpoints."""

import pytest
from httpx import AsyncClient

from api.models.student import Student


class TestStudentsAuth:
    async def test_list_students_unauthenticated_returns_401(self, client: AsyncClient):
        resp = await client.get("/api/v1/students")
        assert resp.status_code == 401

    async def test_get_student_unauthenticated_returns_401(self, client: AsyncClient):
        resp = await client.get("/api/v1/students/some-id")
        assert resp.status_code == 401


class TestStudentsCRUD:
    async def test_list_students(
        self, client: AsyncClient, auth_headers: dict, student: Student
    ):
        resp = await client.get("/api/v1/students", headers=auth_headers)
        assert resp.status_code == 200
        ids = [s["id"] for s in resp.json()]
        assert student.id in ids

    async def test_get_student_by_id(
        self, client: AsyncClient, auth_headers: dict, student: Student
    ):
        resp = await client.get(f"/api/v1/students/{student.id}", headers=auth_headers)
        assert resp.status_code == 200
        body = resp.json()
        assert body["id"] == student.id
        assert body["name"] == student.name
        assert body["age"] == student.age

    async def test_get_student_not_found(
        self, client: AsyncClient, auth_headers: dict
    ):
        resp = await client.get(
            "/api/v1/students/nonexistent-id", headers=auth_headers
        )
        assert resp.status_code == 404

    async def test_create_student_success(
        self, client: AsyncClient, auth_headers: dict
    ):
        resp = await client.post(
            "/api/v1/students",
            json={
                "name": "Новый Ученик",
                "age": 9,
                "phone": "+79001234567",
                "tag": "Групповое",
            },
            headers=auth_headers,
        )
        assert resp.status_code == 201
        body = resp.json()
        assert body["name"] == "Новый Ученик"
        assert body["age"] == 9
        assert "id" in body
        assert "createdAt" in body

    async def test_create_student_missing_name_returns_422(
        self, client: AsyncClient, auth_headers: dict
    ):
        resp = await client.post(
            "/api/v1/students",
            json={"age": 10, "tag": "Индивидуальное"},
            headers=auth_headers,
        )
        assert resp.status_code == 422

    async def test_create_student_invalid_age_returns_422(
        self, client: AsyncClient, auth_headers: dict
    ):
        resp = await client.post(
            "/api/v1/students",
            json={"name": "Test", "age": 200, "tag": "Индивидуальное"},  # age > 99
            headers=auth_headers,
        )
        assert resp.status_code == 422

    async def test_update_student(
        self, client: AsyncClient, auth_headers: dict, student: Student
    ):
        resp = await client.put(
            f"/api/v1/students/{student.id}",
            json={"name": "Обновлённое Имя", "age": 11, "tag": "Групповое"},
            headers=auth_headers,
        )
        assert resp.status_code == 200
        assert resp.json()["name"] == "Обновлённое Имя"
        assert resp.json()["age"] == 11

    async def test_update_nonexistent_student_returns_404(
        self, client: AsyncClient, auth_headers: dict
    ):
        resp = await client.put(
            "/api/v1/students/nonexistent-id",
            json={"name": "X", "tag": "Y"},
            headers=auth_headers,
        )
        assert resp.status_code == 404

    async def test_delete_student(
        self, client: AsyncClient, auth_headers: dict, student: Student
    ):
        resp = await client.delete(
            f"/api/v1/students/{student.id}", headers=auth_headers
        )
        assert resp.status_code == 204
        # Verify deleted
        get_resp = await client.get(
            f"/api/v1/students/{student.id}", headers=auth_headers
        )
        assert get_resp.status_code == 404

    async def test_delete_nonexistent_student_returns_404(
        self, client: AsyncClient, auth_headers: dict
    ):
        resp = await client.delete(
            "/api/v1/students/nonexistent-id", headers=auth_headers
        )
        assert resp.status_code == 404
