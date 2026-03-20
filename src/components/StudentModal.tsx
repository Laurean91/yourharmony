'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import StudentEditForm from './StudentEditForm'
import DeleteStudentButton from './DeleteStudentButton'

interface LessonEntry {
  attended: boolean
  lesson: { id: string; date: Date }
}

export interface StudentForModal {
  id: string
  name: string
  age: number | null
  phone: string | null
  tag: string
  notes: string | null
  lessons?: LessonEntry[]
}

const TAG_COLORS: Record<string, string> = {
  'Индивидуальное': 'bg-purple-100 text-purple-700',
  'Группа': 'bg-blue-100 text-blue-700',
}

export default function StudentModal({
  student,
  onClose,
}: {
  student: StudentForModal
  onClose: () => void
}) {
  const [editing, setEditing] = useState(false)

  const totalLessons = student.lessons?.length ?? 0
  const attendedLessons = student.lessons?.filter(l => l.attended).length ?? 0
  const attendancePct = totalLessons > 0 ? Math.round((attendedLessons / totalLessons) * 100) : null

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Sheet — slides up on mobile, centered on desktop */}
      <div className="relative w-full sm:max-w-md bg-white sm:rounded-2xl rounded-t-2xl shadow-xl z-10 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center text-white font-bold shrink-0">
              {student.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{student.name}</p>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${TAG_COLORS[student.tag] ?? 'bg-gray-100 text-gray-600'}`}>
                {student.tag}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Info */}
        <div className="px-5 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {student.age && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Возраст</p>
                <p className="text-sm font-medium text-gray-800">{student.age} лет</p>
              </div>
            )}
            {student.phone && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Телефон</p>
                <p className="text-sm font-medium text-gray-800">{student.phone}</p>
              </div>
            )}
            {attendancePct !== null && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Посещаемость</p>
                <p className={`text-sm font-semibold ${attendancePct >= 75 ? 'text-green-600' : attendancePct >= 50 ? 'text-orange-500' : 'text-red-500'}`}>
                  {attendedLessons}/{totalLessons} ({attendancePct}%)
                </p>
              </div>
            )}
            {totalLessons > 0 && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Занятий всего</p>
                <p className="text-sm font-medium text-gray-800">{totalLessons}</p>
              </div>
            )}
          </div>

          {student.notes && !editing && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Заметки</p>
              <p className="text-sm text-gray-700">{student.notes}</p>
            </div>
          )}

          {editing && (
            <StudentEditForm
              student={student}
              onClose={() => { setEditing(false); onClose() }}
            />
          )}
        </div>

        {/* Actions */}
        {!editing && (
          <div className="px-5 pb-5 flex gap-2">
            <button
              onClick={() => setEditing(true)}
              className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              Изменить
            </button>
            <DeleteStudentButton id={student.id} />
          </div>
        )}
      </div>
    </div>
  )
}
