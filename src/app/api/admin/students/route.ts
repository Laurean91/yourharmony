import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/students — list all students (for teacher use)
export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const students = await prisma.student.findMany({
    select: { id: true, name: true, tag: true, age: true },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(students)
}
