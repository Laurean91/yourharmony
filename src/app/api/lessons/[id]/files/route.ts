import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { put } from '@vercel/blob'

const MAX_SIZE = 10 * 1024 * 1024 // 10 MB
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'audio/mpeg', 'audio/wav', 'audio/ogg',
  'video/mp4', 'video/webm',
]

// POST /api/lessons/[id]/files — upload a homework file
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (session?.user?.role !== 'TEACHER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id: lessonId } = await params

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } })
  if (!lesson) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'file required' }, { status: 400 })

  if (file.size > MAX_SIZE) return NextResponse.json({ error: 'Файл слишком большой (макс. 10 МБ)' }, { status: 413 })
  if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: 'Недопустимый тип файла' }, { status: 415 })

  const arrayBuffer = await file.arrayBuffer()
  const blob = await put(`homework/${lessonId}/${file.name}`, Buffer.from(arrayBuffer), {
    access: 'public',
    contentType: file.type,
  })

  const record = await prisma.lessonFile.create({
    data: { lessonId, url: blob.url, name: file.name, size: file.size },
  })

  return NextResponse.json(record, { status: 201 })
}
