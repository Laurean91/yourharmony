import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// GET /api/parent/grades?studentId=X — grades + teacher comments
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
    where: {
      studentId,
      OR: [{ grade: { not: null } }, { comment: { not: null } }],
    },
    include: {
      lesson: {
        select: {
          id: true, date: true, title: true, tag: true, homework: true,
          files: { select: { id: true, url: true, name: true, size: true }, orderBy: { createdAt: 'asc' } },
        },
      },
    },
    orderBy: { lesson: { date: 'desc' } },
    take: 50,
  })

  return NextResponse.json(
    entries.map((e) => ({
      lessonId: e.lessonId,
      date: e.lesson.date,
      title: e.lesson.title,
      tag: e.lesson.tag,
      grade: e.grade,
      comment: e.comment,
      attended: e.attended,
      homework: e.lesson.homework,
      files:    e.lesson.files,
    }))
  )
}
