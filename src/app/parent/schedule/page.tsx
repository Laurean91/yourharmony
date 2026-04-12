'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Calendar, Clock, BookOpen, BookMarked } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { LessonRowSkeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'

type Student = { id: string; name: string; tag: string }
type Lesson  = { id: string; date: string; title: string | null; tag: string; notes: string | null; homework: string | null }

function SchedulePageInner() {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const [children,   setChildren]   = useState<Student[]>([])
  const [selected,   setSelected]   = useState<string>('')
  const [lessons,    setLessons]    = useState<Lesson[]>([])
  const [loading,    setLoading]    = useState(false)

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
    fetch(`/api/parent/schedule?studentId=${selected}`)
      .then(r => r.json())
      .then(data => { setLessons(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => { setLoading(false); toast.error('Не удалось загрузить расписание') })
  }, [selected]) // eslint-disable-line react-hooks/exhaustive-deps

  const grouped = lessons.reduce<Record<string, Lesson[]>>((acc, l) => {
    const key = new Date(l.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
    acc[key] = [...(acc[key] ?? []), l]
    return acc
  }, {})

  return (
    <div className="px-4 md:px-8 py-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #34d399, #3b82f6)' }}>
          <Calendar size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Расписание</h1>
          <p className="text-xs text-gray-400">Предстоящие занятия</p>
        </div>
      </div>

      {children.length > 1 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {children.map(c => (
            <button key={c.id} onClick={() => setSelected(c.id)}
              className="px-3 py-1.5 rounded-full text-sm font-semibold transition-all"
              style={{
                background: selected === c.id ? 'linear-gradient(90deg, #34d399, #3b82f6)' : '#f3f4f6',
                color: selected === c.id ? '#fff' : '#6b7280',
              }}>
              {c.name}
            </button>
          ))}
        </div>
      )}

      {loading && <LessonRowSkeleton count={4} />}

      {!loading && Object.entries(grouped).length === 0 && (
        <EmptyState
          icon={<Calendar size={40} />}
          title="Предстоящих занятий пока нет"
          description="Расписание появится здесь, когда учитель добавит уроки"
        />
      )}

      <div className="space-y-6">
        {Object.entries(grouped).map(([date, dayLessons]) => (
          <div key={date}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{date}</p>
            <div className="space-y-2">
              {dayLessons.map(lesson => (
                <div key={lesson.id} className="rounded-2xl p-3 md:p-4 flex gap-3"
                  style={{ background: '#fff', border: '1px solid #d1fae5', boxShadow: '0 2px 12px rgba(5,150,105,0.06)' }}>
                  <div className="shrink-0 text-center" style={{ minWidth: 44 }}>
                    <p className="text-sm font-black text-emerald-600 leading-tight pt-0.5">
                      {new Date(lesson.date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {lesson.title && (
                        <p className="text-sm font-bold text-gray-900 truncate">{lesson.title}</p>
                      )}
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ background: '#dbeafe', color: '#1d4ed8' }}>
                        {lesson.tag}
                      </span>
                    </div>
                    {lesson.notes && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{lesson.notes}</p>
                    )}
                    {lesson.homework && (
                      <div className="flex items-start gap-1.5 mt-2 px-2.5 py-2 rounded-xl"
                        style={{ background: '#fefce8', border: '1px solid #fde68a' }}>
                        <BookMarked size={11} className="text-amber-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-amber-800 leading-relaxed break-words">{lesson.homework}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-400">
                      <Clock size={11} />
                      <span>45 мин</span>
                      <BookOpen size={11} className="ml-1" />
                      <span>{lesson.tag}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function SchedulePage() {
  return (
    <Suspense>
      <SchedulePageInner />
    </Suspense>
  )
}
