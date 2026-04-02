import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

async function requireTeacher() {
  const session = await auth()
  if (!session || session.user.role !== 'TEACHER') return null
  return session
}

// GET /api/admin/parents/[id]/students — linked students
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireTeacher()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const parent = await prisma.parent.findUnique({
    where: { id },
    include: { students: { include: { student: { select: { id: true, name: true, tag: true, age: true } } } } },
  })
  if (!parent) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(parent.students.map((ps) => ps.student))
}

// PUT /api/admin/parents/[id]/students — sync student list
// Body: { studentIds: string[] }
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireTeacher()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  let body: { studentIds?: unknown }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!Array.isArray(body.studentIds)) {
    return NextResponse.json({ error: 'studentIds must be an array' }, { status: 400 })
  }

  const parent = await prisma.parent.findUnique({ where: { id } })
  if (!parent) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const newIds = (body.studentIds as unknown[]).map(String)

  const existing = await prisma.parentStudent.findMany({ where: { parentId: id } })
  const existingIds = existing.map((e) => e.studentId)

  const toRemove = existingIds.filter((sid) => !newIds.includes(sid))
  const toAdd    = newIds.filter((sid) => !existingIds.includes(sid))

  if (toRemove.length > 0) {
    await prisma.parentStudent.deleteMany({ where: { parentId: id, studentId: { in: toRemove } } })
  }
  if (toAdd.length > 0) {
    await prisma.parentStudent.createMany({
      data: toAdd.map((studentId) => ({ parentId: id, studentId })),
    })
  }

  return NextResponse.json({ ok: true })
}
