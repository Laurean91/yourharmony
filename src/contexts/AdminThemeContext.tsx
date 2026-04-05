'use client'

import { createContext, useContext, useState } from 'react'

type Theme = 'light' | 'dark'

interface AdminThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

const AdminThemeContext = createContext<AdminThemeContextValue>({
  theme: 'light',
  toggleTheme: () => {},
})

const STORAGE_KEY = 'harmony-admin-theme'

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light'
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'dark' ? 'dark' : 'light'
  })

  function toggleTheme() {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light'
      localStorage.setItem(STORAGE_KEY, next)
      return next
    })
  }

  return (
    <AdminThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </AdminThemeContext.Provider>
  )
}

export function useAdminTheme() {
  return useContext(AdminThemeContext)
}
