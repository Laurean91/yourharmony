'use client'

import { useState } from 'react'
import DeleteStudentButton from './DeleteStudentButton'
import StudentEditForm from './StudentEditForm'

interface LessonEntry {
  attended: boolean
  lesson: { id: string; date: Date }
}

interface Student {
  id: string
  name: string
  age: number | null
  phone: string | null
  tag: string
  notes: string | null
  lessons?: LessonEntry[]
}

export default function StudentCard({
  student,
  tagColors,
}: {
  student: Student
  tagColors: Record<string, string>
}) {
  const [editing, setEditing] = useState(false)

  const totalLessons = student.lessons?.length ?? 0
  const attendedLessons = student.lessons?.filter(l => l.attended).length ?? 0
  const attendancePct = totalLessons > 0 ? Math.round((attendedLessons / totalLessons) * 100) : null

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
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
        <div className="flex items-center gap-2 shrink-0 ml-3">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${tagColors[student.tag] ?? 'bg-gray-100 text-gray-600'}`}>
            {student.tag}
          </span>
          <button
            onClick={() => setEditing(v => !v)}
            className="text-gray-400 hover:text-purple-600 transition-colors text-sm px-2 py-1 rounded hover:bg-purple-50"
          >
            {editing ? 'Свернуть' : 'Изменить'}
          </button>
          <DeleteStudentButton id={student.id} />
        </div>
      </div>

      {student.notes && !editing && (
        <p className="px-5 pb-4 text-sm text-gray-500">{student.notes}</p>
      )}

      {editing && (
        <div className="px-5 pb-5">
          <StudentEditForm student={student} onClose={() => setEditing(false)} />
        </div>
      )}
    </div>
  )
}
