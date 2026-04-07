'use client'

import { useState } from 'react'
import StudentModal from './StudentModal'
import type { StudentForModal } from './StudentModal'
import { useAdminTheme } from '@/contexts/AdminThemeContext'

export default function StudentCard({
  student,
  tagColors,
}: {
  student: StudentForModal
  tagColors?: Record<string, string>
}) {
  const [open, setOpen] = useState(false)
  const { theme } = useAdminTheme()
  const isDark = theme === 'dark'

  const totalLessons    = student.lessons?.length ?? 0
  const attendedLessons = student.lessons?.filter(l => l.attended).length ?? 0
  const attendancePct   = totalLessons > 0
    ? Math.round((attendedLessons / totalLessons) * 100)
    : null

  const isIndividual = student.tag !== 'Группа' && student.tag !== 'Групповое'

  const tagBg    = isIndividual ? 'rgba(124,58,237,0.1)'  : 'rgba(249,115,22,0.1)'
  const tagColor = isIndividual ? '#7c3aed'               : '#ea580c'
  const barColor = isIndividual
    ? 'linear-gradient(90deg,#a78bfa,#7c3aed)'
    : 'linear-gradient(90deg,#fb923c,#f97316)'
  const avatarBg = isIndividual
    ? 'linear-gradient(135deg,#a78bfa,#7c3aed)'
    : 'linear-gradient(135deg,#fb923c,#f97316)'

  const attendColor =
    attendancePct === null ? 'var(--adm-text-muted)'
    : attendancePct >= 75  ? '#16a34a'
    : attendancePct >= 50  ? '#d97706'
    : '#dc2626'

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full text-left rounded-2xl overflow-hidden transition-all duration-200"
        style={{
          background: 'var(--adm-bg-card)',
          border: '1px solid var(--adm-border-card)',
          boxShadow: 'var(--adm-shadow-card)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = isDark ? 'rgba(167,139,250,0.25)' : 'rgba(139,92,246,0.3)'
          e.currentTarget.style.boxShadow = isDark ? '0 4px 20px rgba(139,92,246,0.15)' : '0 4px 20px rgba(109,40,217,0.1)'
          e.currentTarget.style.transform = 'translateY(-1px)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--adm-border-card)'
          e.currentTarget.style.boxShadow = 'var(--adm-shadow-card)'
          e.currentTarget.style.transform = ''
        }}
      >
        {/* Top section: avatar + name + tag badge */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
              style={{ background: avatarBg }}
            >
              {student.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-semibold truncate text-sm leading-tight" style={{ color: 'var(--adm-text-primary)' }}>
                {student.name}
              </p>
              <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--adm-text-muted)' }}>
                {[student.age && `${student.age} лет`, student.phone]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
          </div>
          <span
            className="shrink-0 ml-3 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
            style={{ background: tagBg, color: tagColor }}
          >
            {student.tag}
          </span>
        </div>

        {/* Attendance bar */}
        {attendancePct !== null && (
          <div className="px-5 pb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-medium uppercase tracking-wide" style={{ color: 'var(--adm-text-muted)' }}>
                Посещаемость
              </span>
              <span className="text-[11px] font-bold" style={{ color: attendColor }}>
                {attendancePct}%
                <span className="font-normal ml-1" style={{ color: 'var(--adm-text-muted)' }}>
                  ({attendedLessons}/{totalLessons})
                </span>
              </span>
            </div>
            <div
              className="w-full h-1.5 rounded-full overflow-hidden"
              style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(139,92,246,0.08)' }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${attendancePct}%`, background: barColor }}
              />
            </div>
          </div>
        )}

        {/* Notes */}
        {student.notes && (
          <div
            className="px-5 py-2.5 text-xs text-left"
            style={{
              borderTop: '1px solid var(--adm-border-sep)',
              color: 'var(--adm-text-muted)',
            }}
          >
            <span className="mr-1">💬</span>
            {student.notes}
          </div>
        )}
      </button>

      {open && <StudentModal student={student} onClose={() => setOpen(false)} />}
    </>
  )
}
