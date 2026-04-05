'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, CalendarDays, FileText,
  Globe, TrendingUp, BookOpen, UserCheck, Library, ExternalLink,
} from 'lucide-react'
import SignOutButton from './SignOutButton'
import { useAdminTheme } from '@/contexts/AdminThemeContext'

const navItems = [
  { label: 'Главная',    href: '/bigbos',          icon: LayoutDashboard, exact: true  },
  { label: 'Ученики',    href: '/bigbos/students', icon: Users,           exact: false },
  { label: 'Расписание', href: '/bigbos/schedule', icon: CalendarDays,    exact: false },
  { label: 'Журнал',     href: '/bigbos/journal',  icon: BookOpen,        exact: false },
  { label: 'Родители',   href: '/bigbos/parents',  icon: UserCheck,       exact: false },
  { label: 'Финансы',    href: '/bigbos/finance',  icon: TrendingUp,      exact: false },
  { label: 'Блог',       href: '/bigbos/blog',     icon: FileText,        exact: false },
  { label: 'Библиотека', href: '/bigbos/library',  icon: Library,         exact: false },
  { label: 'Сайт',       href: '/bigbos/landing',  icon: Globe,           exact: false },
]

export default function AdminNav() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useAdminTheme()
  const isDark = theme === 'dark'

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  return (
    <nav
      className="sticky top-0 z-50 flex items-center gap-1 px-4 h-[60px]"
      style={{
        background: 'var(--adm-nav-bg)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--adm-nav-border)',
      }}
    >
      {/* Logo */}
      <Link href="/bigbos" className="flex items-center gap-2.5 mr-4 shrink-0">
        <svg width="30" height="26" viewBox="0 0 54 46" fill="none">
          <defs>
            <linearGradient id="nav-gA" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#a78bfa"/>
              <stop offset="100%" stopColor="#7c3aed"/>
            </linearGradient>
            <linearGradient id="nav-gB" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fb923c"/>
              <stop offset="100%" stopColor="#f97316"/>
            </linearGradient>
          </defs>
          <rect x="0" y="2" width="30" height="30" rx="7" fill="url(#nav-gA)"/>
          <polygon points="28,10 32,10 32,24 28,24" fill="url(#nav-gA)"/>
          <rect x="22" y="14" width="32" height="30" rx="6" fill="url(#nav-gB)"/>
          <path d="M9 11 L9 19 M6 11 L12 11" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
          <path d="M18 11 L18 19 M15 11 L21 11" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
          <circle cx="13.5" cy="23" r="2" fill="white" opacity="0.7"/>
          <path d="M34 28 Q39 35 46 28" stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
          <circle cx="34" cy="24" r="1.5" fill="white" opacity="0.8"/>
          <circle cx="46" cy="24" r="1.5" fill="white" opacity="0.8"/>
        </svg>
        <span
          className="text-[17px] font-extrabold tracking-tight hidden sm:block"
          style={{
            background: isDark
              ? 'linear-gradient(90deg, #c4b5fd, #fb923c)'
              : 'linear-gradient(90deg, #7c3aed, #f97316)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Гармония
        </span>
      </Link>

      {/* Nav items — scroll on small screens */}
      <div className="flex items-center gap-0.5 overflow-x-auto flex-1 scrollbar-hide">
        {navItems.map(({ label, href, icon: Icon, exact }) => {
          const active = isActive(href, exact)
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-200 whitespace-nowrap shrink-0"
              style={
                active
                  ? {
                      background: 'var(--adm-nav-active-bg)',
                      color: 'var(--adm-nav-active)',
                      fontWeight: 600,
                      borderBottom: isDark ? '2px solid #7c3aed' : undefined,
                    }
                  : { color: 'var(--adm-nav-item)' }
              }
              onMouseEnter={e => {
                if (!active) {
                  const el = e.currentTarget as HTMLAnchorElement
                  el.style.background = 'var(--adm-nav-item-hover-bg)'
                  el.style.color = 'var(--adm-nav-item-hover)'
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  const el = e.currentTarget as HTMLAnchorElement
                  el.style.background = ''
                  el.style.color = 'var(--adm-nav-item)'
                }
              }}
            >
              <Icon size={14} className="shrink-0" />
              <span className="hidden md:inline">{label}</span>
            </Link>
          )
        })}
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-2 ml-2 shrink-0">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-semibold transition-all duration-200"
          style={{
            color: isDark ? 'rgba(196,181,253,0.8)' : '#7c3aed',
            border: `1.5px solid ${isDark ? 'rgba(167,139,250,0.2)' : 'rgba(124,58,237,0.25)'}`,
            background: 'transparent',
          }}
        >
          {isDark ? '☀️' : '🌙'}
          <span className="hidden lg:inline">
            {isDark ? 'Светлая' : 'Тёмная'}
          </span>
        </button>

        {/* Open site */}
        <Link
          href="/"
          target="_blank"
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
          style={{ color: 'var(--adm-text-muted)' }}
          title="Открыть сайт"
        >
          <ExternalLink size={15} />
        </Link>

        {/* Avatar / sign out */}
        <div
          className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer shrink-0"
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #f97316)',
            boxShadow: isDark ? '0 0 12px rgba(124,58,237,0.4)' : 'none',
          }}
        >
          А
        </div>

        <SignOutButton />
      </div>
    </nav>
  )
}
