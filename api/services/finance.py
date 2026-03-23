from datetime import date, datetime, timedelta, timezone
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..repositories.finance import FinanceRepository
from ..schemas.finance import (
    FinanceReport,
    FinanceStats,
    MonthlyRevenue,
    PricesOut,
    ReportBreakdownItem,
    StudentFinanceReport,
    StudentRevenue,
)

MONTH_NAMES = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"]

GROUP_TAGS = {"Группа", "Групповое"}


def _is_group(tag: str) -> bool:
    return tag in GROUP_TAGS


def _period_to_range(period: str) -> tuple[datetime, datetime]:
    now = datetime.now(tz=timezone.utc)
    today_end = now.replace(hour=23, minute=59, second=59, microsecond=999999)

    if period == "today":
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    elif period == "week":
        start = (now - timedelta(days=6)).replace(hour=0, minute=0, second=0, microsecond=0)
    elif period == "month":
        start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    elif period == "3months":
        m = now.month - 2
        y = now.year + (m - 1) // 12
        m = (m - 1) % 12 + 1
        start = now.replace(year=y, month=m, day=1, hour=0, minute=0, second=0, microsecond=0)
    elif period == "6months":
        m = now.month - 5
        y = now.year + (m - 1) // 12
        m = (m - 1) % 12 + 1
        start = now.replace(year=y, month=m, day=1, hour=0, minute=0, second=0, microsecond=0)
    elif period == "year":
        m = now.month - 11
        y = now.year + (m - 1) // 12
        m = (m - 1) % 12 + 1
        start = now.replace(year=y, month=m, day=1, hour=0, minute=0, second=0, microsecond=0)
    else:  # "all"
        start = datetime(2000, 1, 1, tzinfo=timezone.utc)

    return start, today_end


def _auto_group_by(date_from: datetime, date_to: datetime) -> str:
    diff_days = (date_to - date_from).days
    return "day" if diff_days <= 31 else "month"


def _build_buckets(
    date_from: datetime, date_to: datetime, group_by: str
) -> list[dict]:
    buckets = []
    if group_by == "day":
        cur = date_from.replace(hour=0, minute=0, second=0, microsecond=0)
        end = date_to.replace(hour=23, minute=59, second=59, microsecond=999999)
        while cur <= end:
            label = f"{cur.day:02d} {MONTH_NAMES[cur.month - 1]}"
            buckets.append({
                "key": (cur.year, cur.month, cur.day),
                "label": label,
                "individual": 0.0,
                "group": 0.0,
            })
            cur = cur + timedelta(days=1)
    else:
        # monthly
        cur_year, cur_month = date_from.year, date_from.month
        end_year, end_month = date_to.year, date_to.month
        while (cur_year, cur_month) <= (end_year, end_month):
            label = f"{MONTH_NAMES[cur_month - 1]} {str(cur_year)[2:]}"
            buckets.append({
                "key": (cur_year, cur_month, None),
                "label": label,
                "individual": 0.0,
                "group": 0.0,
            })
            cur_month += 1
            if cur_month > 12:
                cur_month = 1
                cur_year += 1
    return buckets


