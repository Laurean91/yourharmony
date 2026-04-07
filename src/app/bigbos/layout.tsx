'use client'

import { usePathname } from 'next/navigation'
import AdminNav from '@/components/AdminNav'
import AdminMobileTopBar from '@/components/AdminMobileTopBar'
import AdminMobileBottomNav from '@/components/AdminMobileBottomNav'
import { AdminThemeProvider, useAdminTheme } from '@/contexts/AdminThemeContext'

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { theme } = useAdminTheme()
  const isDark = theme === 'dark'

  if (pathname === '/bigbos/login') {
    return <>{children}</>
  }

  return (
    <div
      data-admin-theme={theme}
      suppressHydrationWarning
      className="min-h-screen flex flex-col"
      style={
        isDark
          ? { background: 'linear-gradient(160deg, #1c1045 0%, #130b35 50%, #0f0828 100%)' }
          : { background: '#faf9ff' }
      }
    >
      <AdminMobileTopBar />
      <AdminNav />
      <main className="flex-1 pb-16 md:pb-0">
        {children}
      </main>
      <AdminMobileBottomNav />
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminThemeProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminThemeProvider>
  )
}
