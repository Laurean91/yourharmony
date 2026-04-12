import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

async function requireTeacher() {
  const session = await auth()
  if (!session || session.user.role !== 'TEACHER') return null
  return session
}

// GET /api/admin/parents — list all parent accounts
export async function GET() {
  if (!await requireTeacher()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parents = await prisma.parent.findMany({
    include: {
      user: { select: { id: true, username: true, createdAt: true } },
      students: { include: { student: { select: { id: true, name: true, tag: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(
    parents.map((p) => ({
      id:        p.id,
      name:      p.name,
      phone:     p.phone,
      email:     p.email,
      username:  p.user.username,
      createdAt: p.user.createdAt,
      students:  p.students.map((ps) => ps.student),
    }))
  )
}

// POST /api/admin/parents — create parent account
// Body: { username, password, name, phone?, email? }
export async function POST(req: NextRequest) {
  if (!await requireTeacher()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { username?: string; password?: string; name?: string; phone?: string; email?: string }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { password, name, phone, email } = body
  const username = typeof body.username === 'string' ? body.username.toLowerCase().trim() : undefined
  if (!username || !password || !name) {
    return NextResponse.json({ error: 'username, password, name are required' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { username } })
  if (existing) {
    return NextResponse.json({ error: 'Username already taken' }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: {
      username,
      passwordHash,
      role: 'PARENT',
      parent: {
        create: { name, phone: phone ?? null, email: email ?? null },
      },
    },
    include: { parent: true },
  })

  return NextResponse.json(
    { id: user.parent!.id, username: user.username, name: user.parent!.name },
    { status: 201 }
  )
}
