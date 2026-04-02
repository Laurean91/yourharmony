import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const role = req.auth?.user?.role
  const isAuthenticated = !!role

  const isTeacherPath = pathname.startsWith('/bigbos')
  const isParentPath  = pathname.startsWith('/parent')
  const isLoginPage   = pathname === '/bigbos/login' || pathname === '/parent/login'

  // Public login pages — always allow
  if (isLoginPage) return NextResponse.next()

  // /bigbos/* — TEACHER only
  if (isTeacherPath) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/bigbos/login', req.url))
    }
    if (role !== 'TEACHER') {
      return NextResponse.redirect(new URL('/parent', req.url))
    }
  }

  // /parent/* — PARENT only
  if (isParentPath) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/parent/login', req.url))
    }
    if (role !== 'PARENT') {
      return NextResponse.redirect(new URL('/bigbos', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/bigbos/:path*', '/parent/:path*'],
}
