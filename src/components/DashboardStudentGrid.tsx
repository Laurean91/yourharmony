'use client'

import { useState } from 'react'
import Link from 'next/link'
import StudentModal from './StudentModal'
import type { StudentForModal } from './StudentModal'
import { useAdminTheme } from '@/contexts/AdminThemeContext'

const TAG_COLORS: Record<string, string> = {
  'Индивидуальное': 'bg-purple-100 text-purple-700',
  'Группа': 'bg-blue-100 text-blue-700',
}

export default function DashboardStudentGrid({ students }: { students: StudentForModal[] }) {
  const [selected, setSelected] = useState<StudentForModal | null>(null)
  const { theme } = useAdminTheme()
  const isDark = theme === 'dark'

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {students.slice(0, 8).map(s => (
          <button
            key={s.id}
            onClick={() => setSelected(s)}
            className="flex items-center gap-3 p-3 rounded-xl transition-colors text-left"
            style={{
              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(249,247,255,0.6)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(139,92,246,0.1)'}`,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = isDark ? 'rgba(124,58,237,0.15)' : 'rgba(124,58,237,0.06)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(249,247,255,0.6)'
            }}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
              {s.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--adm-text-primary)' }}>{s.name}</p>
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                style={
                  s.tag === 'Индивидуальное'
                    ? { background: 'rgba(124,58,237,0.12)', color: '#7c3aed' }
                    : s.tag === 'Группа'
                    ? { background: 'rgba(59,130,246,0.12)', color: '#3b82f6' }
                    : { background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', color: 'var(--adm-text-muted)' }
                }
              >
                {s.tag}
              </span>
            </div>
          </button>
        ))}
        {students.length > 8 && (
          <Link
            href="/bigbos/students"
            className="flex items-center justify-center p-3 rounded-xl border border-dashed text-sm transition-colors"
            style={{ borderColor: 'var(--adm-border-card)', color: 'var(--adm-text-muted)' }}
          >
            +{students.length - 8} ещё
          </Link>
        )}
      </div>

      {selected && <StudentModal student={selected} onClose={() => setSelected(null)} />}
    </>
  )
}
