from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class StudentBase(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    age: Optional[int] = Field(None, ge=1, le=99)
    phone: Optional[str] = Field(None, max_length=30)
    tag: str = Field(default="Индивидуальное", max_length=100)
    notes: Optional[str] = None


class StudentCreate(StudentBase):
    pass


class StudentUpdate(StudentBase):
    pass


class StudentOut(StudentBase):
    id: str
    createdAt: datetime

    model_config = {"from_attributes": True}
