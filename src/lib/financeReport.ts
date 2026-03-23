import { prisma } from '@/lib/prisma'

const MONTH_NAMES = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']

function isGroup(tag: string) {
  return tag === 'Группа' || tag === 'Групповое'
}

export type ReportBreakdownItem = {
  label: string
  individual: number
  group: number
  total: number
}

export type FinanceReport = {
  period: string
  from: string
  to: string
  total: number
  individual: number
  group: number
  breakdown: ReportBreakdownItem[]
}

type PeriodConfig = {
  from: Date
  to: Date
  groupBy: 'day' | 'month'
}

const DEFAULT_PRICE_INDIVIDUAL = 1500
const DEFAULT_PRICE_GROUP = 800

async function getPriceDefaults() {
  const rows = await prisma.siteSettings.findMany({
    where: { key: { in: ['price_individual', 'price_group'] } },
  })
  const map = Object.fromEntries(rows.map(r => [r.key, r.value]))
  return {
    individual: map['price_individual'] ? Number(map['price_individual']) : DEFAULT_PRICE_INDIVIDUAL,
    group: map['price_group'] ? Number(map['price_group']) : DEFAULT_PRICE_GROUP,
  }
}

export function parsePeriodParam(period: string): PeriodConfig {
  const now = new Date()
  const to = new Date(now)
  to.setHours(23, 59, 59, 999)

  switch (period) {
    case 'today': {
      const from = new Date(now)
      from.setHours(0, 0, 0, 0)
      return { from, to, groupBy: 'day' }
    }
    case 'week': {
      const from = new Date(now)
      from.setDate(from.getDate() - 6)
      from.setHours(0, 0, 0, 0)
      return { from, to, groupBy: 'day' }
    }
    case 'month': {
      const from = new Date(now.getFullYear(), now.getMonth(), 1)
      return { from, to, groupBy: 'day' }
    }
    case '3months': {
      const from = new Date(now.getFullYear(), now.getMonth() - 2, 1)
      return { from, to, groupBy: 'month' }
    }
    case '6months': {
      const from = new Date(now.getFullYear(), now.getMonth() - 5, 1)
      return { from, to, groupBy: 'month' }
    }
    case 'year': {
      const from = new Date(now.getFullYear(), now.getMonth() - 11, 1)
      return { from, to, groupBy: 'month' }
    }
    default: {
      // 'all'
      return { from: new Date(0), to, groupBy: 'month' }
    }
  }
}

export function parseCustomRange(fromStr: string, toStr: string, groupBy?: string): PeriodConfig | null {
  const from = new Date(fromStr)
  const to = new Date(toStr)
  if (isNaN(from.getTime()) || isNaN(to.getTime())) return null
  to.setHours(23, 59, 59, 999)
  const diffDays = (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)
  const resolvedGroupBy: 'day' | 'month' = groupBy === 'month' ? 'month' : groupBy === 'day' ? 'day' : diffDays <= 31 ? 'day' : 'month'
  return { from, to, groupBy: resolvedGroupBy }
}

function buildBuckets(from: Date, to: Date, groupBy: 'day' | 'month'): Array<{ key: string; label: string; from: Date; to: Date }> {
  const buckets = []

  if (groupBy === 'day') {
    const cur = new Date(from)
    cur.setHours(0, 0, 0, 0)
    while (cur <= to) {
      const day = new Date(cur)
      const dayEnd = new Date(cur)
      dayEnd.setHours(23, 59, 59, 999)
      const dd = String(day.getDate()).padStart(2, '0')
      const mm = MONTH_NAMES[day.getMonth()]
      buckets.push({ key: `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`, label: `${dd} ${mm}`, from: day, to: dayEnd })
      cur.setDate(cur.getDate() + 1)
    }
  } else {
    // monthly
    const cur = new Date(from.getFullYear(), from.getMonth(), 1)
    const end = new Date(to.getFullYear(), to.getMonth(), 1)
    while (cur <= end) {
      const monthStart = new Date(cur)
      const monthEnd = new Date(cur.getFullYear(), cur.getMonth() + 1, 0, 23, 59, 59, 999)
      const label = `${MONTH_NAMES[cur.getMonth()]} ${String(cur.getFullYear()).slice(2)}`
      buckets.push({ key: `${cur.getFullYear()}-${cur.getMonth()}`, label, from: monthStart, to: monthEnd })
      cur.setMonth(cur.getMonth() + 1)
    }
  }

  return buckets
}

export async function buildReport(
  periodLabel: string,
  config: PeriodConfig,
  studentId?: string,
): Promise<FinanceReport> {
  const prices = await getPriceDefaults()

  const rows = await prisma.lessonStudent.findMany({
    where: {
      attended: true,
      lesson: { date: { gte: config.from, lte: config.to } },
      ...(studentId ? { studentId } : {}),
    },
    include: { lesson: true },
  })

  const buckets = buildBuckets(config.from, config.to, config.groupBy)
  const bucketMap = new Map<string, ReportBreakdownItem>(
    buckets.map(b => [b.key, { label: b.label, individual: 0, group: 0, total: 0 }])
  )

  let totalIndividual = 0
  let totalGroup = 0

  for (const ls of rows) {
    const lessonDate = new Date(ls.lesson.date)
    const group = isGroup(ls.lesson.tag)
    const price = ls.lesson.price ?? (group ? prices.group : prices.individual)

    // find bucket
    let key: string
    if (config.groupBy === 'day') {
      key = `${lessonDate.getFullYear()}-${lessonDate.getMonth()}-${lessonDate.getDate()}`
    } else {
      key = `${lessonDate.getFullYear()}-${lessonDate.getMonth()}`
    }

    const bucket = bucketMap.get(key)
    if (bucket) {
      if (group) bucket.group += price
      else bucket.individual += price
      bucket.total += price
    }

    if (group) totalGroup += price
    else totalIndividual += price
  }

  return {
    period: periodLabel,
    from: config.from.toISOString().slice(0, 10),
    to: config.to.toISOString().slice(0, 10),
    total: totalIndividual + totalGroup,
    individual: totalIndividual,
    group: totalGroup,
    breakdown: Array.from(bucketMap.values()),
  }
}
