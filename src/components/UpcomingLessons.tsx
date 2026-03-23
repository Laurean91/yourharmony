'use client'

import Link from 'next/link'
import { ArrowUpRight, Clock } from 'lucide-react'

interface LessonStudent {
  studentId: string
  attended: boolean
  student: { id: string; name: string; tag: string }
}

interface Lesson {
  id: string
  date: Date | string
  title: string | null
  tag: string
  notes: string | null
  students: LessonStudent[]
}

const MONTHS_SHORT = [
  'янв', 'фев', 'мар', 'апр', 'май', 'июн',
  'июл', 'авг', 'сен', 'окт', 'ноя', 'дек',
]

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()
}

function dayLabel(date: Date): string {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  if (isSameDay(date, today))    return 'Сегодня'
  if (isSameDay(date, tomorrow)) return 'Завтра'
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}`
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function UpcomingLessons({ lessons }: { lessons: Lesson[] }) {
  const now = new Date()
  const in7days = new Date(now)
  in7days.setDate(now.getDate() + 7)

  // Filter upcoming 7 days, sort ascending
  const upcoming = lessons
    .filter(l => {
      const d = new Date(l.date)
      return d >= now && d <= in7days
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 8)

  // Group by day label
  const groups: { label: string; items: Lesson[] }[] = []
  for (const lesson of upcoming) {
    const d = new Date(lesson.date)
    const label = dayLabel(d)
    const existing = groups.find(g => g.label === label)
    if (existing) {
      existing.items.push(lesson)
    } else {
      groups.push({ label, items: [lesson] })
    }
  }

  const isIndividual = (tag: string) => tag !== 'Группа' && tag !== 'Групповое'

  return (
    <div
      className="rounded-2xl"
      style={{
        background: '#fff',
        border: '1px solid rgba(139,92,246,0.12)',
        boxShadow: '0 1px 10px rgba(109,40,217,0.04)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <h2 className="text-base font-semibold text-gray-800">Ближайшие занятия</h2>
        <Link
          href="/bigbos/schedule"
          className="flex items-center gap-1 text-xs font-semibold transition-opacity hover:opacity-70"
          style={{ color: '#7c3aed' }}
        >
          Расписание <ArrowUpRight size={13} />
        </Link>
      </div>

      {/* Content */}
      {upcoming.length === 0 ? (
        <div className="px-5 pb-5 text-center py-8">
          <p className="text-sm text-gray-400">Занятий на ближайшую неделю нет</p>
          <Link
            href="/bigbos/schedule"
            className="inline-block mt-2 text-xs font-semibold hover:underline"
            style={{ color: '#7c3aed' }}
          >
            Добавить занятие →
          </Link>
        </div>
      ) : (
        <div className="pb-3">
          {groups.map(({ label, items }) => (
            <div key={label}>
              {/* Day separator */}
              <div
                className="px-5 py-1.5 text-[10px] font-bold uppercase tracking-widest"
                style={{ background: 'rgba(139,92,246,0.04)', color: '#9ca3af' }}
              >
                {label}
              </div>

              {/* Lessons */}
              {items.map((lesson) => {
                const d = new Date(lesson.date)
                const timeStr = d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
                const endDate = new Date(d.getTime() + 60 * 60 * 1000)
                const endStr = endDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
                const ind = isIndividual(lesson.tag)
                const attended = lesson.students.filter(s => s.attended).length

                return (
                  <div
                    key={lesson.id}
                    className="flex items-center gap-3 px-5 py-3 transition-colors"
                    style={{ borderBottom: '1px solid rgba(139,92,246,0.06)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(139,92,246,0.035)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}
                  >
                    {/* Time block */}
                    <div className="shrink-0 w-14 text-right">
                      <p className="text-xs font-bold text-gray-700">{timeStr}</p>
                      <p className="text-[10px] text-gray-400">{endStr}</p>
                    </div>

                    {/* Color bar */}
                    <div
                      className="w-1 h-9 rounded-full shrink-0"
                      style={{
                        background: ind
                          ? 'linear-gradient(180deg,#8b5cf6,#7c3aed)'
                          : 'linear-gradient(180deg,#fb923c,#f97316)',
                      }}
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                          style={
                            ind
                              ? { background: 'rgba(124,58,237,0.1)', color: '#7c3aed' }
                              : { background: 'rgba(249,115,22,0.1)', color: '#ea580c' }
                          }
                        >
                          {ind ? 'Инд.' : 'Группа'}
                        </span>
                        {lesson.title && (
                          <span className="text-xs text-gray-500 truncate">{lesson.title}</span>
                        )}
                      </div>

                      {lesson.students.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-1">
                          {lesson.students.slice(0, 3).map(ls => (
                            <div
                              key={ls.studentId}
                              className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                              style={{
                                background: isIndividual(ls.student.tag)
                                  ? 'linear-gradient(135deg,#a78bfa,#7c3aed)'
                                  : 'linear-gradient(135deg,#fb923c,#f97316)',
                              }}
                              title={ls.student.name}
                            >
                              {initials(ls.student.name)}
                            </div>
                          ))}
                          {lesson.students.length > 3 && (
                            <span className="text-[10px] text-gray-400">
                              +{lesson.students.length - 3}
                            </span>
                          )}
                          <span className="text-[10px] text-gray-400 ml-1">
                            {lesson.students.map(s => s.student.name).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Attendance status */}
                    <div className="shrink-0 flex items-center gap-1">
                      <Clock size={11} style={{ color: '#9ca3af' }} />
                      <span className="text-[10px] font-medium text-gray-400">
                        {attended}/{lesson.students.length}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
