'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Home, Calendar, Star, CheckSquare, LogOut, Sparkles, Library } from 'lucide-react'

const NAV = [
  { href: '/parent',            label: 'Главная',      mobile: 'Главная',   icon: Home },
  { href: '/parent/schedule',   label: 'Расписание',   mobile: 'Расписание', icon: Calendar },
  { href: '/parent/grades',     label: 'Успеваемость', mobile: 'Оценки',    icon: Star },
  { href: '/parent/attendance', label: 'Посещаемость', mobile: 'Посещения', icon: CheckSquare },
  { href: '/parent/stars',      label: 'Звёзды',       mobile: 'Звёзды',   icon: Sparkles },
  { href: '/parent/library',    label: 'Литература',   mobile: 'Книги',    icon: Library },
]

// Subtle dot-grid pattern as inline SVG data URL
const dotPattern = `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1' cy='1' r='1' fill='rgba(5%2C150%2C105%2C0.07)'/%3E%3C/svg%3E")`

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname === '/parent/login') return <>{children}</>

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ background: '#f0fdf4' }}>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 min-h-screen py-6 px-4"
        style={{
          background: '#fff',
          borderRight: '1px solid #d1fae5',
          boxShadow: '2px 0 12px rgba(5,150,105,0.06)',
          borderTop: '3px solid #34d399',
        }}>

        <div className="flex items-center gap-2.5 px-2 mb-8">
          <Image src="/logo.svg" width={36} height={36} alt="Гармония" />
          <div>
            <p className="text-sm font-extrabold text-gray-800 leading-tight"
              style={{ textShadow: '0 0 12px rgba(5,150,105,0.25)' }}>
              Гармония
            </p>
            <p className="text-[10px] text-emerald-500 font-medium">Кабинет родителя</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link key={href} href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: active ? 'linear-gradient(90deg, #d1fae5, #dbeafe)' : 'transparent',
                  color: active ? '#065f46' : '#6b7280',
                  fontWeight: active ? 700 : 500,
                  borderLeft: active ? '3px solid #059669' : '3px solid transparent',
                  boxShadow: active ? '0 2px 8px rgba(5,150,105,0.1)' : 'none',
                }}>
                <Icon size={16} />
                {label}
              </Link>
            )
          })}
        </nav>

        <button onClick={() => signOut({ callbackUrl: '/parent/login' })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all mt-2">
          <LogOut size={16} />
          Выйти
        </button>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-1 pt-1"
        style={{
          background: '#fff',
          borderTop: '1px solid #d1fae5',
          boxShadow: '0 -4px 20px rgba(5,150,105,0.08)',
          paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
        }}>
        {NAV.map(({ href, mobile, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href}
              className="flex flex-col items-center gap-0.5 flex-1 py-1.5 rounded-xl transition-all min-h-[44px] justify-center"
              style={{ color: active ? '#059669' : '#9ca3af' }}>
              <Icon size={18} />
              <span className="text-[8px] font-medium truncate max-w-full px-0.5">{mobile}</span>
            </Link>
          )
        })}
      </nav>

      {/* Main content */}
      <main className="flex-1 pb-20 md:pb-0"
        style={{
          backgroundImage: dotPattern,
          paddingBottom: 'calc(64px + env(safe-area-inset-bottom, 0px))',
        }}>
        {children}
      </main>
    </div>
  )
}
