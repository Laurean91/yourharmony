'use client'

import { useState } from 'react'
import StudentModal from './StudentModal'
import type { StudentForModal } from './StudentModal'

export default function StudentCard({
  student,
  tagColors,
}: {
  student: StudentForModal
  tagColors?: Record<string, string>
}) {
  const [open, setOpen] = useState(false)

  const totalLessons    = student.lessons?.length ?? 0
  const attendedLessons = student.lessons?.filter(l => l.attended).length ?? 0
  const attendancePct   = totalLessons > 0
    ? Math.round((attendedLessons / totalLessons) * 100)
    : null

  const isIndividual = student.tag !== 'Группа' && student.tag !== 'Групповое'

  /* colour config */
  const tagBg    = isIndividual ? 'rgba(124,58,237,0.1)'  : 'rgba(249,115,22,0.1)'
  const tagColor = isIndividual ? '#7c3aed'               : '#ea580c'
  const barColor = isIndividual
    ? 'linear-gradient(90deg,#a78bfa,#7c3aed)'
    : 'linear-gradient(90deg,#fb923c,#f97316)'
  const avatarBg = isIndividual
    ? 'linear-gradient(135deg,#a78bfa,#7c3aed)'
    : 'linear-gradient(135deg,#fb923c,#f97316)'

  const attendColor =
    attendancePct === null ? '#9ca3af'
    : attendancePct >= 75  ? '#16a34a'
    : attendancePct >= 50  ? '#d97706'
    : '#dc2626'

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full text-left rounded-2xl overflow-hidden transition-all duration-200"
        style={{
          background: '#fff',
          border: '1px solid rgba(139,92,246,0.12)',
          boxShadow: '0 1px 8px rgba(109,40,217,0.04)',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(139,92,246,0.3)'
          ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(109,40,217,0.1)'
          ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(139,92,246,0.12)'
          ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 1px 8px rgba(109,40,217,0.04)'
          ;(e.currentTarget as HTMLButtonElement).style.transform = ''
        }}
      >
        {/* Top section: avatar + name + tag badge */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
              style={{ background: avatarBg }}
            >
              {student.name.charAt(0).toUpperCase()}
            </div>

            {/* Name + meta */}
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 truncate text-sm leading-tight">
                {student.name}
              </p>
              <p className="text-xs text-gray-400 mt-0.5 truncate">
                {[student.age && `${student.age} лет`, student.phone]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
          </div>

          {/* Tag badge */}
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
              <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                Посещаемость
              </span>
              <span className="text-[11px] font-bold" style={{ color: attendColor }}>
                {attendancePct}%
                <span className="text-gray-400 font-normal ml-1">
                  ({attendedLessons}/{totalLessons})
                </span>
              </span>
            </div>
            {/* Track */}
            <div
              className="w-full h-1.5 rounded-full overflow-hidden"
              style={{ background: 'rgba(139,92,246,0.08)' }}
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
            className="px-5 py-2.5 text-xs text-gray-500 text-left"
            style={{ borderTop: '1px solid rgba(139,92,246,0.06)' }}
          >
            <span className="text-gray-400 mr-1">💬</span>
            {student.notes}
          </div>
        )}
      </button>

      {open && <StudentModal student={student} onClose={() => setOpen(false)} />}
    </>
  )
}
