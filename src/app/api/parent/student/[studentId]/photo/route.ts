import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { put, del } from '@vercel/blob'
import sharp from 'sharp'

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const session = await auth()
  if (!session || session.user.role !== 'PARENT') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { studentId } = await params

  // Verify this student belongs to the authenticated parent
  const parent = await prisma.parent.findUnique({
    where: { userId: session.user.id },
    include: { students: { where: { studentId } } },
  })
  if (!parent || parent.students.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'file required' }, { status: 400 })
  if (file.size > MAX_SIZE) return NextResponse.json({ error: 'Файл слишком большой (макс. 5 МБ)' }, { status: 413 })
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: 'Только JPEG / PNG / WEBP' }, { status: 415 })

  const student = await prisma.student.findUnique({ where: { id: studentId } })
  if (!student) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Compress & convert to WebP
  const arrayBuffer = await file.arrayBuffer()
  const buffer = await sharp(Buffer.from(arrayBuffer))
    .resize({ width: 400, height: 400, fit: 'cover', position: 'face' })
    .webp({ quality: 85 })
    .toBuffer()

  // Delete old photo from Vercel Blob
  if (student.photoUrl) {
    await del(student.photoUrl).catch(() => null)
  }

  const blob = await put(
    `students/${studentId}/photo-${Date.now()}.webp`,
    buffer,
    { access: 'public', contentType: 'image/webp' }
  )

  await prisma.student.update({
    where: { id: studentId },
    data: { photoUrl: blob.url },
  })

  return NextResponse.json({ url: blob.url })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const session = await auth()
  if (!session || session.user.role !== 'PARENT') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { studentId } = await params

  const parent = await prisma.parent.findUnique({
    where: { userId: session.user.id },
    include: { students: { where: { studentId } } },
  })
  if (!parent || parent.students.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const student = await prisma.student.findUnique({ where: { id: studentId } })
  if (student?.photoUrl) {
    await del(student.photoUrl).catch(() => null)
    await prisma.student.update({ where: { id: studentId }, data: { photoUrl: null } })
  }

  return NextResponse.json({ ok: true })
}
