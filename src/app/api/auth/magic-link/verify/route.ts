import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logAuthEvent } from '@/lib/auth-log'
import { signIn } from '@/auth'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(new URL('/parent/login?error=missing_token', req.url))
  }

  const magicToken = await prisma.magicToken.findUnique({ where: { token } })

  if (!magicToken) {
    return NextResponse.redirect(new URL('/parent/login?error=invalid_token', req.url))
  }

  if (magicToken.usedAt) {
    return NextResponse.redirect(new URL('/parent/login?error=token_used', req.url))
  }

  if (magicToken.expiresAt < new Date()) {
    return NextResponse.redirect(new URL('/parent/login?error=token_expired', req.url))
  }

  const user = await prisma.user.findFirst({
    where: { email: magicToken.email, role: 'PARENT' },
  })

  if (!user) {
    return NextResponse.redirect(new URL('/parent/login?error=user_not_found', req.url))
  }

  // Помечаем токен как использованный
  await prisma.magicToken.update({
    where: { id: magicToken.id },
    data: { usedAt: new Date() },
  })

  await logAuthEvent('MAGIC_LINK_USED', user.id)

  // Создаём NextAuth сессию через magic-link провайдер
  await signIn('magic-link', {
    redirect: false,
    userId: user.id,
    token,
  })

  return NextResponse.redirect(new URL('/parent', req.url))
}
