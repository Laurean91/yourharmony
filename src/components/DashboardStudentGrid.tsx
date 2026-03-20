'use client'

import { useState } from 'react'
import Link from 'next/link'
import StudentModal from './StudentModal'
import type { StudentForModal } from './StudentModal'

const TAG_COLORS: Record<string, string> = {
  'Индивидуальное': 'bg-purple-100 text-purple-700',
  'Группа': 'bg-blue-100 text-blue-700',
}

export default function DashboardStudentGrid({ students }: { students: StudentForModal[] }) {
  const [selected, setSelected] = useState<StudentForModal | null>(null)

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {students.slice(0, 8).map(s => (
          <button
            key={s.id}
            onClick={() => setSelected(s)}
            className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/60 hover:bg-purple-50 hover:border-purple-200 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
              {s.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{s.name}</p>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${TAG_COLORS[s.tag] ?? 'bg-gray-100 text-gray-500'}`}>
                {s.tag}
              </span>
            </div>
          </button>
        ))}
        {students.length > 8 && (
          <Link
            href="/bigbos/students"
            className="flex items-center justify-center p-3 rounded-xl border border-dashed border-gray-200 text-sm text-gray-400 hover:border-purple-300 hover:text-purple-600 transition-colors"
          >
            +{students.length - 8} ещё
          </Link>
        )}
      </div>

      {selected && <StudentModal student={selected} onClose={() => setSelected(null)} />}
    </>
  )
}
