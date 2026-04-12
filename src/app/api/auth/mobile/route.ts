import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import { prisma } from '@/lib/prisma'
import { createRefreshToken, rotateRefreshToken } from '@/lib/refresh-tokens'
import { logAuthEvent } from '@/lib/auth-log'

const ACCESS_TOKEN_TTL = '2h'

async function signAccessToken(userId: string, role: string): Promise<string> {
  const secret = new TextEncoder().encode(process.env.AUTH_SECRET!)
  return new SignJWT({ role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_TTL)
    .sign(secret)
}

// POST /api/auth/mobile/login — вход (username + password)
export async function POST(req: NextRequest) {
  const { pathname } = req.nextUrl

  // /api/auth/mobile/refresh — ротация refresh-токена
  if (pathname.endsWith('/refresh')) {
    return handleRefresh(req)
  }

  let body: { username?: string; password?: string }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { username, password } = body
  if (!username || !password) {
    return NextResponse.json({ error: 'username and password required' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { username },
    include: { parent: true },
  })

  if (!user) {
    await logAuthEvent('LOGIN_FAIL')
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const match = await bcrypt.compare(password, user.passwordHash)
  if (!match) {
    await logAuthEvent('LOGIN_FAIL', user.id)
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  await logAuthEvent('LOGIN_SUCCESS', user.id)

  const accessToken = await signAccessToken(user.id, user.role)
  const refreshToken = await createRefreshToken(user.id)
  const name = user.parent?.name ?? username

  return NextResponse.json({
    accessToken,
    refreshToken,
    userId: user.id,
    name,
    role: user.role,
    expiresIn: 7200,
  })
}

async function handleRefresh(req: NextRequest) {
  let body: { refreshToken?: string }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.refreshToken) {
    return NextResponse.json({ error: 'refreshToken required' }, { status: 400 })
  }

  const result = await rotateRefreshToken(body.refreshToken)
  if (!result) {
    return NextResponse.json({ error: 'Invalid or expired refresh token' }, { status: 401 })
  }

  const { newToken, userId } = result
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 401 })
  }

  const accessToken = await signAccessToken(userId, user.role)
  await logAuthEvent('TOKEN_REFRESH', userId)

  return NextResponse.json({
    accessToken,
    refreshToken: newToken,
    expiresIn: 7200,
  })
}
