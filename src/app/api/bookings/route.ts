import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/bookings
 * Возвращает список заявок. Требует заголовок Authorization: Bearer <FASTAPI_SECRET_KEY>
 *
 * Query-параметры:
 *   status — фильтр по статусу (например: "Новая", "В работе", "Завершена")
 *
 * Пример:
 *   GET /api/bookings
 *   GET /api/bookings?status=Новая
 */
export async function GET(req: NextRequest) {
  const apiKey = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!apiKey || apiKey !== process.env.FASTAPI_SECRET_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const status = req.nextUrl.searchParams.get('status') ?? undefined

  const bookings = await prisma.booking.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(bookings)
}
