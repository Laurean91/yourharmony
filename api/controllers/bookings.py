from typing import Optional

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ..dependencies import get_db
from ..schemas.bookings import BookingCountOut, BookingOut, BookingStatusUpdate
from ..services.bookings import BookingService


async def list_bookings(
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
) -> list[BookingOut]:
    service = BookingService(db)
    bookings = await service.list_bookings(status)
    return [BookingOut.model_validate(b) for b in bookings]


async def count_new(db: AsyncSession = Depends(get_db)) -> BookingCountOut:
    service = BookingService(db)
    count = await service.count_new()
    return BookingCountOut(count=count)


async def update_status(
    booking_id: str,
    data: BookingStatusUpdate,
    db: AsyncSession = Depends(get_db),
) -> BookingOut:
    async with db.begin():
        service = BookingService(db)
        booking = await service.update_status(booking_id, data)
    return BookingOut.model_validate(booking)


async def delete_booking(
    booking_id: str,
    db: AsyncSession = Depends(get_db),
) -> None:
    async with db.begin():
        service = BookingService(db)
        await service.delete_booking(booking_id)
