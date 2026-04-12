import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// GET — возвращает статус TOTP для текущего пользователя
export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const totp = await prisma.totpSecret.findUnique({
    where: { userId: session.user.id },
    select: { verified: true },
  })

  return NextResponse.json({ enabled: totp?.verified ?? false })
}
