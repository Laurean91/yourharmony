from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.booking import Booking


class BookingRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_all(self, status: str | None = None) -> list[Booking]:
        q = select(Booking).order_by(Booking.createdAt.desc())
        if status:
            q = q.where(Booking.status == status)
        result = await self.db.execute(q)
        return list(result.scalars().all())

    async def get_by_id(self, booking_id: str) -> Booking | None:
        return await self.db.get(Booking, booking_id)

    async def count_new(self) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(Booking).where(Booking.status == "Новая")
        )
        return result.scalar_one()

    async def update_status(self, booking: Booking, status: str) -> Booking:
        booking.status = status
        await self.db.flush()
        await self.db.refresh(booking)
        return booking

    async def delete(self, booking: Booking) -> None:
        await self.db.delete(booking)
        await self.db.flush()
