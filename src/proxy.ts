import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const proxy = auth((req: NextRequest & { auth: { user?: { role?: string } } | null }) => {
  const { pathname } = req.nextUrl
  const session = req.auth
  const role = session?.user?.role

  // Защита /bigbos/* — только TEACHER
  if (pathname.startsWith('/bigbos') && pathname !== '/bigbos/login') {
    if (!session || role !== 'TEACHER') {
      const loginUrl = new URL('/bigbos/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Защита /parent/* — только PARENT (кроме login и preview)
  if (pathname.startsWith('/parent') && pathname !== '/parent/login' && !pathname.startsWith('/parent/preview')) {
    if (!session || role !== 'PARENT') {
      const loginUrl = new URL('/parent/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Редирект авторизованных пользователей со страниц логина
  if (pathname === '/bigbos/login' && session && role === 'TEACHER') {
    return NextResponse.redirect(new URL('/bigbos', req.url))
  }
  if (pathname === '/parent/login' && session && role === 'PARENT') {
    return NextResponse.redirect(new URL('/parent', req.url))
  }

  return NextResponse.next()
})

export const proxyConfig = {
  matcher: ['/bigbos/:path*', '/parent/:path*'],
}
