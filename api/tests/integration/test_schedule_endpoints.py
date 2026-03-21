"""
Integration tests for /api/v1/schedule endpoints.

Covers: lesson CRUD, enrollment, attendance, cancellation.
Race condition scenario is tested via duplicate enrollment attempt.
"""

import pytest
from httpx import AsyncClient

from api.models.lesson import Lesson, LessonStudent
from api.models.student import Student


LESSON_PAYLOAD = {
    "date": "2026-04-01T10:00:00Z",
    "title": "Урок фортепиано",
    "tag": "Индивидуальное",
    "price": 1500.0,
    "studentIds": [],
}


class TestScheduleAuth:
    async def test_list_lessons_unauthenticated_returns_401(self, client: AsyncClient):
        resp = await client.get("/api/v1/schedule/lessons")
        assert resp.status_code == 401


class TestLessonCRUD:
    async def test_list_lessons(
        self, client: AsyncClient, auth_headers: dict, lesson: Lesson
    ):
        resp = await client.get("/api/v1/schedule/lessons", headers=auth_headers)
        assert resp.status_code == 200
        ids = [l["id"] for l in resp.json()]
        assert lesson.id in ids

    async def test_list_lessons_date_filter(
        self, client: AsyncClient, auth_headers: dict, lesson: Lesson
    ):
        resp = await client.get(
            "/api/v1/schedule/lessons?date_from=2026-01-01T00:00:00Z&date_to=2026-12-31T00:00:00Z",
            headers=auth_headers,
        )
        assert resp.status_code == 200
        ids = [l["id"] for l in resp.json()]
        assert lesson.id in ids

    async def test_get_lesson_by_id(
        self, client: AsyncClient, auth_headers: dict, lesson: Lesson
    ):
        resp = await client.get(
            f"/api/v1/schedule/lessons/{lesson.id}", headers=auth_headers
        )
        assert resp.status_code == 200
        assert resp.json()["id"] == lesson.id
        assert resp.json()["title"] == lesson.title
        assert "enrollments" in resp.json()

    async def test_get_lesson_not_found(
        self, client: AsyncClient, auth_headers: dict
    ):
        resp = await client.get(
            "/api/v1/schedule/lessons/nonexistent-id", headers=auth_headers
        )
        assert resp.status_code == 404

    async def test_create_lesson_success(
        self, client: AsyncClient, auth_headers: dict
    ):
        resp = await client.post(
            "/api/v1/schedule/lessons",
            json=LESSON_PAYLOAD,
            headers=auth_headers,
        )
        assert resp.status_code == 201
        body = resp.json()
        assert body["title"] == "Урок фортепиано"
        assert body["price"] == 1500.0
        assert body["enrollments"] == []
        assert "id" in body

    async def test_create_lesson_with_students(
        self, client: AsyncClient, auth_headers: dict, student: Student
    ):
        payload = {**LESSON_PAYLOAD, "studentIds": [student.id]}
        resp = await client.post(
            "/api/v1/schedule/lessons",
            json=payload,
            headers=auth_headers,
        )
        assert resp.status_code == 201
        enrollments = resp.json()["enrollments"]
        student_ids = [e["studentId"] for e in enrollments]
        assert student.id in student_ids

    async def test_create_lesson_with_nonexistent_student_returns_404(
        self, client: AsyncClient, auth_headers: dict
    ):
        payload = {**LESSON_PAYLOAD, "studentIds": ["nonexistent-student-id"]}
        resp = await client.post(
            "/api/v1/schedule/lessons",
            json=payload,
            headers=auth_headers,
        )
        assert resp.status_code == 404

    async def test_create_lesson_missing_date_returns_422(
        self, client: AsyncClient, auth_headers: dict
    ):
        resp = await client.post(
            "/api/v1/schedule/lessons",
            json={"title": "No date"},
            headers=auth_headers,
        )
        assert resp.status_code == 422

    async def test_create_lesson_negative_price_returns_422(
        self, client: AsyncClient, auth_headers: dict
    ):
        resp = await client.post(
            "/api/v1/schedule/lessons",
            json={**LESSON_PAYLOAD, "price": -100},
            headers=auth_headers,
        )
        assert resp.status_code == 422

    async def test_update_lesson(
        self, client: AsyncClient, auth_headers: dict, lesson: Lesson
    ):
        resp = await client.put(
            f"/api/v1/schedule/lessons/{lesson.id}",
            json={**LESSON_PAYLOAD, "title": "Обновлённый урок", "price": 2000.0},
            headers=auth_headers,
        )
        assert resp.status_code == 200
        assert resp.json()["title"] == "Обновлённый урок"
        assert resp.json()["price"] == 2000.0

    async def test_delete_lesson(
        self, client: AsyncClient, auth_headers: dict, lesson: Lesson
    ):
        resp = await client.delete(
            f"/api/v1/schedule/lessons/{lesson.id}", headers=auth_headers
        )
        assert resp.status_code == 204
        get_resp = await client.get(
            f"/api/v1/schedule/lessons/{lesson.id}", headers=auth_headers
        )
        assert get_resp.status_code == 404


