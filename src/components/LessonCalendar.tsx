'use client'

import { useState } from 'react'
import { createLesson, deleteLesson, markAttendance } from '@/app/actions'

interface Student {
  id: string
  name: string
  tag: string
}

interface LessonStudent {
  studentId: string
  attended: boolean
  student: Student
}

interface Lesson {
  id: string
  date: Date
  title: string | null
  tag: string
  notes: string | null
  students: LessonStudent[]
}

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
]

function toLocalDateString(date: Date) {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number) {
  const d = new Date(year, month, 1).getDay()
  return (d + 6) % 7
}

export default function LessonCalendar({
  lessons: initialLessons,
  students,
  readonly = false,
}: {
  lessons: Lesson[]
  students: Student[]
  readonly?: boolean
}) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [lessons, setLessons] = useState<Lesson[]>(initialLessons)
  const [addLoading, setAddLoading] = useState(false)
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])
  const [studentSearch, setStudentSearch] = useState('')
  const [showStudentDropdown, setShowStudentDropdown] = useState(false)

  const lessonsByDate = lessons.reduce<Record<string, Lesson[]>>((acc, l) => {
    const key = toLocalDateString(l.date)
    acc[key] = [...(acc[key] ?? []), l]
    return acc
  }, {})

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
    setSelectedDay(null)
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
    setSelectedDay(null)
  }

  const daysInMonth = getDaysInMonth(year, month)
  const firstDayOfWeek = getFirstDayOfWeek(year, month)
  const todayStr = toLocalDateString(today)

  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const selectedLessons = selectedDay ? (lessonsByDate[selectedDay] ?? []) : []

  function toggleStudent(id: string) {
    setSelectedStudentIds(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  async function handleAddLesson(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selectedDay) return
    setAddLoading(true)
    const formData = new FormData(e.currentTarget)
    const time = formData.get('time') as string
    formData.set('date', `${selectedDay}T${time || '09:00'}:00`)
    // Append selected students manually (replaced checkboxes)
    selectedStudentIds.forEach(id => formData.append('studentIds', id))
    await createLesson(formData)
    setShowAddForm(false)
    setSelectedStudentIds([])
    setStudentSearch('')
    setAddLoading(false)
    window.location.reload()
  }

  async function handleDeleteLesson(id: string) {
    await deleteLesson(id)
    setLessons(ls => ls.filter(l => l.id !== id))
  }

  async function handleAttendance(lessonId: string, studentId: string, attended: boolean) {
    await markAttendance(lessonId, studentId, attended)
    setLessons(ls => ls.map(l =>
      l.id === lessonId
        ? { ...l, students: l.students.map(ls => ls.studentId === studentId ? { ...ls, attended } : ls) }
        : l
    ))
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">

      {/* ── Compact calendar ── */}
      <div className="w-full sm:w-[260px] sm:shrink-0">
        <div className="flex items-center justify-between mb-2">
          <button onClick={prevMonth} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 text-sm transition-colors">←</button>
          <span className="text-sm font-semibold text-gray-800">{MONTHS[month]} {year}</span>
          <button onClick={nextMonth} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 text-sm transition-colors">→</button>
        </div>

        <div className="grid grid-cols-7 gap-0.5 text-center mb-0.5">
          {WEEKDAYS.map(d => (
            <div key={d} className="text-[10px] font-medium text-gray-400 py-0.5">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-0.5">
          {cells.map((day, i) => {
            if (day === null) return <div key={i} className="h-8" />
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const hasLessons = (lessonsByDate[dateStr]?.length ?? 0) > 0
            const isToday = dateStr === todayStr
            const isSelected = dateStr === selectedDay

            return (
              <button
                key={i}
                onClick={() => { setSelectedDay(isSelected ? null : dateStr); setShowAddForm(false); setSelectedStudentIds([]); setStudentSearch('') }}
                className={`h-9 sm:h-8 flex flex-col items-center justify-center rounded-lg text-xs transition-all ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-sm'
                    : isToday
                    ? 'bg-purple-50 text-purple-700 font-semibold'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <span className="leading-none">{day}</span>
                {hasLessons && (
                  <span className={`mt-0.5 w-1 h-1 rounded-full ${isSelected ? 'bg-white/80' : 'bg-purple-400'}`} />
                )}
              </button>
            )
          })}
        </div>

        <div className="mt-2 text-[10px] text-gray-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block" /> Есть занятия
        </div>
      </div>

      {/* ── Day details panel ── */}
      <div className="flex-1 min-w-0">
        {!selectedDay ? (
          <div className="h-full flex items-center justify-center text-sm text-gray-400 py-10">
            Выберите день для просмотра занятий
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-800 text-sm">
                {new Date(selectedDay + 'T12:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
              </span>
              {!readonly && (
                <button
                  onClick={() => setShowAddForm(v => !v)}
                  className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded-xl hover:bg-purple-700 transition-colors"
                >
                  + Занятие
                </button>
              )}
            </div>

            {/* Add lesson form */}
            {!readonly && showAddForm && (
              <form onSubmit={handleAddLesson} className="bg-purple-50 rounded-2xl border border-purple-100 p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Время</label>
                    <input name="time" type="time" defaultValue="09:00" className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Тип</label>
                    <select name="tag" className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400">
                      <option value="Индивидуальное">Индивидуальное</option>
                      <option value="Группа">Группа</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Тема</label>
                  <input name="title" placeholder="Необязательно" className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
                </div>
                {students.length > 0 && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Ученики</label>

                    {/* Selected tags */}
                    {selectedStudentIds.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {selectedStudentIds.map(id => {
                          const s = students.find(s => s.id === id)
                          if (!s) return null
                          return (
                            <span key={id} className="flex items-center gap-1 px-2.5 py-1 bg-purple-600 text-white rounded-full text-xs font-medium">
                              {s.name}
                              <button type="button" onClick={() => toggleStudent(id)} className="ml-0.5 opacity-70 hover:opacity-100 leading-none">×</button>
                            </span>
                          )
                        })}
                      </div>
                    )}

                    {/* Search input */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Поиск ученика..."
                        value={studentSearch}
                        onChange={e => { setStudentSearch(e.target.value); setShowStudentDropdown(true) }}
                        onFocus={() => setShowStudentDropdown(true)}
                        onBlur={() => setShowStudentDropdown(false)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                      />
                      {showStudentDropdown && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-44 overflow-y-auto">
                          {students
                            .filter(s =>
                              !selectedStudentIds.includes(s.id) &&
                              s.name.toLowerCase().includes(studentSearch.toLowerCase())
                            )
                            .map(s => (
                              <button
                                key={s.id}
                                type="button"
                                onMouseDown={e => e.preventDefault()}
                                onClick={() => { toggleStudent(s.id); setStudentSearch(''); setShowStudentDropdown(false) }}
                                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                              >
                                {s.name}
                              </button>
                            ))
                          }
                          {students.filter(s => !selectedStudentIds.includes(s.id) && s.name.toLowerCase().includes(studentSearch.toLowerCase())).length === 0 && (
                            <p className="px-4 py-3 text-sm text-gray-400">Не найдено</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Заметки</label>
                  <textarea name="notes" rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={addLoading} className="px-4 py-1.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-60">
                    {addLoading ? 'Сохранение...' : 'Добавить'}
                  </button>
                  <button type="button" onClick={() => { setShowAddForm(false); setSelectedStudentIds([]); setStudentSearch('') }} className="px-4 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50">
                    Отмена
                  </button>
                </div>
              </form>
            )}

            {/* Lessons list */}
            {selectedLessons.length === 0 && !showAddForm && (
              <p className="text-sm text-gray-400 py-4 text-center">Занятий нет</p>
            )}
            {selectedLessons.map(l => (
              <div key={l.id} className="bg-purple-50 rounded-xl border border-purple-100 p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="text-sm font-medium text-gray-800">
                        {new Date(l.date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                        {l.title ? ` — ${l.title}` : ''}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">{l.tag}</span>
                    </div>
                    {l.notes && <p className="text-xs text-gray-400">{l.notes}</p>}
                  </div>
                  {!readonly && (
                    <button
                      onClick={() => handleDeleteLesson(l.id)}
                      className="text-red-400 hover:text-red-600 text-xs px-2 py-1 rounded hover:bg-red-50 transition-colors shrink-0 ml-2"
                    >
                      Удалить
                    </button>
                  )}
                </div>

                {/* Readonly: student names only */}
                {readonly && l.students.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {l.students.map(ls => (
                      <span key={ls.studentId} className="text-xs px-2 py-0.5 rounded-full bg-white border border-purple-100 text-gray-600">
                        {ls.student.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Attendance checkboxes */}
                {!readonly && l.students.length > 0 && (
                  <div>
                    <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1.5">Посещаемость</p>
                    <div className="flex flex-wrap gap-2">
                      {l.students.map(ls => (
                        <label
                          key={ls.studentId}
                          className={`flex items-center gap-1.5 text-xs cursor-pointer px-2.5 py-1 rounded-lg border transition-colors ${
                            ls.attended
                              ? 'bg-green-50 border-green-200 text-green-700'
                              : 'bg-white border-gray-200 text-gray-500'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={ls.attended}
                            onChange={e => handleAttendance(l.id, ls.studentId, e.target.checked)}
                            className="accent-green-600"
                          />
                          {ls.student.name}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
