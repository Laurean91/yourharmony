'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAdminTheme } from '@/contexts/AdminThemeContext'

export default function AdminMobileTopBar() {
  const { theme, toggleTheme } = useAdminTheme()
  const isDark = theme === 'dark'

  return (
    <div
      className="sticky top-0 z-40 md:hidden flex items-center justify-between px-4 h-[60px]"
      style={{
        background: isDark ? 'rgba(28,16,69,0.92)' : 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: isDark ? '1px solid rgba(139,92,246,0.12)' : '1px solid rgba(124,58,237,0.10)',
      }}
    >
      {/* Logo */}
      <Link href="/bigbos" className="flex items-center gap-2 shrink-0">
        <Image src="/logo.svg" width={28} height={28} alt="Гармония" />
        <span
          className="text-[15px] font-extrabold tracking-tight"
          style={{ color: isDark ? '#c4b5fd' : '#7c3aed' }}
        >
          Гармония
        </span>
      </Link>

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
        <span>{isDark ? 'Светлая' : 'Тёмная'}</span>
      </button>
    </div>
  )
}
