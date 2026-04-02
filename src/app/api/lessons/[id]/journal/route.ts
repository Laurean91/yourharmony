import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

async function requireTeacher() {
  const session = await auth()
  if (!session || session.user.role !== 'TEACHER') return null
  return session
}

type JournalEntry = {
  studentId: string
  attended: boolean
  grade?: number | null
  comment?: string | null
}

// POST /api/lessons/[id]/journal — batch save attendance + grades
// Body: { entries: JournalEntry[] }
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireTeacher()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: lessonId } = await params

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } })
  if (!lesson) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })

  let body: { entries?: unknown; homework?: string | null }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!Array.isArray(body.entries) || body.entries.length === 0) {
    return NextResponse.json({ error: 'entries[] required' }, { status: 400 })
  }

  const entries = body.entries as JournalEntry[]

  // Save homework on lesson + upsert attendance entries
  await prisma.$transaction([
    prisma.lesson.update({
      where: { id: lessonId },
      data: { homework: body.homework !== undefined ? (body.homework || null) : undefined },
    }),
    ...entries.map((entry) =>
      prisma.lessonStudent.upsert({
        where: { lessonId_studentId: { lessonId, studentId: entry.studentId } },
        create: {
          lessonId,
          studentId: entry.studentId,
          attended:  entry.attended,
          grade:     entry.grade    ?? null,
          comment:   entry.comment  ?? null,
        },
        update: {
          attended:  entry.attended,
          grade:     entry.grade    ?? null,
          comment:   entry.comment  ?? null,
        },
      })
    ),
  ])

  return NextResponse.json({ ok: true, saved: entries.length })
}

// GET /api/lessons/[id]/journal — get current journal entries for a lesson
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireTeacher()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: lessonId } = await params

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      students: {
        include: { student: { select: { id: true, name: true, tag: true } } },
        orderBy:  { student: { name: 'asc' } },
      },
      files: { orderBy: { createdAt: 'asc' } },
    },
  })
  if (!lesson) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })

  return NextResponse.json({
    id:       lesson.id,
    date:     lesson.date,
    title:    lesson.title,
    tag:      lesson.tag,
    homework: lesson.homework,
    files:    lesson.files.map(f => ({ id: f.id, url: f.url, name: f.name, size: f.size })),
    entries:  lesson.students.map((ls) => ({
      studentId: ls.studentId,
      name:      ls.student.name,
      attended:  ls.attended,
      grade:     ls.grade,
      comment:   ls.comment,
    })),
  })
}
