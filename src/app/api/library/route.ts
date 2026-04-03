import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { put } from '@vercel/blob'

const MAX_SIZE = 50 * 1024 * 1024 // 50 MB
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg', 'image/png', 'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/epub+zip',
  'audio/mpeg', 'audio/wav', 'audio/ogg',
]

// GET /api/library — all files (TEACHER) or filtered by tag (PARENT via ?studentId=)
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (session.user.role === 'TEACHER') {
    const files = await prisma.libraryFile.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(files)
  }

  if (session.user.role === 'PARENT') {
    const studentId = req.nextUrl.searchParams.get('studentId')

    const parent = await prisma.parent.findUnique({
      where: { userId: session.user.id },
      include: { students: { include: { student: { select: { id: true, tag: true } } } } },
    })
    if (!parent) return NextResponse.json({ error: 'Parent not found' }, { status: 404 })

    let tag: string | null = null
    if (studentId) {
      const link = parent.students.find(ps => ps.studentId === studentId)
      if (!link) return NextResponse.json({ error: 'Student not found' }, { status: 404 })
      tag = link.student.tag
    } else if (parent.students.length > 0) {
      tag = parent.students[0].student.tag
    }

    const files = await prisma.libraryFile.findMany({
      where: tag ? { OR: [{ targetTag: 'Все' }, { targetTag: tag }] } : { targetTag: 'Все' },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(files)
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// POST /api/library — upload a library file (TEACHER only)
export async function POST(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const title = (formData.get('title') as string | null)?.trim()
  const description = (formData.get('description') as string | null)?.trim() || null
  const category = (formData.get('category') as string | null)?.trim() || null
  const targetTag = (formData.get('targetTag') as string | null)?.trim() || 'Все'

  if (!file) return NextResponse.json({ error: 'file required' }, { status: 400 })
  if (!title) return NextResponse.json({ error: 'title required' }, { status: 400 })
  if (file.size > MAX_SIZE) return NextResponse.json({ error: 'Файл слишком большой (макс. 50 МБ)' }, { status: 413 })
  if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: 'Недопустимый тип файла' }, { status: 415 })

  const arrayBuffer = await file.arrayBuffer()
  const blob = await put(`library/${Date.now()}-${file.name}`, Buffer.from(arrayBuffer), {
    access: 'public',
    contentType: file.type,
  })

  const record = await prisma.libraryFile.create({
    data: { title, description, url: blob.url, name: file.name, size: file.size, category, targetTag },
  })

  return NextResponse.json(record, { status: 201 })
}
