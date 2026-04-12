import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { verifyTotpCode } from '@/lib/totp'
import { logAuthEvent } from '@/lib/auth-log'

// POST — проверяет TOTP-код и активирует 2FA (при setup) или подтверждает вход
// Body: { code: string }
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: { code?: string }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const code = body.code?.trim()
  if (!code || !/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: 'code must be 6 digits' }, { status: 400 })
  }

  const totpRecord = await prisma.totpSecret.findUnique({
    where: { userId: session.user.id },
  })

  if (!totpRecord) {
    return NextResponse.json({ error: 'TOTP not configured' }, { status: 400 })
  }

  const valid = verifyTotpCode(totpRecord.secret, code)

  if (!valid) {
    await logAuthEvent('TOTP_FAIL', session.user.id)
    return NextResponse.json({ error: 'Invalid code' }, { status: 401 })
  }

  await logAuthEvent('TOTP_VERIFIED', session.user.id)

  // Если это первая верификация — активируем 2FA
  if (!totpRecord.verified) {
    await prisma.totpSecret.update({
      where: { userId: session.user.id },
      data: { verified: true },
    })
    return NextResponse.json({ ok: true, activated: true })
  }

  return NextResponse.json({ ok: true, activated: false })
}
