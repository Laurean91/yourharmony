import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

function authorized(req: NextRequest) {
  const header = req.headers.get('authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  return token === process.env.FASTAPI_SECRET_KEY
}

// PATCH /api/lessons/[id] — edit lesson fields + sync students
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const lesson = await prisma.lesson.findUnique({ where: { id } })
  if (!lesson) {
    return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const data: { date?: Date; title?: string | null; tag?: string; notes?: string | null; homework?: string | null; price?: number | null } = {}

  if (body.date !== undefined) {
    const d = new Date(body.date as string)
    if (isNaN(d.getTime())) return NextResponse.json({ error: 'Invalid date' }, { status: 400 })
    data.date = d
  }
  if (body.title !== undefined) data.title = body.title ? String(body.title) : null
  if (body.tag !== undefined) data.tag = String(body.tag)
  if (body.notes !== undefined) data.notes = body.notes ? String(body.notes) : null
  if (body.homework !== undefined) data.homework = body.homework ? String(body.homework) : null
  if (body.price !== undefined) data.price = body.price !== null ? Number(body.price) : null

  await prisma.lesson.update({ where: { id }, data })

  // Sync students if provided
  if (Array.isArray(body.studentIds)) {
    const studentIds = (body.studentIds as unknown[]).map(String)
    const existing = await prisma.lessonStudent.findMany({ where: { lessonId: id } })
    const existingIds = existing.map(e => e.studentId)

    const toRemove = existingIds.filter(sid => !studentIds.includes(sid))
    if (toRemove.length > 0) {
      await prisma.lessonStudent.deleteMany({ where: { lessonId: id, studentId: { in: toRemove } } })
    }
    const toAdd = studentIds.filter(sid => !existingIds.includes(sid))
    if (toAdd.length > 0) {
      await prisma.lessonStudent.createMany({ data: toAdd.map(studentId => ({ lessonId: id, studentId })) })
    }
  }

  const updated = await prisma.lesson.findUnique({
    where: { id },
    include: { students: { include: { student: true } } },
  })

  revalidatePath('/bigbos')
  return NextResponse.json(updated)
}
