from typing import Annotated, Optional

from fastapi import Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from ..dependencies import get_db
from ..schemas.finance import (
    FinanceReport,
    FinanceStats,
    PricesOut,
    PricesUpdate,
    ReportQuery,
    StudentFinanceReport,
)
from ..services.finance import FinanceService


async def get_prices(db: AsyncSession = Depends(get_db)) -> PricesOut:
    return await FinanceService(db).get_prices()


async def update_prices(data: PricesUpdate, db: AsyncSession = Depends(get_db)) -> PricesOut:
    return await FinanceService(db).update_prices(data.individual, data.group)


async def get_stats(db: AsyncSession = Depends(get_db)) -> FinanceStats:
    return await FinanceService(db).get_stats()


async def get_report(
    query: Annotated[ReportQuery, Query()],
    db: AsyncSession = Depends(get_db),
) -> FinanceReport:
    return await FinanceService(db).get_report(  # type: ignore[return-value]
        period=query.period or "month",
        from_date=query.from_date,
        to_date=query.to_date,
        group_by=query.group_by,
    )


async def get_student_report(
    student_id: str,
    query: Annotated[ReportQuery, Query()],
    db: AsyncSession = Depends(get_db),
) -> StudentFinanceReport:
    return await FinanceService(db).get_report(  # type: ignore[return-value]
        period=query.period or "month",
        from_date=query.from_date,
        to_date=query.to_date,
        group_by=query.group_by,
        student_id=student_id,
    )