class FinanceService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.repo = FinanceRepository(db)

    async def get_prices(self) -> PricesOut:
        individual, group = await self.repo.get_prices()
        return PricesOut(individual=individual, group=group)

    async def update_prices(self, individual: float, group: float) -> PricesOut:
        async with self.db.begin():
            await self.repo.set_prices(individual, group)
        return PricesOut(individual=individual, group=group)

    async def get_report(
        self,
        period: str,
        from_date: Optional[date],
        to_date: Optional[date],
        group_by: Optional[str],
        student_id: Optional[str] = None,
    ) -> FinanceReport | StudentFinanceReport:
        price_individual, price_group = await self.repo.get_prices()

        if from_date and to_date:
            date_from = datetime(from_date.year, from_date.month, from_date.day, 0, 0, 0, tzinfo=timezone.utc)
            date_to = datetime(to_date.year, to_date.month, to_date.day, 23, 59, 59, 999999, tzinfo=timezone.utc)
            period_label = "custom"
        else:
            date_from, date_to = _period_to_range(period)
            period_label = period

        resolved_group_by = group_by or _auto_group_by(date_from, date_to)

        if student_id:
            student = await self.repo.get_student(student_id)
            if not student:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

        rows = await self.repo.get_attended_lesson_students(date_from, date_to, student_id)

        buckets = _build_buckets(date_from, date_to, resolved_group_by)
        bucket_index: dict[tuple, int] = {b["key"]: i for i, b in enumerate(buckets)}

        total_individual = 0.0
        total_group = 0.0

        for ls in rows:
            lesson_date = ls.lesson.date
            group = _is_group(ls.lesson.tag)
            price = ls.lesson.price if ls.lesson.price is not None else (price_group if group else price_individual)

            if resolved_group_by == "day":
                key = (lesson_date.year, lesson_date.month, lesson_date.day)
            else:
                key = (lesson_date.year, lesson_date.month, None)

            if key in bucket_index:
                b = buckets[bucket_index[key]]
                if group:
                    b["group"] += price
                else:
                    b["individual"] += price

            if group:
                total_group += price
            else:
                total_individual += price

        breakdown = [
            ReportBreakdownItem(
                label=b["label"],
                individual=b["individual"],
                group=b["group"],
                total=b["individual"] + b["group"],
            )
            for b in buckets
        ]

        kwargs = dict(
            period=period_label,
            from_date=date_from.date(),
            to_date=date_to.date(),
            total=total_individual + total_group,
            individual=total_individual,
            group=total_group,
            breakdown=breakdown,
        )

        if student_id:
            return StudentFinanceReport(
                **kwargs,
                student_id=student_id,
                student_name=student.name,  # type: ignore[union-attr]
                student_tag=student.tag,    # type: ignore[union-attr]
            )

        return FinanceReport(**kwargs)

    async def get_stats(self) -> FinanceStats:
        """Overall stats for the last 12 months + all-time student breakdown."""
        price_individual, price_group = await self.repo.get_prices()

        now = datetime.now(tz=timezone.utc)
        # 12-month window
        m = now.month - 11
        y = now.year + (m - 1) // 12
        m = (m - 1) % 12 + 1
        date_from = now.replace(year=y, month=m, day=1, hour=0, minute=0, second=0, microsecond=0)
        date_to = now.replace(hour=23, minute=59, second=59, microsecond=999999)

        rows = await self.repo.get_attended_lesson_students(
            datetime(2000, 1, 1, tzinfo=timezone.utc), date_to
        )

        # Monthly buckets (last 12)
        monthly_buckets = _build_buckets(date_from, date_to, "month")
        bucket_index = {b["key"]: i for i, b in enumerate(monthly_buckets)}

        student_map: dict[str, dict] = {}
        total_this_month = 0.0
        total_individual_month = 0.0
        total_group_month = 0.0
        this_year = now.year
        this_month = now.month

        for ls in rows:
            lesson_date = ls.lesson.date
            group = _is_group(ls.lesson.tag)
            price = ls.lesson.price if ls.lesson.price is not None else (price_group if group else price_individual)

            # Monthly bucket
            key = (lesson_date.year, lesson_date.month, None)
            if key in bucket_index:
                b = monthly_buckets[bucket_index[key]]
                if group:
                    b["group"] += price
                else:
                    b["individual"] += price

            # This month totals
            if lesson_date.year == this_year and lesson_date.month == this_month:
                total_this_month += price
                if group:
                    total_group_month += price
                else:
                    total_individual_month += price

            # Per-student totals (all time)
            sid = ls.studentId
            if sid not in student_map:
                student_map[sid] = {
                    "studentId": sid,
                    "name": ls.student.name,
                    "tag": ls.student.tag,
                    "attended": 0,
                    "total": 0.0,
                }
            student_map[sid]["attended"] += 1
            student_map[sid]["total"] += price

        monthly_revenue = [
            MonthlyRevenue(
                month=b["label"],
                individual=b["individual"],
                group=b["group"],
            )
            for b in monthly_buckets
        ]

        student_revenue = sorted(
            [StudentRevenue(**v) for v in student_map.values()],
            key=lambda s: s.total,
            reverse=True,
        )

        return FinanceStats(
            monthlyRevenue=monthly_revenue,
            studentRevenue=student_revenue,
            totalThisMonth=total_this_month,
            totalIndividual=total_individual_month,
            totalGroup=total_group_month,
        )
