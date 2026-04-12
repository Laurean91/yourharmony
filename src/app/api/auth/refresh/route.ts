import { NextRequest, NextResponse } from 'next/server'
import { rotateRefreshToken } from '@/lib/refresh-tokens'
import { logAuthEvent } from '@/lib/auth-log'
import { prisma } from '@/lib/prisma'
import { SignJWT } from 'jose'

const ACCESS_TOKEN_TTL_SECONDS = 15 * 60 // 15 минут

async function signAccessToken(userId: string, role: string): Promise<string> {
  const secret = new TextEncoder().encode(process.env.AUTH_SECRET!)
  return new SignJWT({ role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TOKEN_TTL_SECONDS}s`)
    .sign(secret)
}

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get('refresh_token')?.value

  if (!refreshToken) {
    return NextResponse.json({ error: 'No refresh token' }, { status: 401 })
  }

  const result = await rotateRefreshToken(refreshToken)

  if (!result) {
    const response = NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    response.cookies.delete('refresh_token')
    return response
  }

  const { newToken, userId } = result

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 401 })
  }

  const accessToken = await signAccessToken(userId, user.role)

  await logAuthEvent('TOKEN_REFRESH', userId)

  const response = NextResponse.json({ ok: true })

  response.cookies.set('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: ACCESS_TOKEN_TTL_SECONDS,
    path: '/',
  })

  response.cookies.set('refresh_token', newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 дней
    path: '/',
  })

  return response
}
