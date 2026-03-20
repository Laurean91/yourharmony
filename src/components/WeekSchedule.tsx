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

const WEEKDAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const MONTHS_GEN = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
]

const START_HOUR = 8
const END_HOUR = 23
const TOTAL_MINUTES = (END_HOUR - START_HOUR) * 60
const PX_PER_MIN = 1.2 // px per minute → 1 hour = 72px
const LESSON_DURATION = 60 // minutes

function getMonday(date: Date) {
  const d = new Date(date)
  const day = d.getDay() // 0 = Sun
  const diff = (day === 0 ? -6 : 1 - day)
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date: Date, n: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function lessonTopPx(date: Date) {
  const h = date.getHours()
  const m = date.getMinutes()
  const minsFromStart = (h - START_HOUR) * 60 + m
  return Math.max(0, minsFromStart * PX_PER_MIN)
}

export default function WeekSchedule({
  lessons: initialLessons,
  students,
}: {
  lessons: Lesson[]
  students: Student[]
}) {
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()))
  const [lessons, setLessons] = useState<Lesson[]>(initialLessons)
  const [selected, setSelected] = useState<Lesson | null>(null)
  const [addSlot, setAddSlot] = useState<{ date: string; time: string } | null>(null)
  const [addLoading, setAddLoading] = useState(false)
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])
  const [studentSearch, setStudentSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const weekEnd = addDays(weekStart, 6)

  const lessonsByDate = lessons.reduce<Record<string, Lesson[]>>((acc, l) => {
    const key = toDateKey(new Date(l.date))
    acc[key] = [...(acc[key] ?? []), l]
    return acc
  }, {})

  function prevWeek() { setWeekStart(d => addDays(d, -7)) }
  function nextWeek() { setWeekStart(d => addDays(d, 7)) }

  function formatWeekRange() {
    const s = weekStart
    const e = weekEnd
    if (s.getMonth() === e.getMonth()) {
      return `${s.getDate()}–${e.getDate()} ${MONTHS_GEN[s.getMonth()]} ${s.getFullYear()}`
    }
    return `${s.getDate()} ${MONTHS_GEN[s.getMonth()]} – ${e.getDate()} ${MONTHS_GEN[e.getMonth()]} ${e.getFullYear()}`
  }

  function handleSlotClick(day: Date, hour: number) {
    const dateKey = toDateKey(day)
    const time = `${String(hour).padStart(2, '0')}:00`
    setAddSlot({ date: dateKey, time })
    setSelected(null)
  }

  function toggleStudent(id: string) {
    setSelectedStudentIds(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
  }

  async function handleAddLesson(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!addSlot) return
    setAddLoading(true)
    const formData = new FormData(e.currentTarget)
    const time = formData.get('time') as string
    formData.set('date', `${addSlot.date}T${time || addSlot.time}:00`)
    selectedStudentIds.forEach(id => formData.append('studentIds', id))
    await createLesson(formData)
    setAddSlot(null)
    setSelectedStudentIds([])
    setStudentSearch('')
    setAddLoading(false)
    window.location.reload()
  }

  async function handleDelete(id: string) {
    await deleteLesson(id)
    setLessons(ls => ls.filter(l => l.id !== id))
    setSelected(null)
  }

  async function handleAttendance(lessonId: string, studentId: string, attended: boolean) {
    await markAttendance(lessonId, studentId, attended)
    setLessons(ls => ls.map(l =>
      l.id === lessonId
        ? { ...l, students: l.students.map(ls => ls.studentId === studentId ? { ...ls, attended } : ls) }
        : l
    ))
    if (selected?.id === lessonId) {
      setSelected(prev => prev ? {
        ...prev,
        students: prev.students.map(ls => ls.studentId === studentId ? { ...ls, attended } : ls)
      } : null)
    }
  }

  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i)
  const gridHeight = TOTAL_MINUTES * PX_PER_MIN

  const todayKey = toDateKey(new Date())

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Расписание</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button onClick={prevWeek} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 transition-colors text-lg">←</button>
            <span className="text-sm font-medium text-gray-700 min-w-[200px] text-center">{formatWeekRange()}</span>
            <button onClick={nextWeek} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 transition-colors text-lg">→</button>
          </div>
          <button
            onClick={() => { setAddSlot({ date: toDateKey(new Date()), time: '09:00' }); setSelected(null) }}
            className="px-4 py-2 bg-purple-600 text-white text-sm rounded-xl hover:bg-purple-700 transition-colors font-medium"
          >
            + Занятие
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start">
        {/* Timeline grid */}
        <div className="w-full min-w-0 overflow-x-auto">
          <div style={{ minWidth: 520 }}>
            {/* Day headers */}
            <div className="flex ml-12 mb-1">
              {weekDays.map((day, i) => {
                const key = toDateKey(day)
                const isToday = key === todayKey
                return (
                  <div key={i} className="flex-1 text-center">
                    <div className={`text-xs font-medium ${isToday ? 'text-purple-600' : 'text-gray-400'}`}>
                      {WEEKDAYS_SHORT[i]}
                    </div>
                    <div className={`text-sm font-bold w-8 h-8 mx-auto flex items-center justify-center rounded-full ${isToday ? 'bg-purple-600 text-white' : 'text-gray-700'}`}>
                      {day.getDate()}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Grid */}
            <div className="flex">
              {/* Time labels */}
              <div className="w-12 shrink-0 relative" style={{ height: gridHeight }}>
                {hours.map(h => (
                  <div
                    key={h}
                    className="absolute right-2 text-[10px] text-gray-400 -translate-y-2"
                    style={{ top: (h - START_HOUR) * 60 * PX_PER_MIN }}
                  >
                    {h}:00
                  </div>
                ))}
              </div>

              {/* Day columns */}
              {weekDays.map((day, di) => {
                const key = toDateKey(day)
                const dayLessons = lessonsByDate[key] ?? []
                return (
                  <div key={di} className="flex-1 relative border-l border-gray-100" style={{ height: gridHeight }}>
                    {/* Hour lines + click slots */}
                    {hours.map(h => (
                      <div
                        key={h}
                        className="absolute left-0 right-0 border-t border-gray-100 cursor-pointer hover:bg-purple-50/50 transition-colors group"
                        style={{ top: (h - START_HOUR) * 60 * PX_PER_MIN, height: 60 * PX_PER_MIN }}
                        onClick={() => handleSlotClick(day, h)}
                      >
                        <span className="hidden group-hover:block absolute right-1 top-1 text-[10px] text-purple-400">+</span>
                      </div>
                    ))}

                    {/* Lesson blocks */}
                    {dayLessons.map(l => {
                      const lDate = new Date(l.date)
                      const top = lessonTopPx(lDate)
                      const height = LESSON_DURATION * PX_PER_MIN
                      const isIndividual = l.tag !== 'Группа' && l.tag !== 'Групповое'
                      const isActive = selected?.id === l.id
                      return (
                        <button
                          key={l.id}
                          onClick={e => { e.stopPropagation(); setSelected(isActive ? null : l); setAddSlot(null) }}
                          className={`absolute left-1 right-1 rounded-lg px-2 py-1 text-left text-xs transition-all shadow-sm border ${
                            isActive
                              ? 'ring-2 ring-offset-1 ring-purple-500 z-10'
                              : 'hover:brightness-95 z-0'
                          } ${
                            isIndividual
                              ? 'bg-purple-100 border-purple-200 text-purple-800'
                              : 'bg-orange-100 border-orange-200 text-orange-800'
                          }`}
                          style={{ top, height: Math.max(height, 28) }}
                        >
                          <div className="font-semibold leading-tight truncate">
                            {lDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                            {l.title ? ` ${l.title}` : ''}
                          </div>
                          {l.students.length > 0 && (
                            <div className="truncate opacity-70 text-[10px]">
                              {l.students.map(s => s.student.name).join(', ')}
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Side panel */}
        {(selected || addSlot) && (
          <div className="w-full md:w-72 md:shrink-0 bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
            {/* Lesson detail */}
            {selected && (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {new Date(selected.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                      {' '}
                      {new Date(selected.date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {selected.title && <p className="text-sm text-gray-500 mt-0.5">{selected.title}</p>}
                    <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                      selected.tag !== 'Группа' && selected.tag !== 'Групповое'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}>{selected.tag}</span>
                  </div>
                  <button onClick={() => setSelected(null)} className="text-gray-300 hover:text-gray-500 text-lg leading-none">×</button>
                </div>
                {selected.notes && <p className="text-sm text-gray-500">{selected.notes}</p>}

                {/* Attendance */}
                {selected.students.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Посещаемость</p>
                    <div className="space-y-2">
                      {selected.students.map(ls => (
                        <label key={ls.studentId} className={`flex items-center gap-2 text-sm cursor-pointer px-3 py-2 rounded-xl border transition-colors ${
                          ls.attended ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-600'
                        }`}>
                          <input
                            type="checkbox"
                            checked={ls.attended}
                            onChange={e => handleAttendance(selected.id, ls.studentId, e.target.checked)}
                            className="accent-green-600"
                          />
                          {ls.student.name}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {selected.students.length === 0 && (
                  <p className="text-sm text-gray-400">Ученики не назначены</p>
                )}

                <button
                  onClick={() => handleDelete(selected.id)}
                  className="w-full py-2 text-sm text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
                >
                  Удалить занятие
                </button>
              </>
            )}

            {/* Add form */}
            {addSlot && (
              <>
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-800 text-sm">
                    Новое занятие —{' '}
                    {new Date(addSlot.date + 'T12:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                  </p>
                  <button onClick={() => { setAddSlot(null); setSelectedStudentIds([]); setStudentSearch('') }} className="text-gray-300 hover:text-gray-500 text-lg leading-none">×</button>
                </div>
                <form onSubmit={handleAddLesson} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Время</label>
                      <input name="time" type="time" defaultValue={addSlot.time} className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Тип</label>
                      <select name="tag" className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400">
                        <option value="Индивидуальное">Индивидуальное</option>
                        <option value="Группа">Группа</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Тема</label>
                    <input name="title" placeholder="Необязательно" className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
                  </div>

                  {students.length > 0 && (
                    <div>
                      <label className="block text-xs text-gray-500 mb-1.5">Ученики</label>
                      {selectedStudentIds.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {selectedStudentIds.map(id => {
                            const s = students.find(s => s.id === id)
                            if (!s) return null
                            return (
                              <span key={id} className="flex items-center gap-1 px-2 py-0.5 bg-purple-600 text-white rounded-full text-xs font-medium">
                                {s.name}
                                <button type="button" onClick={() => toggleStudent(id)} className="opacity-70 hover:opacity-100">×</button>
                              </span>
                            )
                          })}
                        </div>
                      )}
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Поиск ученика..."
                          value={studentSearch}
                          onChange={e => { setStudentSearch(e.target.value); setShowDropdown(true) }}
                          onFocus={() => setShowDropdown(true)}
                          onBlur={() => setShowDropdown(false)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                        />
                        {showDropdown && (
                          <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                            {students
                              .filter(s => !selectedStudentIds.includes(s.id) && s.name.toLowerCase().includes(studentSearch.toLowerCase()))
                              .map(s => (
                                <button
                                  key={s.id}
                                  type="button"
                                  onMouseDown={e => e.preventDefault()}
                                  onClick={() => { toggleStudent(s.id); setStudentSearch(''); setShowDropdown(false) }}
                                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                                >
                                  {s.name}
                                </button>
                              ))
                            }
                            {students.filter(s => !selectedStudentIds.includes(s.id) && s.name.toLowerCase().includes(studentSearch.toLowerCase())).length === 0 && (
                              <p className="px-3 py-2 text-sm text-gray-400">Не найдено</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Заметки</label>
                    <textarea name="notes" rows={2} className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none" />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" disabled={addLoading} className="flex-1 py-2 bg-purple-600 text-white text-sm rounded-xl hover:bg-purple-700 disabled:opacity-60 font-medium transition-colors">
                      {addLoading ? 'Сохранение...' : 'Добавить'}
                    </button>
                    <button type="button" onClick={() => { setAddSlot(null); setSelectedStudentIds([]); setStudentSearch('') }} className="px-3 py-2 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-50 transition-colors">
                      Отмена
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-4 text-xs text-gray-400">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-purple-200 inline-block" />Индивидуальное</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-orange-200 inline-block" />Групповое</span>
      </div>
    </div>
  )
}
