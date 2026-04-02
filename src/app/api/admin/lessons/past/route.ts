import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/lessons/past — lessons that have already happened (for journal)
export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const lessons = await prisma.lesson.findMany({
    where: { date: { lte: now } },
    orderBy: { date: 'desc' },
    take: 50,
    select: { id: true, date: true, title: true, tag: true },
  })

  return NextResponse.json(lessons)
}
