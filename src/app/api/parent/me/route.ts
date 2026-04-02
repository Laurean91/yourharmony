import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// GET /api/parent/me — profile + list of children
export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== 'PARENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parent = await prisma.parent.findUnique({
    where: { userId: session.user.id },
    include: {
      students: {
        include: {
          student: {
            select: { id: true, name: true, age: true, tag: true },
          },
        },
      },
    },
  })

  if (!parent) {
    return NextResponse.json({ error: 'Parent not found' }, { status: 404 })
  }

  return NextResponse.json({
    id: parent.id,
    name: parent.name,
    phone: parent.phone,
    email: parent.email,
    students: parent.students.map((ps) => ps.student),
  })
}
