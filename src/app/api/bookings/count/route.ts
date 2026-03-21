import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/bookings/count
 * Возвращает количество заявок со статусом "Новая".
 * Пример ответа: { "count": 3 }
 */
export async function GET() {
  const count = await prisma.booking.count({
    where: { status: 'Новая' },
  })
  return NextResponse.json({ count })
}
