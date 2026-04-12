'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Star, BookMarked, FileText, Download } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { GradeRowSkeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'

type Student = { id: string; name: string; tag: string }
type LessonFile = { id: string; url: string; name: string; size: number }
type GradeEntry = {
  lessonId: string
  date: string
  title: string | null
  tag: string
  grade: number | null
  comment: string | null
  attended: boolean
  homework: string | null
  files: LessonFile[]
}

const GRADE_COLORS: Record<number, { bg: string; text: string; label: string }> = {
  5: { bg: '#d1fae5', text: '#065f46', label: 'Отлично' },
  4: { bg: '#dbeafe', text: '#1e40af', label: 'Хорошо' },
  3: { bg: '#fef9c3', text: '#854d0e', label: 'Удовл.' },
  2: { bg: '#fee2e2', text: '#991b1b', label: 'Неудовл.' },
  1: { bg: '#fce7f3', text: '#9d174d', label: 'Плохо' },
}

function GradesPageInner() {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const [children, setChildren] = useState<Student[]>([])
  const [selected, setSelected] = useState<string>('')
  const [entries,  setEntries]  = useState<GradeEntry[]>([])
  const [loading,  setLoading]  = useState(false)

  useEffect(() => {
    fetch('/api/parent/me')
      .then(r => r.json())
      .then(data => {
        setChildren(data.students ?? [])
        const initial = searchParams.get('studentId') ?? data.students?.[0]?.id ?? ''
        setSelected(initial)
      })
  }, [searchParams])

  useEffect(() => {
    if (!selected) return
    setLoading(true)
    fetch(`/api/parent/grades?studentId=${selected}`)
      .then(r => r.json())
      .then(data => { setEntries(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => { setLoading(false); toast.error('Не удалось загрузить оценки') })
  }, [selected])

  const avg = entries.length > 0
    ? (entries.reduce((s, e) => s + (e.grade ?? 0), 0) / entries.filter(e => e.grade != null).length || 0).toFixed(1)
    : null

  return (
    <div className="px-4 md:px-8 py-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
          <Star size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Успеваемость</h1>
          <p className="text-xs text-gray-400">Оценки и комментарии учителя</p>
        </div>
      </div>

      {children.length > 1 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {children.map(c => (
            <button key={c.id} onClick={() => setSelected(c.id)}
              className="px-3 py-1.5 rounded-full text-sm font-semibold transition-all"
              style={{
                background: selected === c.id ? 'linear-gradient(90deg, #fbbf24, #f59e0b)' : '#f3f4f6',
                color: selected === c.id ? '#fff' : '#6b7280',
              }}>
              {c.name}
            </button>
          ))}
        </div>
      )}

      {avg && (
        <div className="rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
          style={{ background: 'linear-gradient(90deg, #fef9c3, #fef3c7)', border: '1px solid #fde68a' }}>
          <div className="flex items-center gap-4 sm:flex-col sm:items-center sm:gap-0">
            <p className="text-4xl font-black text-amber-600">{avg}</p>
            <p className="text-xs text-amber-500 font-medium">средний балл</p>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">
              {entries.filter(e => e.grade != null).length} оценок из {entries.length} уроков
            </p>
            <div className="flex gap-2 mt-2 flex-wrap">
              {[5, 4, 3, 2].map(g => {
                const count = entries.filter(e => e.grade === g).length
                if (!count) return null
                const c = GRADE_COLORS[g]
                return (
                  <span key={g} className="px-2 py-0.5 rounded-full text-xs font-bold"
                    style={{ background: c.bg, color: c.text }}>
                    {g} — {count}×
                  </span>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {loading && <GradeRowSkeleton count={5} />}

      {!loading && entries.length === 0 && (
        <EmptyState
          icon={<Star size={40} />}
          title="Оценок пока нет"
          description="Оценки появятся после того, как учитель заполнит журнал"
        />
      )}

      <div className="space-y-3">
        {entries.map(entry => {
          const gc = entry.grade ? GRADE_COLORS[entry.grade] : null
          return (
            <div key={entry.lessonId} className="rounded-2xl p-4 flex gap-4 items-start"
              style={{ background: '#fff', border: '1px solid #f3f4f6', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              {/* Grade badge */}
              <div className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-lg font-black"
                style={gc ? { background: gc.bg, color: gc.text } : { background: '#f3f4f6', color: '#9ca3af' }}>
                {entry.grade ?? '—'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <p className="text-sm font-bold text-gray-800">
                    {new Date(entry.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                  </p>
                  {entry.title && <p className="text-sm text-gray-500 truncate">{entry.title}</p>}
                  {gc && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                      style={{ background: gc.bg, color: gc.text }}>
                      {gc.label}
                    </span>
                  )}
                </div>
                {entry.comment && (
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed"
                    style={{ borderLeft: '2px solid #d1fae5', paddingLeft: '8px' }}>
                    {entry.comment}
                  </p>
                )}
                {(entry.homework || entry.files?.length > 0) && (
                  <div className="mt-2 rounded-xl overflow-hidden"
                    style={{ border: '1.5px solid #fde68a' }}>
                    {/* Header */}
                    <div className="flex items-center gap-2 px-3 py-2"
                      style={{ background: '#fef3c7' }}>
                      <BookMarked size={12} className="text-amber-600 shrink-0" />
                      <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">Домашнее задание</p>
                    </div>
                    {/* Text */}
                    {entry.homework && (
                      <div className="px-3 py-2" style={{ background: '#fefce8' }}>
                        <p className="text-xs text-amber-900 leading-relaxed">{entry.homework}</p>
                      </div>
                    )}
                    {/* Files */}
                    {entry.files?.length > 0 && (
                      <div className="px-3 pb-2 pt-1 space-y-1.5" style={{ background: '#fefce8' }}>
                        {entry.files.map(f => (
                          <a key={f.id} href={f.url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-3 rounded-xl transition-all hover:opacity-80 min-h-[44px]"
                            style={{ background: '#fef9c3', border: '1px solid #fde68a' }}>
                            <FileText size={12} className="text-amber-500 shrink-0" />
                            <span className="flex-1 text-xs font-medium text-amber-800 truncate">{f.name}</span>
                            <span className="text-[10px] text-amber-400 shrink-0">{(f.size / 1024).toFixed(0)} КБ</span>
                            <Download size={11} className="text-amber-400 shrink-0" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {!entry.attended && (
                  <span className="text-[10px] font-semibold mt-1 inline-block px-2 py-0.5 rounded-full"
                    style={{ background: '#fee2e2', color: '#991b1b' }}>
                    Пропущен
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function GradesPage() {
  return (
    <Suspense>
      <GradesPageInner />
    </Suspense>
  )
}
