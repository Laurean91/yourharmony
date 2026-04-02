import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

async function requireTeacher() {
  const session = await auth()
  if (!session || session.user.role !== 'TEACHER') return null
  return session
}

// POST /api/lessons — create a lesson
// Body: { date, title?, tag?, notes?, price?, studentIds? }
export async function POST(req: NextRequest) {
  if (!await requireTeacher()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.date) {
    return NextResponse.json({ error: 'date is required' }, { status: 400 })
  }

  const date = new Date(body.date as string)
  if (isNaN(date.getTime())) {
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 })
  }

  const lesson = await prisma.lesson.create({
    data: {
      date,
      title:   body.title   ? String(body.title)   : null,
      tag:     body.tag     ? String(body.tag)      : 'Индивидуальное',
      notes:   body.notes   ? String(body.notes)   : null,
      price:   body.price   != null ? Number(body.price) : null,
      students: Array.isArray(body.studentIds)
        ? { create: (body.studentIds as unknown[]).map(String).map((studentId) => ({ studentId })) }
        : undefined,
    },
    include: { students: { include: { student: true } } },
  })

  revalidatePath('/bigbos/schedule')
  return NextResponse.json(lesson, { status: 201 })
}
