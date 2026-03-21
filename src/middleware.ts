import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isLoginPage = req.nextUrl.pathname === '/bigbos/login'
  const isAuthenticated = !!req.auth?.user?.name

  if (!isAuthenticated && !isLoginPage) {
    const loginUrl = new URL('/bigbos/login', req.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
})

export const config = { matcher: ['/bigbos/:path*'] }
