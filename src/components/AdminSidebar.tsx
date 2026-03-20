'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, FileText, Globe, TrendingUp, X } from 'lucide-react'
import SignOutButton from './SignOutButton'

const navItems = [
  { label: 'Дашборд', href: '/bigbos', icon: LayoutDashboard, exact: true },
  { label: 'Мои ученики', href: '/bigbos/students', icon: Users, exact: false },
  { label: 'Финансы', href: '/bigbos/finance', icon: TrendingUp, exact: false },
  { label: 'Блог', href: '/bigbos/blog', icon: FileText, exact: false },
  { label: 'Управление сайтом', href: '/bigbos/landing', icon: Globe, exact: false },
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
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen w-56 bg-white border-r border-gray-100 flex flex-col z-50 shadow-sm
          transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0`}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-100 flex items-center justify-between">
          <Link href="/bigbos" className="flex items-center gap-2.5" onClick={onClose}>
            <svg width="34" height="34" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="sbgA" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8B5CF6"/>
                  <stop offset="100%" stopColor="#7C3AED"/>
                </linearGradient>
                <linearGradient id="sbgB" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F97316"/>
                  <stop offset="100%" stopColor="#EC4899"/>
                </linearGradient>
              </defs>
              <rect x="4" y="4" width="64" height="48" rx="14" fill="url(#sbgA)"/>
              <polygon points="52,52 65,52 61,64" fill="#7C3AED"/>
              <rect x="36" y="54" width="58" height="40" rx="12" fill="url(#sbgB)"/>
              <polygon points="40,54 52,54 43,44" fill="#F97316"/>
              <path d="M22 28 L23.1 24.9 L26 23.8 L23.1 22.7 L22 19.6 L20.9 22.7 L18 23.8 L20.9 24.9Z" fill="white" opacity="0.95"/>
              <path d="M36 28 L37.1 24.9 L40 23.8 L37.1 22.7 L36 19.6 L34.9 22.7 L32 23.8 L34.9 24.9Z" fill="white" opacity="0.88"/>
              <path d="M50 28 L51.1 24.9 L54 23.8 L51.1 22.7 L50 19.6 L48.9 22.7 L46 23.8 L48.9 24.9Z" fill="white" opacity="0.75"/>
              <path d="M50 70 Q65 80 80 70" stroke="white" strokeWidth="2.8" fill="none" strokeLinecap="round" opacity="0.85"/>
            </svg>
            <div>
              <p className="text-base font-extrabold bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent leading-tight">
                Гармония
              </p>
              <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-purple-400/80 leading-tight">
                Языковой клуб
              </p>
            </div>
          </Link>
          {/* Close button — mobile only */}
          <button
            onClick={onClose}
            className="md:hidden w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ label, href, icon: Icon, exact }) => {
            const active = isActive(href, exact)
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon size={17} className={active ? 'text-white' : 'text-gray-400'} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom: site link + sign out */}
        <div className="px-3 pb-5 space-y-1 border-t border-gray-100 pt-4">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
          >
            <Globe size={17} className="text-gray-400" />
            Открыть сайт
          </Link>
          <SignOutButton />
        </div>

      </aside>
    </>
  )
}
