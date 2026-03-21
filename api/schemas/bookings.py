from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class BookingOut(BaseModel):
    id:         str
    parentName: str
    childAge:   int
    phone:      str
    status:     str
    createdAt:  datetime

    model_config = {"from_attributes": True}


class BookingStatusUpdate(BaseModel):
    status: str = Field(
        description="Новый статус заявки",
        examples=["Новая", "В работе", "Завершена"],
    )


class BookingCountOut(BaseModel):
    count: int = Field(description="Количество заявок со статусом «Новая»")