class TestEnrollment:
    async def test_enroll_student_success(
        self,
        client: AsyncClient,
        auth_headers: dict,
        lesson: Lesson,
        student: Student,
    ):
        resp = await client.post(
            f"/api/v1/schedule/lessons/{lesson.id}/enroll",
            json={"studentId": student.id},
            headers=auth_headers,
        )
        assert resp.status_code == 201
        body = resp.json()
        assert body["lessonId"] == lesson.id
        assert body["studentId"] == student.id
        assert body["attended"] is False

    async def test_enroll_same_student_twice_returns_409(
        self,
        client: AsyncClient,
        auth_headers: dict,
        lesson: Lesson,
        student: Student,
    ):
        """
        Simulates the race condition loser scenario:
        first enrollment succeeds, second hits the 409 guard.
        """
        await client.post(
            f"/api/v1/schedule/lessons/{lesson.id}/enroll",
            json={"studentId": student.id},
            headers=auth_headers,
        )
        resp = await client.post(
            f"/api/v1/schedule/lessons/{lesson.id}/enroll",
            json={"studentId": student.id},
            headers=auth_headers,
        )
        assert resp.status_code == 409

    async def test_enroll_nonexistent_lesson_returns_404(
        self, client: AsyncClient, auth_headers: dict, student: Student
    ):
        resp = await client.post(
            "/api/v1/schedule/lessons/nonexistent-id/enroll",
            json={"studentId": student.id},
            headers=auth_headers,
        )
        assert resp.status_code == 404

    async def test_enroll_nonexistent_student_returns_404(
        self, client: AsyncClient, auth_headers: dict, lesson: Lesson
    ):
        resp = await client.post(
            f"/api/v1/schedule/lessons/{lesson.id}/enroll",
            json={"studentId": "nonexistent-student"},
            headers=auth_headers,
        )
        assert resp.status_code == 404

    async def test_update_attendance(
        self,
        client: AsyncClient,
        auth_headers: dict,
        enrollment: LessonStudent,
    ):
        resp = await client.patch(
            f"/api/v1/schedule/lessons/{enrollment.lessonId}"
            f"/enrollments/{enrollment.studentId}",
            json={"attended": True},
            headers=auth_headers,
        )
        assert resp.status_code == 200
        assert resp.json()["attended"] is True

    async def test_update_attendance_nonexistent_returns_404(
        self, client: AsyncClient, auth_headers: dict, lesson: Lesson
    ):
        resp = await client.patch(
            f"/api/v1/schedule/lessons/{lesson.id}/enrollments/nonexistent-student",
            json={"attended": True},
            headers=auth_headers,
        )
        assert resp.status_code == 404

    async def test_cancel_enrollment(
        self,
        client: AsyncClient,
        auth_headers: dict,
        enrollment: LessonStudent,
    ):
        resp = await client.delete(
            f"/api/v1/schedule/lessons/{enrollment.lessonId}"
            f"/enrollments/{enrollment.studentId}",
            headers=auth_headers,
        )
        assert resp.status_code == 204
        # Verify it's gone
        patch_resp = await client.patch(
            f"/api/v1/schedule/lessons/{enrollment.lessonId}"
            f"/enrollments/{enrollment.studentId}",
            json={"attended": True},
            headers=auth_headers,
        )
        assert patch_resp.status_code == 404

    async def test_cancel_nonexistent_enrollment_returns_404(
        self, client: AsyncClient, auth_headers: dict, lesson: Lesson
    ):
        resp = await client.delete(
            f"/api/v1/schedule/lessons/{lesson.id}/enrollments/nonexistent-student",
            headers=auth_headers,
        )
        assert resp.status_code == 404

    async def test_multiple_students_can_enroll_same_lesson(
        self,
        client: AsyncClient,
        auth_headers: dict,
        lesson: Lesson,
        student: Student,
        student2: Student,
    ):
        """Different students enrolling the same lesson must both succeed."""
        r1 = await client.post(
            f"/api/v1/schedule/lessons/{lesson.id}/enroll",
            json={"studentId": student.id},
            headers=auth_headers,
        )
        r2 = await client.post(
            f"/api/v1/schedule/lessons/{lesson.id}/enroll",
            json={"studentId": student2.id},
            headers=auth_headers,
        )
        assert r1.status_code == 201
        assert r2.status_code == 201

    async def test_lesson_shows_enrollments(
        self,
        client: AsyncClient,
        auth_headers: dict,
        lesson: Lesson,
        student: Student,
    ):
        """After enrolling, GET lesson must include enrollment in the response."""
        await client.post(
            f"/api/v1/schedule/lessons/{lesson.id}/enroll",
            json={"studentId": student.id},
            headers=auth_headers,
        )
        resp = await client.get(
            f"/api/v1/schedule/lessons/{lesson.id}", headers=auth_headers
        )
        assert resp.status_code == 200
        student_ids = [e["studentId"] for e in resp.json()["enrollments"]]
        assert student.id in student_ids
