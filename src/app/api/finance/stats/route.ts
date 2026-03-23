import { NextRequest, NextResponse } from 'next/server'
import { getFinanceStats } from '@/app/actions'

function authorized(req: NextRequest) {
  const header = req.headers.get('authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  return token === process.env.FASTAPI_SECRET_KEY
}

// GET /api/finance/stats
export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const stats = await getFinanceStats()
  return NextResponse.json(stats)
}
