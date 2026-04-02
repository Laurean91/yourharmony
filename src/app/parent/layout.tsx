'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Home, Calendar, Star, CheckSquare, LogOut } from 'lucide-react'

const NAV = [
  { href: '/parent',            label: 'Главная',      icon: Home },
  { href: '/parent/schedule',   label: 'Расписание',   icon: Calendar },
  { href: '/parent/grades',     label: 'Успеваемость', icon: Star },
  { href: '/parent/attendance', label: 'Посещаемость', icon: CheckSquare },
]

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname === '/parent/login') return <>{children}</>

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ background: '#f0fdf4' }}>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 min-h-screen py-6 px-4"
        style={{ background: '#fff', borderRight: '1px solid #d1fae5', boxShadow: '2px 0 12px rgba(5,150,105,0.06)' }}>

        <div className="flex items-center gap-2.5 px-2 mb-8">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ background: 'linear-gradient(135deg, #34d399, #3b82f6)' }}>Г</div>
          <div>
            <p className="text-sm font-extrabold text-gray-800 leading-tight">Гармония</p>
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-1 pt-1 pb-safe"
        style={{ background: '#fff', borderTop: '1px solid #d1fae5', boxShadow: '0 -4px 20px rgba(5,150,105,0.08)', paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href}
              className="flex flex-col items-center gap-0.5 flex-1 py-2 rounded-xl transition-all min-h-[44px] justify-center"
              style={{ color: active ? '#059669' : '#9ca3af' }}>
              <Icon size={22} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Main content — padded above bottom nav + safe area */}
      <main className="flex-1 pb-20 md:pb-0" style={{ paddingBottom: 'calc(64px + env(safe-area-inset-bottom, 0px))' }}>
        {children}
      </main>
    </div>
  )
}
