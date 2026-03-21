from fastapi import APIRouter, Depends

from ..controllers import bookings as ctrl
from ..dependencies import get_current_user
from ..schemas.bookings import BookingCountOut, BookingOut, BookingStatusUpdate

router = APIRouter(
    prefix="/api/v1/bookings",
    tags=["bookings"],
    dependencies=[Depends(get_current_user)],
)

router.get("", response_model=list[BookingOut])(ctrl.list_bookings)
router.get("/count", response_model=BookingCountOut)(ctrl.count_new)
router.patch("/{booking_id}/status", response_model=BookingOut)(ctrl.update_status)
router.delete("/{booking_id}", status_code=204)(ctrl.delete_booking)
