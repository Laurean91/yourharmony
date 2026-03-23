'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import AdminSidebar from '@/components/AdminSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (pathname === '/bigbos/login') {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#f5f3ff' }}>
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col md:ml-60 min-h-screen overflow-x-hidden">
        {/* Mobile top bar */}
        <header
          className="md:hidden flex items-center gap-3 px-4 py-3 sticky top-0 z-30"
          style={{
            background: 'rgba(245,243,255,0.85)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(139,92,246,0.12)',
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl transition-colors"
            style={{ color: '#7c3aed', background: 'rgba(124,58,237,0.08)' }}
          >
            <Menu size={20} />
          </button>
          <span
            className="text-sm font-extrabold"
            style={{
              background: 'linear-gradient(90deg, #7c3aed 0%, #f97316 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Гармония
          </span>
        </header>

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
