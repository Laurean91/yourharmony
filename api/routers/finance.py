from fastapi import APIRouter, Depends

from ..controllers import finance as ctrl
from ..dependencies import get_current_user
from ..schemas.finance import FinanceReport, FinanceStats, PricesOut, StudentFinanceReport

router = APIRouter(
    prefix="/api/v1/finance",
    tags=["finance"],
    dependencies=[Depends(get_current_user)],
)

router.get("/stats", response_model=FinanceStats)(ctrl.get_stats)
router.get("/prices", response_model=PricesOut)(ctrl.get_prices)
router.patch("/prices", response_model=PricesOut)(ctrl.update_prices)
router.get("/report", response_model=FinanceReport)(ctrl.get_report)
router.get("/students/{student_id}/report", response_model=StudentFinanceReport)(ctrl.get_student_report)
