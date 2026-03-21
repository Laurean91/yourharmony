from fastapi import APIRouter, Depends

from ..controllers import students as ctrl
from ..dependencies import get_current_user
from ..schemas.students import StudentOut

router = APIRouter(
    prefix="/api/v1/students",
    tags=["students"],
    dependencies=[Depends(get_current_user)],  # all student endpoints require auth
)

router.get("", response_model=list[StudentOut])(ctrl.list_students)
router.get("/{student_id}", response_model=StudentOut)(ctrl.get_student)
router.post("", response_model=StudentOut, status_code=201)(ctrl.create_student)
router.put("/{student_id}", response_model=StudentOut)(ctrl.update_student)
router.delete("/{student_id}", status_code=204)(ctrl.delete_student)
