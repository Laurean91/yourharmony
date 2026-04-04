'use client'

import { useState, useRef, useEffect } from 'react'
import { createLesson, deleteLesson, markAttendance, updateLesson, moveLessonDate } from '@/app/actions'
import LessonPopover from './LessonPopover'
import AddLessonPopover from './AddLessonPopover'

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
  const [pendingAttendance, setPendingAttendance] = useState<string | null>(null)
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null)
  // Mouse drag-and-drop
  const dragLessonId = useRef<string | null>(null)
  const [dragOverSlot, setDragOverSlot] = useState<{ dateKey: string; hour: number } | null>(null)
  // Touch drag-and-drop
  const touchDragLessonId = useRef<string | null>(null)
  const touchStartPos = useRef<{ x: number; y: number } | null>(null)
  const touchDragging = useRef(false)
  const touchDraggedEl = useRef<HTMLElement | null>(null)
  const dragOverSlotRef = useRef<{ dateKey: string; hour: number } | null>(null)
  const [pendingTouchDrop, setPendingTouchDrop] = useState<{ lessonId: string; dateKey: string; hour: number } | null>(null)

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

  function handleSlotClick(e: React.MouseEvent<HTMLDivElement>, day: Date, hour: number) {
    const dateKey = toDateKey(day)
    const time = `${String(hour).padStart(2, '0')}:00`
    setAnchorRect(e.currentTarget.getBoundingClientRect())
    setAddSlot({ date: dateKey, time })
    setSelected(null)
  }

  async function handleDelete(id: string) {
    await deleteLesson(id)
    setLessons(ls => ls.filter(l => l.id !== id))
    setSelected(null)
    setAnchorRect(null)
  }

  async function handleEditLesson(id: string, formData: FormData, studentIds: string[]) {
    studentIds.forEach(sid => formData.append('studentIds', sid))
    await updateLesson(id, formData)
    window.location.reload()
  }

  function handleDragStart(lessonId: string) {
    dragLessonId.current = lessonId
    setSelected(null)
    setAnchorRect(null)
  }

  function handleDragOver(e: React.DragEvent, dateKey: string, hour: number) {
    e.preventDefault()
    setDragOverSlot({ dateKey, hour })
  }

  async function handleDrop(e: React.DragEvent, day: Date, hour: number) {
    e.preventDefault()
    setDragOverSlot(null)
    const id = dragLessonId.current
    dragLessonId.current = null
    if (!id) return
    const lesson = lessons.find(l => l.id === id)
    if (!lesson) return
    const oldDate = new Date(lesson.date)
    const newDate = new Date(day)
    newDate.setHours(hour, oldDate.getMinutes(), 0, 0)
    // Optimistic update
    setLessons(ls => ls.map(l => l.id === id ? { ...l, date: newDate } : l))
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, date: newDate } : null)
    await moveLessonDate(id, newDate.toISOString())
  }

  // Non-passive touch listeners for drag-and-drop on mobile
  useEffect(() => {
    function onTouchMove(e: TouchEvent) {
      if (!touchDragLessonId.current || !touchStartPos.current) return
      const touch = e.touches[0]
      const dx = touch.clientX - touchStartPos.current.x
      const dy = touch.clientY - touchStartPos.current.y
      if (!touchDragging.current && Math.sqrt(dx * dx + dy * dy) < 10) return
      if (!touchDragging.current) {
        setSelected(null)
        setAnchorRect(null)
      }
      touchDragging.current = true
      e.preventDefault()
      // Temporarily disable pointer events on the dragged element so elementFromPoint finds what's underneath
      const draggedEl = touchDraggedEl.current
      if (draggedEl) draggedEl.style.pointerEvents = 'none'
      const el = document.elementFromPoint(touch.clientX, touch.clientY)
      if (draggedEl) draggedEl.style.pointerEvents = ''
      if (!el) { setDragOverSlot(null); dragOverSlotRef.current = null; return }
      const slot = (el as HTMLElement).closest('[data-hour]') as HTMLElement | null
      if (slot?.dataset.datekey && slot.dataset.hour) {
        const s = { dateKey: slot.dataset.datekey, hour: parseInt(slot.dataset.hour) }
        setDragOverSlot(s)
        dragOverSlotRef.current = s
      } else {
        setDragOverSlot(null)
        dragOverSlotRef.current = null
      }
    }

    function onTouchEnd() {
      const id = touchDragLessonId.current
      const slot = dragOverSlotRef.current
      touchDragLessonId.current = null
      touchStartPos.current = null
      touchDraggedEl.current = null
      touchDragging.current = false
      dragOverSlotRef.current = null
      setDragOverSlot(null)
      if (id && slot) {
        setPendingTouchDrop({ lessonId: id, dateKey: slot.dateKey, hour: slot.hour })
      }
    }

    document.addEventListener('touchmove', onTouchMove, { passive: false })
    document.addEventListener('touchend', onTouchEnd)
    return () => {
      document.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('touchend', onTouchEnd)
    }
  }, [])

  useEffect(() => {
    if (!pendingTouchDrop) return
    const { lessonId, dateKey, hour } = pendingTouchDrop
    setPendingTouchDrop(null)
    const lesson = lessons.find(l => l.id === lessonId)
    if (!lesson) return
    const [year, month, day] = dateKey.split('-').map(Number)
    const targetDay = new Date(year, month - 1, day)
    const oldDate = new Date(lesson.date)
    const newDate = new Date(targetDay)
    newDate.setHours(hour, oldDate.getMinutes(), 0, 0)
    setLessons(ls => ls.map(l => l.id === lessonId ? { ...l, date: newDate } : l))
    setSelected(prev => prev?.id === lessonId ? { ...prev, date: newDate } : prev)
    moveLessonDate(lessonId, newDate.toISOString())
  }, [pendingTouchDrop, lessons])

  async function handleAttendance(lessonId: string, studentId: string, attended: boolean) {
    setPendingAttendance(studentId)
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
    setPendingAttendance(null)
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
            onClick={e => {
              setAnchorRect(e.currentTarget.getBoundingClientRect())
              setAddSlot({ date: toDateKey(new Date()), time: '09:00' })
              setSelected(null)
            }}
            className="px-4 py-2 bg-purple-600 text-white text-sm rounded-xl hover:bg-purple-700 transition-colors font-medium"
          >
            + Занятие
          </button>
        </div>
      </div>

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
            <div
              className="w-12 shrink-0 relative"
              style={{
                height: gridHeight,
                background: 'rgba(139,92,246,0.04)',
                borderRight: '1px solid rgba(139,92,246,0.2)',
              }}
            >
              {hours.map(h => (
                <div
                  key={h}
                  className="absolute right-2 text-[10px] font-semibold -translate-y-2"
                  style={{ top: (h - START_HOUR) * 60 * PX_PER_MIN, color: '#a78bfa' }}
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
                <div key={di} className="flex-1 relative border-l border-gray-200" style={{ height: gridHeight }}>
                  {/* Hour lines + click slots */}
                  {hours.map(h => {
                    const isDragOver = dragOverSlot?.dateKey === key && dragOverSlot?.hour === h
                    return (
                      <div
                        key={h}
                        data-datekey={key}
                        data-hour={h}
                        className={`absolute left-0 right-0 border-t border-gray-200 cursor-pointer transition-colors group ${isDragOver ? 'bg-purple-100/70' : 'hover:bg-purple-50/50'}`}
                        style={{ top: (h - START_HOUR) * 60 * PX_PER_MIN, height: 60 * PX_PER_MIN }}
                        onClick={e => handleSlotClick(e, day, h)}
                        onDragOver={e => handleDragOver(e, key, h)}
                        onDragLeave={() => setDragOverSlot(null)}
                        onDrop={e => handleDrop(e, day, h)}
                      >
                        {isDragOver ? (
                          <div className="absolute inset-0 flex items-center justify-center rounded">
                            <span
                              className="text-xs font-bold px-2 py-0.5 rounded"
                              style={{ background: 'rgba(124,58,237,0.15)', color: '#7c3aed' }}
                            >
                              Перенести сюда ↓
                            </span>
                          </div>
                        ) : (
                          <div className="hidden group-hover:flex absolute inset-0 items-center justify-center rounded">
                            <span
                              className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                              style={{ background: 'rgba(124,58,237,0.12)', color: '#7c3aed' }}
                            >
                              + занятие
                            </span>
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {/* Lesson blocks */}
                  {dayLessons.map(l => {
                    const lDate = new Date(l.date)
                    const endDate = new Date(lDate.getTime() + LESSON_DURATION * 60 * 1000)
                    const top = lessonTopPx(lDate)
                    const height = LESSON_DURATION * PX_PER_MIN
                    const isIndividual = l.tag !== 'Группа' && l.tag !== 'Групповое'
                    const isActive = selected?.id === l.id
                    const timeStart = lDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
                    const timeEnd   = endDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
                    return (
                      <div
                        key={l.id}
                        draggable
                        onDragStart={e => { e.stopPropagation(); handleDragStart(l.id) }}
                        onTouchStart={e => {
                          touchDragLessonId.current = l.id
                          touchStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
                          touchDragging.current = false
                          touchDraggedEl.current = e.currentTarget
                        }}
                        onClick={e => {
                          e.stopPropagation()
                          if (isActive) {
                            setSelected(null)
                            setAnchorRect(null)
                          } else {
                            setSelected(l)
                            setAnchorRect(e.currentTarget.getBoundingClientRect())
                            setAddSlot(null)
                          }
                        }}
                        className={`absolute left-1 right-1 rounded-lg px-2 py-1 text-left text-xs transition-all shadow-sm cursor-grab active:cursor-grabbing select-none ${
                          isActive ? 'z-10' : 'hover:brightness-95 z-0'
                        }`}
                        style={{
                          top,
                          height: Math.max(height, 28),
                          touchAction: 'none',
                          background: isIndividual
                            ? (isActive ? 'rgba(124,58,237,0.2)' : 'rgba(139,92,246,0.12)')
                            : (isActive ? 'rgba(249,115,22,0.2)' : 'rgba(251,146,60,0.12)'),
                          borderTop: isActive
                            ? `2px solid ${isIndividual ? '#7c3aed' : '#f97316'}`
                            : `1px solid ${isIndividual ? 'rgba(124,58,237,0.25)' : 'rgba(249,115,22,0.25)'}`,
                          borderRight: isActive
                            ? `2px solid ${isIndividual ? '#7c3aed' : '#f97316'}`
                            : `1px solid ${isIndividual ? 'rgba(124,58,237,0.25)' : 'rgba(249,115,22,0.25)'}`,
                          borderBottom: isActive
                            ? `2px solid ${isIndividual ? '#7c3aed' : '#f97316'}`
                            : `1px solid ${isIndividual ? 'rgba(124,58,237,0.25)' : 'rgba(249,115,22,0.25)'}`,
                          borderLeft: `3px solid ${isIndividual ? '#7c3aed' : '#f97316'}`,
                          color: isIndividual ? '#5b21b6' : '#c2410c',
                          boxShadow: isActive
                            ? `0 2px 12px ${isIndividual ? 'rgba(124,58,237,0.25)' : 'rgba(249,115,22,0.25)'}`
                            : 'none',
                        }}
                      >
                        <div className="font-bold leading-tight truncate text-[11px]">
                          {timeStart}
                          <span className="font-normal opacity-60 ml-1">→ {timeEnd}</span>
                          {l.title ? ` · ${l.title}` : ''}
                        </div>
                        {l.students.length > 0 && (
                          <div className="truncate opacity-60 text-[10px] mt-0.5">
                            {l.students.map(s => s.student.name).join(', ')}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-4 text-xs text-gray-400">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-purple-200 inline-block" />Индивидуальное</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-orange-200 inline-block" />Групповое</span>
      </div>

      {/* Lesson popover */}
      {selected && anchorRect && (
        <LessonPopover
          lesson={selected}
          students={students}
          anchorRect={anchorRect}
          pendingAttendance={pendingAttendance}
          onClose={() => { setSelected(null); setAnchorRect(null) }}
          onDelete={handleDelete}
          onAttendance={handleAttendance}
          onEdit={handleEditLesson}
        />
      )}

      {/* Add lesson popover */}
      {addSlot && anchorRect && (
        <AddLessonPopover
          date={addSlot.date}
          time={addSlot.time}
          anchorRect={anchorRect}
          students={students}
          onClose={() => { setAddSlot(null); setAnchorRect(null) }}
          onSubmit={async (formData, studentIds) => {
            studentIds.forEach(id => formData.append('studentIds', id))
            await createLesson(formData)
            setAddSlot(null)
            setAnchorRect(null)
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}
