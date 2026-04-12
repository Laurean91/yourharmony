import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { generateTotpSetup } from '@/lib/totp'

// GET — генерирует новый TOTP-секрет и возвращает QR-код для сканирования
export async function GET(_req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { secret, qrCodeDataUrl } = await generateTotpSetup(user.username)

  // Сохраняем секрет как непроверенный (verified: false)
  await prisma.totpSecret.upsert({
    where: { userId: user.id },
    create: { userId: user.id, secret, verified: false },
    update: { secret, verified: false },
  })

  return NextResponse.json({ qrCodeDataUrl })
}
