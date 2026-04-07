'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, CalendarDays, BookOpen,
  MoreHorizontal, TrendingUp, UserCheck, FileText, Library, Globe,
} from 'lucide-react'
import { useAdminTheme } from '@/contexts/AdminThemeContext'
import { useState } from 'react'

const MAIN_TABS = [
  { label: 'Главная',    href: '/bigbos',          icon: LayoutDashboard, exact: true  },
  { label: 'Ученики',    href: '/bigbos/students', icon: Users,           exact: false },
  null, // FAB slot
  { label: 'Расписание', href: '/bigbos/schedule', icon: CalendarDays,    exact: false },
  { label: 'Ещё',        href: null,               icon: MoreHorizontal,  exact: false },
] as const

const MORE_ITEMS = [
  { label: 'Финансы',   href: '/bigbos/finance',  icon: TrendingUp  },
  { label: 'Журнал',    href: '/bigbos/journal',  icon: BookOpen    },
  { label: 'Родители',  href: '/bigbos/parents',  icon: UserCheck   },
  { label: 'Блог',      href: '/bigbos/blog',     icon: FileText    },
  { label: 'Библиотека',href: '/bigbos/library',  icon: Library     },
  { label: 'Сайт',      href: '/bigbos/landing',  icon: Globe       },
]

export default function AdminMobileBottomNav() {
  const pathname = usePathname()
  const { theme } = useAdminTheme()
  const isDark = theme === 'dark'
  const [showMore, setShowMore] = useState(false)

  function isActive(href: string | null, exact: boolean) {
    if (!href) return MORE_ITEMS.some(i => pathname.startsWith(i.href))
    return exact ? pathname === href : pathname.startsWith(href)
  }

  return (
    <>
      {/* More drawer */}
      {showMore && (
        <>
          <div
            className="fixed inset-0 z-40 md:hidden"
            style={{ background: 'rgba(0,0,0,0.4)' }}
            onClick={() => setShowMore(false)}
          />
          <div
            className="fixed bottom-[60px] left-0 right-0 z-50 md:hidden rounded-t-2xl overflow-hidden"
            style={{
              background: isDark ? 'rgba(20,10,55,0.97)' : 'rgba(255,255,255,0.98)',
              borderTop: `1px solid ${isDark ? 'rgba(167,139,250,0.15)' : 'rgba(124,58,237,0.12)'}`,
              backdropFilter: 'blur(20px)',
            }}
          >
            <div className="px-4 pt-3 pb-2">
              <div className="w-8 h-1 rounded-full mx-auto mb-3"
                style={{ background: isDark ? 'rgba(167,139,250,0.3)' : 'rgba(124,58,237,0.2)' }} />
              <p className="text-xs font-bold uppercase tracking-wider mb-3"
                style={{ color: 'var(--adm-text-muted)' }}>Разделы</p>
            </div>
            <div className="grid grid-cols-3 gap-1 px-3 pb-4">
              {MORE_ITEMS.map(item => {
                const active = pathname.startsWith(item.href)
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMore(false)}
                    className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl transition-all"
                    style={{
                      background: active
                        ? (isDark ? 'rgba(124,58,237,0.2)' : 'rgba(124,58,237,0.08)')
                        : 'transparent',
                      color: active
                        ? '#7c3aed'
                        : isDark ? 'rgba(167,139,250,0.7)' : '#6b7280',
                    }}
                  >
                    <Icon size={22} />
                    <span style={{ fontSize: 11, fontWeight: active ? 700 : 500, lineHeight: 1 }}>
                      {item.label}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* Bottom bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden flex items-center"
        style={{
          height: 'calc(60px + env(safe-area-inset-bottom, 0px))',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          background: isDark ? 'rgba(28,16,69,0.92)' : 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: `1px solid ${isDark ? 'rgba(167,139,250,0.12)' : 'rgba(124,58,237,0.10)'}`,
          boxShadow: isDark ? '0 -8px 32px rgba(0,0,0,0.4)' : '0 -4px 20px rgba(124,58,237,0.08)',
        }}
      >
        {MAIN_TABS.map((tab, i) => {
          /* FAB slot */
          if (tab === null) {
            return (
              <div key="fab" className="flex-1 flex items-center justify-center">
                <Link
                  href="/bigbos/schedule"
                  className="flex items-center justify-center rounded-full text-white"
                  style={{
                    width: 48, height: 48,
                    background: 'linear-gradient(135deg, #7c3aed, #f97316)',
                    boxShadow: isDark ? '0 4px 20px rgba(124,58,237,0.55)' : '0 4px 16px rgba(124,58,237,0.40)',
                    transform: 'translateY(-10px)',
                  }}
                >
                  <CalendarDays size={22} />
                </Link>
              </div>
            )
          }

          const { label, href, icon: Icon, exact } = tab
          const active = isActive(href, exact)

          /* More button */
          if (!href) {
            return (
              <button
                key="more"
                onClick={() => setShowMore(v => !v)}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 relative"
                style={{
                  minHeight: 44,
                  color: showMore || active
                    ? '#7c3aed'
                    : isDark ? 'rgba(167,139,250,0.55)' : '#9ca3af',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {(showMore || active) && (
                  <span className="absolute rounded-full"
                    style={{ width: 4, height: 4, background: '#7c3aed', top: 4, left: '50%', transform: 'translateX(-50%)' }} />
                )}
                <Icon size={20} />
                <span style={{ fontSize: 10, fontWeight: (showMore || active) ? 700 : 500, lineHeight: 1 }}>
                  {label}
                </span>
              </button>
            )
          }

          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 relative"
              style={{
                minHeight: 44,
                textDecoration: 'none',
                color: active ? '#7c3aed' : isDark ? 'rgba(167,139,250,0.55)' : '#9ca3af',
              }}
            >
              {active && (
                <span className="absolute rounded-full"
                  style={{ width: 4, height: 4, background: '#7c3aed', top: 4, left: '50%', transform: 'translateX(-50%)' }} />
              )}
              <Icon size={20} />
              <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, lineHeight: 1 }}>
                {label}
              </span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
