import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logAuthEvent } from '@/lib/auth-log'
import { Resend } from 'resend'
import { randomBytes } from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)
const MAGIC_LINK_TTL_MINUTES = 10

export async function POST(req: NextRequest) {
  let body: { email?: string }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const email = body.email?.trim().toLowerCase()
  if (!email) {
    return NextResponse.json({ error: 'email required' }, { status: 400 })
  }

  // Находим пользователя по email (только PARENT)
  const user = await prisma.user.findFirst({
    where: { email, role: 'PARENT' },
  })

  // Всегда возвращаем 200 — не раскрываем наличие email в системе
  if (!user) {
    return NextResponse.json({ ok: true })
  }

  // Удаляем старые неиспользованные токены для этого email
  await prisma.magicToken.deleteMany({
    where: { email, usedAt: null, expiresAt: { gt: new Date() } },
  })

  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + MAGIC_LINK_TTL_MINUTES * 60 * 1000)

  await prisma.magicToken.create({
    data: { email, token, expiresAt },
  })

  const baseUrl = process.env.NEXTAUTH_URL ?? 'https://yourharmony-english.ru'
  const magicUrl = `${baseUrl}/api/auth/magic-link/verify?token=${token}`

  await resend.emails.send({
    from: 'Гармония <noreply@yourharmony-english.ru>',
    to: email,
    subject: 'Вход в кабинет родителя — Гармония',
    html: `
      <p>Добрый день!</p>
      <p>Для входа в личный кабинет нажмите кнопку ниже. Ссылка действует ${MAGIC_LINK_TTL_MINUTES} минут.</p>
      <p><a href="${magicUrl}" style="background:#7c3aed;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">Войти в кабинет</a></p>
      <p style="color:#888;font-size:12px;">Если вы не запрашивали вход — просто проигнорируйте это письмо.</p>
    `,
  })

  await logAuthEvent('MAGIC_LINK_SENT', user.id)

  return NextResponse.json({ ok: true })
}
