'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Home, Calendar, Star, CheckSquare, LogOut, Sparkles, Library } from 'lucide-react'
import ParentMobileTopBar from '@/components/ParentMobileTopBar'

const NAV = [
  { href: '/parent',            label: 'Главная',      mobile: 'Главная',    icon: Home },
  { href: '/parent/schedule',   label: 'Расписание',   mobile: 'Расписание', icon: Calendar },
  { href: '/parent/grades',     label: 'Успеваемость', mobile: 'Оценки',     icon: Star },
  { href: '/parent/attendance', label: 'Посещаемость', mobile: 'Посещения',  icon: CheckSquare },
  { href: '/parent/stars',      label: 'Звёзды',       mobile: 'Звёзды',    icon: Sparkles },
  { href: '/parent/library',    label: 'Литература',   mobile: 'Книги',     icon: Library },
]

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname === '/parent/login' || pathname.startsWith('/parent/preview')) return <>{children}</>

  return (
    <>
    <ParentMobileTopBar />
    <div
      data-parent-theme="light"
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: 'var(--par-bg-base)' }}
    >
      {/* ── Decorative animated blobs ── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="parent-blob-1 absolute rounded-full" style={{
          width: 400, height: 400, top: '-5%', right: '-8%',
          background: 'radial-gradient(circle, rgba(79,70,229,0.15), transparent 70%)',
        }} />
        <div className="parent-blob-2 absolute rounded-full" style={{
          width: 350, height: 350, bottom: '10%', left: '-6%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.12), transparent 70%)',
        }} />
        <div className="parent-blob-1 absolute rounded-full" style={{
          width: 250, height: 250, top: '40%', left: '50%',
          background: 'radial-gradient(circle, rgba(249,115,22,0.08), transparent 70%)',
          animationDelay: '3s',
        }} />
      </div>

      {/* ── Desktop top nav (md+) ── */}
      <nav
        className="sticky top-0 z-50 hidden md:flex items-center gap-1 px-4 h-[60px]"
        style={{
          background: 'var(--par-nav-bg)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--par-glass-border)',
          boxShadow: '0 2px 20px rgba(79,70,229,0.06)',
        }}
      >

        {/* Logo */}
        <Link href="/parent" className="flex items-center gap-2.5 mr-4 shrink-0">
          <Image src="/logo.svg" width={30} height={30} alt="Гармония" />
          <span
            className="text-[17px] font-extrabold tracking-tight hidden sm:block"
            style={{ color: 'var(--par-accent)' }}
          >
            Гармония
          </span>
        </Link>

        {/* Nav items */}
        <div className="flex items-center gap-0.5 overflow-x-auto flex-1 scrollbar-hide">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-200 whitespace-nowrap shrink-0"
                style={
                  active
                    ? {
                        background: 'var(--par-nav-active-bg)',
                        color: 'var(--par-nav-active)',
                        fontWeight: 600,
                        borderBottom: '2px solid var(--par-accent)',
                      }
                    : { color: 'var(--par-nav-item)' }
                }
                onMouseEnter={e => {
                  if (!active) {
                    const el = e.currentTarget as HTMLAnchorElement
                    el.style.background = 'rgba(79,70,229,0.06)'
                    el.style.color = 'var(--par-accent)'
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    const el = e.currentTarget as HTMLAnchorElement
                    el.style.background = ''
                    el.style.color = 'var(--par-nav-item)'
                  }
                }}
              >
                <Icon size={14} className="shrink-0" />
                <span>{label}</span>
              </Link>
            )
          })}
        </div>

        {/* Sign out */}
        <button
          onClick={() => signOut({ callbackUrl: '/parent/login' })}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-200 shrink-0 ml-2"
          style={{ color: 'var(--par-text-muted)' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.06)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--par-text-muted)'; e.currentTarget.style.background = '' }}
        >
          <LogOut size={14} />
          <span className="hidden lg:inline">Выйти</span>
        </button>
      </nav>

      {/* ── Mobile glass bottom nav ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-1 pt-1"
        style={{
          background: 'var(--par-nav-bg)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid var(--par-glass-border)',
          boxShadow: '0 -4px 24px rgba(79,70,229,0.08)',
          paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
        }}
      >
        {NAV.map(({ href, mobile, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 flex-1 py-1.5 rounded-xl transition-all min-h-[44px] justify-center relative"
              style={{ color: active ? 'var(--par-accent)' : 'var(--par-text-muted)' }}
            >
              {active && (
                <span
                  className="absolute top-0.5 left-1/2 -translate-x-1/2 rounded-full"
                  style={{ width: 4, height: 4, background: 'var(--par-accent)' }}
                />
              )}
              <Icon size={18} />
              <span className="text-[8px] font-medium truncate max-w-full px-0.5">{mobile}</span>
            </Link>
          )
        })}
      </nav>

      {/* ── Main content ── */}
      <main
        className="flex-1 z-10 relative"
        style={{ paddingBottom: 'calc(64px + env(safe-area-inset-bottom, 0px))' }}
      >

        {children}
      </main>
    </div>
    </>
  )
}
