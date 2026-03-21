from fastapi import APIRouter, Depends

from ..controllers import schedule as ctrl
from ..dependencies import get_current_user
from ..schemas.schedule import EnrollmentOut, LessonOut

router = APIRouter(
    prefix="/api/v1/schedule",
    tags=["schedule"],
    dependencies=[Depends(get_current_user)],  # all schedule endpoints require auth
)

router.get("/lessons", response_model=list[LessonOut])(ctrl.list_lessons)
router.get("/lessons/{lesson_id}", response_model=LessonOut)(ctrl.get_lesson)
router.post("/lessons", response_model=LessonOut, status_code=201)(ctrl.create_lesson)
router.put("/lessons/{lesson_id}", response_model=LessonOut)(ctrl.update_lesson)
router.delete("/lessons/{lesson_id}", status_code=204)(ctrl.delete_lesson)

router.post(
    "/lessons/{lesson_id}/enroll",
    response_model=EnrollmentOut,
    status_code=201,
)(ctrl.enroll_student)
router.patch(
    "/lessons/{lesson_id}/enrollments/{student_id}",
    response_model=EnrollmentOut,
)(ctrl.update_attendance)
router.delete(
    "/lessons/{lesson_id}/enrollments/{student_id}",
    status_code=204,
)(ctrl.cancel_enrollment)
