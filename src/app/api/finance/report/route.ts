import { NextRequest, NextResponse } from 'next/server'
import { parsePeriodParam, parseCustomRange, buildReport } from '@/lib/financeReport'

function authorized(req: NextRequest) {
  const header = req.headers.get('authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  return token === process.env.FASTAPI_SECRET_KEY
}

const VALID_PERIODS = ['today', 'week', 'month', '3months', '6months', 'year', 'all']

// GET /api/finance/report?period=month
// GET /api/finance/report?from=2026-01-01&to=2026-03-23&groupBy=day
export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = req.nextUrl
  const periodParam = searchParams.get('period')
  const fromParam = searchParams.get('from')
  const toParam = searchParams.get('to')
  const groupByParam = searchParams.get('groupBy') ?? undefined

  let periodLabel: string
  let config

  if (fromParam && toParam) {
    config = parseCustomRange(fromParam, toParam, groupByParam)
    if (!config) return NextResponse.json({ error: 'Invalid from/to dates' }, { status: 400 })
    periodLabel = 'custom'
  } else {
    const period = VALID_PERIODS.includes(periodParam ?? '') ? (periodParam as string) : 'month'
    config = parsePeriodParam(period)
    periodLabel = period
  }

  const report = await buildReport(periodLabel, config)
  return NextResponse.json(report)
}
