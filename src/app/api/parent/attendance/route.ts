import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// GET /api/parent/attendance?studentId=X — attendance stats
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'PARENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const studentId = req.nextUrl.searchParams.get('studentId')
  if (!studentId) {
    return NextResponse.json({ error: 'studentId required' }, { status: 400 })
  }

  const parent = await prisma.parent.findUnique({ where: { userId: session.user.id } })
  if (!parent) return NextResponse.json({ error: 'Parent not found' }, { status: 404 })

  const link = await prisma.parentStudent.findUnique({
    where: { parentId_studentId: { parentId: parent.id, studentId } },
  })
  if (!link) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const entries = await prisma.lessonStudent.findMany({
    where: { studentId },
    include: {
      lesson: { select: { id: true, date: true, title: true, tag: true } },
    },
    orderBy: { lesson: { date: 'desc' } },
  })

  const attended = entries.filter((e) => e.attended).length
  const missed   = entries.filter((e) => !e.attended).length

  return NextResponse.json({
    total:    entries.length,
    attended,
    missed,
    rate: entries.length > 0 ? Math.round((attended / entries.length) * 100) : 0,
    lessons: entries.map((e) => ({
      lessonId: e.lessonId,
      date:     e.lesson.date,
      title:    e.lesson.title,
      tag:      e.lesson.tag,
      attended: e.attended,
    })),
  })
}
