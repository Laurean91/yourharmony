import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

function authorized(req: NextRequest) {
  const header = req.headers.get('authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  return token === process.env.FASTAPI_SECRET_KEY
}

// PATCH /api/lessons/[id]/move — reschedule lesson to a new date/time
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

  if (!body.date) {
    return NextResponse.json({ error: 'date is required' }, { status: 400 })
  }

  const newDate = new Date(body.date as string)
  if (isNaN(newDate.getTime())) {
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 })
  }

  const updated = await prisma.lesson.update({
    where: { id },
    data: { date: newDate },
    include: { students: { include: { student: true } } },
  })

  revalidatePath('/bigbos')
  return NextResponse.json(updated)
}
