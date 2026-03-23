from datetime import date
from typing import Literal, Optional

from pydantic import BaseModel, Field, model_validator


PERIOD_VALUES = Literal["today", "week", "month", "3months", "6months", "year", "all"]


class PricesOut(BaseModel):
    individual: float
    group: float


class PricesUpdate(BaseModel):
    individual: float = Field(gt=0)
    group: float = Field(gt=0)


class ReportBreakdownItem(BaseModel):
    label: str
    individual: float
    group: float
    total: float


class FinanceReport(BaseModel):
    period: str
    from_date: date = Field(serialization_alias="from")
    to_date: date = Field(serialization_alias="to")
    total: float
    individual: float
    group: float
    breakdown: list[ReportBreakdownItem]

    model_config = {"populate_by_name": True}


class StudentFinanceReport(FinanceReport):
    student_id: str = Field(serialization_alias="studentId")
    student_name: str = Field(serialization_alias="studentName")
    student_tag: str = Field(serialization_alias="studentTag")

    model_config = {"populate_by_name": True}


class StudentRevenue(BaseModel):
    studentId: str
    name: str
    tag: str
    attended: int
    total: float


class MonthlyRevenue(BaseModel):
    month: str
    individual: float
    group: float


class FinanceStats(BaseModel):
    monthlyRevenue: list[MonthlyRevenue]
    studentRevenue: list[StudentRevenue]
    totalThisMonth: float
    totalIndividual: float
    totalGroup: float


class ReportQuery(BaseModel):
    period: Optional[PERIOD_VALUES] = "month"
    from_date: Optional[date] = Field(None, alias="from")
    to_date: Optional[date] = Field(None, alias="to")
    group_by: Optional[Literal["day", "month"]] = Field(None, alias="groupBy")

    model_config = {"populate_by_name": True}

    @model_validator(mode="after")
    def check_custom_range(self) -> "ReportQuery":
        if (self.from_date is None) != (self.to_date is None):
            raise ValueError("Both 'from' and 'to' must be provided together")
        if self.from_date and self.to_date and self.from_date > self.to_date:
            raise ValueError("'from' must be before 'to'")
        return self
