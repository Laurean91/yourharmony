import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { del } from '@vercel/blob'

// DELETE /api/lessons/[id]/files/[fileId]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  const session = await auth()
  if (session?.user?.role !== 'TEACHER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { fileId } = await params

  const file = await prisma.lessonFile.findUnique({ where: { id: fileId } })
  if (!file) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await del(file.url)
  await prisma.lessonFile.delete({ where: { id: fileId } })

  return NextResponse.json({ ok: true })
}
