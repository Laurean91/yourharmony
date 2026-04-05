'use client'

import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/bigbos/login' })}
      className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors shrink-0"
      style={{ color: 'var(--adm-text-muted)' }}
      title="Выйти"
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.12)'
        ;(e.currentTarget as HTMLButtonElement).style.color = '#ef4444'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.background = ''
        ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--adm-text-muted)'
      }}
    >
      <LogOut size={15} style={{ color: 'inherit' }} />
    </button>
  )
}
