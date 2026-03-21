from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, Field, field_validator, model_validator


class LessonBase(BaseModel):
    date: datetime
    title: Optional[str] = None
    tag: str = Field(default="Индивидуальное", max_length=100)
    notes: Optional[str] = None
    price: Optional[float] = Field(None, ge=0)

    @field_validator("date")
    @classmethod
    def date_must_be_timezone_aware(cls, v: datetime) -> datetime:
        """
        Edge Case 3: Reject timezone-naive datetimes.

        A naive datetime (e.g. "2026-04-01T10:00:00" without timezone) causes
        silent data corruption: PostgreSQL stores TIMESTAMPTZ but Python's
        comparison operators raise TypeError when mixing naive/aware datetimes.
        Forcing UTC-awareness at the schema boundary prevents this class of bug.
        """
        if v.tzinfo is None:
            raise ValueError(
                "date must include timezone info (e.g. '2026-04-01T10:00:00Z' or '+03:00')"
            )
        return v


class LessonCreate(LessonBase):
    studentIds: list[str] = Field(default_factory=list)


class LessonUpdate(LessonBase):
    studentIds: Optional[list[str]] = None


class EnrollmentStudentOut(BaseModel):
    id: str
    name: str
    tag: str

    model_config = {"from_attributes": True}


class EnrollmentOut(BaseModel):
    studentId: str
    lessonId: str
    attended: bool
    student: Optional[EnrollmentStudentOut] = None

    model_config = {"from_attributes": True}


class LessonOut(LessonBase):
    id: str
    createdAt: datetime
    enrollments: list[EnrollmentOut] = Field(default_factory=list)

    model_config = {"from_attributes": True}


class EnrollRequest(BaseModel):
    studentId: str = Field(min_length=1)


class AttendancePatch(BaseModel):
    attended: bool


class LessonDateRangeQuery(BaseModel):
    """
    Validates date range query parameters for GET /schedule/lessons.
    Ensures date_from < date_to to prevent nonsensical range queries.
    """
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None

    @field_validator("date_from", "date_to")
    @classmethod
    def must_be_timezone_aware(cls, v: Optional[datetime]) -> Optional[datetime]:
        if v is not None and v.tzinfo is None:
            raise ValueError("date must be timezone-aware")
        return v

    @model_validator(mode="after")
    def date_from_before_date_to(self) -> "LessonDateRangeQuery":
        if self.date_from and self.date_to and self.date_from >= self.date_to:
            raise ValueError("date_from must be earlier than date_to")
        return self
