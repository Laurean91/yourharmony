import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!auth) {
    return new NextResponse('Auth Required', { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="Admin"' } })
  }
  const [user, pwd] = Buffer.from(auth.split(' ')[1], 'base64').toString().split(':')
  // Жестко зашитые логин и пароль для админки (admin / p@ssword)
  if (user === 'admin' && pwd === 'p@ssword') return NextResponse.next()
  
  return new NextResponse('Auth Required', { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="Admin"' } })
}

export const config = { matcher: '/admin/:path*' }
