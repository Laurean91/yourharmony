'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, CalendarDays, FileText,
  Globe, TrendingUp, X, ExternalLink, BookOpen, UserCheck, Library
} from 'lucide-react'
import SignOutButton from './SignOutButton'

const navItems = [
  { label: 'Дашборд',          href: '/bigbos',          icon: LayoutDashboard, exact: true  },
  { label: 'Мои ученики',      href: '/bigbos/students', icon: Users,           exact: false },
  { label: 'Расписание',       href: '/bigbos/schedule', icon: CalendarDays,    exact: false },
  { label: 'Журнал',           href: '/bigbos/journal',  icon: BookOpen,        exact: false },
  { label: 'Родители',         href: '/bigbos/parents',  icon: UserCheck,       exact: false },
  { label: 'Финансы',          href: '/bigbos/finance',  icon: TrendingUp,      exact: false },
  { label: 'Блог',             href: '/bigbos/blog',     icon: FileText,        exact: false },
  { label: 'Библиотека',       href: '/bigbos/library',  icon: Library,         exact: false },
  { label: 'Управление сайтом',href: '/bigbos/landing',  icon: Globe,           exact: false },
]

export default function AdminSidebar({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const pathname = usePathname()

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen w-60 flex flex-col z-50
          transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0`}
        style={{
          background: 'linear-gradient(180deg, #1c1045 0%, #130b35 60%, #0f0828 100%)',
          borderRight: '1px solid rgba(139,92,246,0.15)',
        }}
      >
        {/* Logo */}
        <div className="px-5 pt-5 pb-4 flex items-center justify-between">
          <Link href="/bigbos" className="flex items-center gap-3" onClick={onClose}>
            <svg width="36" height="36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="sb-gA" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a78bfa"/>
                  <stop offset="100%" stopColor="#7c3aed"/>
                </linearGradient>
                <linearGradient id="sb-gB" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fb923c"/>
                  <stop offset="100%" stopColor="#f97316"/>
                </linearGradient>
              </defs>
              <rect x="4" y="4" width="64" height="48" rx="14" fill="url(#sb-gA)"/>
              <polygon points="52,52 65,52 61,64" fill="#7c3aed"/>
              <rect x="36" y="54" width="58" height="40" rx="12" fill="url(#sb-gB)"/>
              <polygon points="40,54 52,54 43,44" fill="#f97316"/>
              <path d="M22 28 L23.1 24.9 L26 23.8 L23.1 22.7 L22 19.6 L20.9 22.7 L18 23.8 L20.9 24.9Z" fill="white" opacity="0.95"/>
              <path d="M36 28 L37.1 24.9 L40 23.8 L37.1 22.7 L36 19.6 L34.9 22.7 L32 23.8 L34.9 24.9Z" fill="white" opacity="0.88"/>
              <path d="M50 28 L51.1 24.9 L54 23.8 L51.1 22.7 L50 19.6 L48.9 22.7 L46 23.8 L48.9 24.9Z" fill="white" opacity="0.75"/>
              <path d="M50 70 Q65 80 80 70" stroke="white" strokeWidth="2.8" fill="none" strokeLinecap="round" opacity="0.85"/>
            </svg>
            <div>
              <p className="text-[15px] font-extrabold leading-tight"
                style={{
                  background: 'linear-gradient(90deg, #c4b5fd 0%, #fb923c 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Гармония
              </p>
              <p className="text-[8px] font-semibold uppercase tracking-[0.2em] leading-tight"
                style={{ color: 'rgba(167,139,250,0.55)' }}
              >
                Языковой клуб
              </p>
            </div>
          </Link>

          {/* Close — mobile only */}
          <button
            onClick={onClose}
            className="md:hidden w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Divider */}
        <div className="mx-5 h-px" style={{ background: 'rgba(139,92,246,0.2)' }} />

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ label, href, icon: Icon, exact }) => {
            const active = isActive(href, exact)
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active ? '' : ''
                }`}
                style={
                  active
                    ? {
                        background: 'linear-gradient(90deg, rgba(124,58,237,0.85) 0%, rgba(139,92,246,0.7) 100%)',
                        color: '#fff',
                        boxShadow: '0 4px 16px rgba(109,40,217,0.35)',
                      }
                    : {
                        color: 'rgba(255,255,255,0.45)',
                      }
                }
                onMouseEnter={e => {
                  if (!active) {
                    (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.07)'
                    ;(e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.85)'
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    (e.currentTarget as HTMLAnchorElement).style.background = ''
                    ;(e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.45)'
                  }
                }}
              >
                <Icon
                  size={17}
                  style={{ color: active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)' }}
                />
                {label}

                {/* Active dot */}
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Divider */}
        <div className="mx-5 h-px" style={{ background: 'rgba(139,92,246,0.2)' }} />

        {/* Bottom actions */}
        <div className="px-3 py-3 space-y-0.5">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
            style={{ color: 'rgba(255,255,255,0.38)' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.07)'
              ;(e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.75)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.background = ''
              ;(e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.38)'
            }}
          >
            <ExternalLink size={17} style={{ color: 'rgba(255,255,255,0.3)' }} />
            Открыть сайт
          </Link>
          <SignOutButton />
        </div>
      </aside>
    </>
  )
}
