import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import { prisma } from '@/lib/prisma'

// POST /api/auth/mobile — returns a JWT for mobile apps (no cookie session needed)
// Body: { username, password }
export async function POST(req: NextRequest) {
  let body: { username?: string; password?: string }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { username, password } = body
  if (!username || !password) {
    return NextResponse.json({ error: 'username and password required' }, { status: 400 })
  }

  let userId = ''
  let name   = ''
  let role: 'TEACHER' | 'PARENT' = 'PARENT'

  // Check teacher credentials
  const adminUser     = process.env.ADMIN_USER
  const adminPassword = process.env.ADMIN_PASSWORD
  if (adminUser && adminPassword && username === adminUser && password === adminPassword) {
    userId = '0'
    name   = 'Admin'
    role   = 'TEACHER'
  } else {
    // Check parent in DB
    const user = await prisma.user.findUnique({
      where: { username },
      include: { parent: true },
    })
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    const match = await bcrypt.compare(password, user.passwordHash)
    if (!match) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    userId = user.id
    name   = user.parent?.name ?? username
    role   = user.role as 'TEACHER' | 'PARENT'
  }

  const secret = new TextEncoder().encode(process.env.AUTH_SECRET)
  const token  = await new SignJWT({ sub: userId, name, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret)

  return NextResponse.json({ token, userId, name, role })
}
