import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

async function requireTeacher() {
  const session = await auth()
  if (!session || session.user.role !== 'TEACHER') return null
  return session
}

// PATCH /api/admin/parents/[id] — update name, phone, email, password
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireTeacher()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  let body: { name?: string; phone?: string; email?: string; password?: string }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parent = await prisma.parent.findUnique({ where: { id }, include: { user: true } })
  if (!parent) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const parentData: { name?: string; phone?: string | null; email?: string | null } = {}
  if (body.name)  parentData.name  = body.name
  if ('phone' in body) parentData.phone = body.phone ?? null
  if ('email' in body) parentData.email = body.email ?? null

  await prisma.parent.update({ where: { id }, data: parentData })

  if (body.password) {
    const passwordHash = await bcrypt.hash(body.password, 12)
    await prisma.user.update({ where: { id: parent.userId }, data: { passwordHash } })
  }

  return NextResponse.json({ ok: true })
}

// DELETE /api/admin/parents/[id] — delete parent account (cascades to User)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireTeacher()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const parent = await prisma.parent.findUnique({ where: { id } })
  if (!parent) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Deleting User cascades to Parent via onDelete: Cascade
  await prisma.user.delete({ where: { id: parent.userId } })

  return NextResponse.json({ ok: true })
}
