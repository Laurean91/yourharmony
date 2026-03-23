'use client'

import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/bigbos/login' })}
      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
      style={{ color: 'rgba(255,255,255,0.38)' }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.15)'
        ;(e.currentTarget as HTMLButtonElement).style.color = 'rgba(252,165,165,0.9)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.background = ''
        ;(e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.38)'
      }}
    >
      <LogOut size={17} style={{ color: 'inherit' }} className="shrink-0" />
      Выйти
    </button>
  )
}
