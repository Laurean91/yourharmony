'use client'

import { useState } from 'react'
import StudentModal from './StudentModal'
import type { StudentForModal } from './StudentModal'

const TAG_COLORS: Record<string, string> = {
  'Индивидуальное': 'bg-purple-100 text-purple-700',
  'Группа': 'bg-blue-100 text-blue-700',
}

export default function StudentCard({
  student,
  tagColors,
}: {
  student: StudentForModal
  tagColors: Record<string, string>
}) {
  const [open, setOpen] = useState(false)

  const totalLessons = student.lessons?.length ?? 0
  const attendedLessons = student.lessons?.filter(l => l.attended).length ?? 0
  const attendancePct = totalLessons > 0 ? Math.round((attendedLessons / totalLessons) * 100) : null

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full text-left bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:border-purple-200 hover:shadow-md transition-all"
      >
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {student.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 truncate">{student.name}</p>
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5 flex-wrap">
                {student.age && <span>{student.age} лет</span>}
                {student.phone && <span>{student.phone}</span>}
                {attendancePct !== null && (
                  <span className={`${attendancePct >= 75 ? 'text-green-600' : attendancePct >= 50 ? 'text-orange-500' : 'text-red-500'}`}>
                    Посещ. {attendedLessons}/{totalLessons} ({attendancePct}%)
                  </span>
                )}
              </div>
            </div>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0 ml-3 ${(tagColors ?? TAG_COLORS)[student.tag] ?? 'bg-gray-100 text-gray-600'}`}>
            {student.tag}
          </span>
        </div>
        {student.notes && (
          <p className="px-5 pb-4 text-sm text-gray-500 text-left">{student.notes}</p>
        )}
      </button>

      {open && <StudentModal student={student} onClose={() => setOpen(false)} />}
    </>
  )
}
