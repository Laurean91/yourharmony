'use client'

import Link from 'next/link'
import Image from 'next/image'
import { LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'

export default function ParentMobileTopBar() {
  return (
    <div
      className="sticky top-0 z-50 md:hidden flex items-center justify-between px-5 h-[64px]"
      style={{
        background: 'linear-gradient(135deg, rgba(238,242,255,0.96) 0%, rgba(224,231,255,0.94) 50%, rgba(255,247,237,0.93) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(79,70,229,0.12)',
        boxShadow: '0 2px 16px rgba(79,70,229,0.08)',
      }}
    >
      <Link href="/parent" className="flex items-center gap-2 shrink-0">
        <Image src="/logo.svg" width={28} height={28} alt="Гармония" />
        <span
          className="text-[15px] font-extrabold tracking-tight"
          style={{ color: '#4f46e5' }}
        >
          Гармония
        </span>
      </Link>

      <button
        onClick={() => signOut({ callbackUrl: '/parent/login' })}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-semibold transition-all duration-200"
        style={{
          color: '#6b7280',
          border: '1.5px solid rgba(79,70,229,0.18)',
          background: 'transparent',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.color = '#ef4444'
          e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color = '#6b7280'
          e.currentTarget.style.borderColor = 'rgba(79,70,229,0.18)'
        }}
      >
        <LogOut size={15} />
        <span>Выйти</span>
      </button>
    </div>
  )
}
