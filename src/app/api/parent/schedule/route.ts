import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// GET /api/parent/schedule?studentId=X — upcoming lessons for student's group
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

  // Security: ensure studentId belongs to this parent
  const link = await prisma.parentStudent.findUnique({
    where: { parentId_studentId: { parentId: parent.id, studentId } },
  })
  if (!link) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const student = await prisma.student.findUnique({ where: { id: studentId } })
  if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 })

  const now = new Date()
  const lessons = await prisma.lesson.findMany({
    where: {
      tag: student.tag,
      date: { gte: now },
    },
    orderBy: { date: 'asc' },
    take: 20,
    select: { id: true, date: true, title: true, tag: true, notes: true, homework: true },
  })

  return NextResponse.json(lessons)
}
