from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.booking import Booking
from ..repositories.bookings import BookingRepository
from ..schemas.bookings import BookingStatusUpdate


class BookingService:
    def __init__(self, db: AsyncSession) -> None:
        self.repo = BookingRepository(db)

    async def list_bookings(self, status: str | None = None) -> list[Booking]:
        return await self.repo.get_all(status)

    async def count_new(self) -> int:
        return await self.repo.count_new()

    async def update_status(self, booking_id: str, data: BookingStatusUpdate) -> Booking:
        booking = await self.repo.get_by_id(booking_id)
        if not booking:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
        return await self.repo.update_status(booking, data.status)

    async def delete_booking(self, booking_id: str) -> None:
        booking = await self.repo.get_by_id(booking_id)
        if not booking:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
        await self.repo.delete(booking)
