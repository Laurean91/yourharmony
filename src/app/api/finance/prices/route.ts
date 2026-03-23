import { NextRequest, NextResponse } from 'next/server'
import { getFinancePrices, updateFinancePrices } from '@/app/actions'

function authorized(req: NextRequest) {
  const header = req.headers.get('authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  return token === process.env.FASTAPI_SECRET_KEY
}

// GET /api/finance/prices
export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const prices = await getFinancePrices()
  return NextResponse.json(prices)
}

// PATCH /api/finance/prices
export async function PATCH(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const individual = Number(body.individual)
  const group = Number(body.group)

  if (!Number.isFinite(individual) || individual <= 0 || !Number.isFinite(group) || group <= 0) {
    return NextResponse.json({ error: 'individual and group must be positive numbers' }, { status: 400 })
  }

  await updateFinancePrices(individual, group)
  return NextResponse.json({ individual, group })
}
