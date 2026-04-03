'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { calcPopoverPosition } from '@/lib/popoverPosition'

interface Student { id: string; name: string; tag: string }
interface LessonStudent { studentId: string; attended: boolean; student: Student }
interface Lesson {
  id: string; date: Date; title: string | null
  tag: string; notes: string | null; students: LessonStudent[]
}

interface LessonPopoverProps {
  lesson: Lesson
  students: Student[]
  anchorRect: DOMRect
  pendingAttendance: string | null
  onClose: () => void
  onDelete: (id: string) => void
  onAttendance: (lessonId: string, studentId: string, attended: boolean) => void
  onEdit: (id: string, formData: FormData, studentIds: string[]) => Promise<void>
}

const POPOVER_WIDTH = 260
const LESSON_DURATION = 60

export default function LessonPopover({
  lesson, students, anchorRect, pendingAttendance,
  onClose, onDelete, onAttendance, onEdit,
}: LessonPopoverProps) {
  const [editMode, setEditMode] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [editStudentIds, setEditStudentIds] = useState<string[]>([])
  const [editStudentSearch, setEditStudentSearch] = useState('')
  const [editShowDropdown, setEditShowDropdown] = useState(false)

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  const popoverHeight = editMode ? 480 : 300
  const pos = calcPopoverPosition(
    anchorRect, POPOVER_WIDTH, popoverHeight,
    { width: window.innerWidth, height: window.innerHeight, scrollY: window.scrollY }
  )

  const lDate = new Date(lesson.date)
  const endDate = new Date(lDate.getTime() + LESSON_DURATION * 60 * 1000)
  const timeStart = lDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  const timeEnd   = endDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  const isIndividual = lesson.tag !== 'Группа' && lesson.tag !== 'Групповое'

  function openEdit() {
    setEditStudentIds(lesson.students.map(ls => ls.studentId))
    setEditStudentSearch('')
    setEditShowDropdown(false)
    setEditMode(true)
  }

  function cancelEdit() {
    setEditMode(false)
    setEditStudentIds([])
    setEditStudentSearch('')
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setEditLoading(true)
    const formData = new FormData(e.currentTarget)
    const date = formData.get('date') as string
    const time = formData.get('time') as string
    formData.set('date', `${date}T${time}:00`)
    await onEdit(lesson.id, formData, editStudentIds)
    setEditLoading(false)
  }

  function toggleEditStudent(id: string) {
    setEditStudentIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const desktopWrapperStyle: React.CSSProperties = {
    position: 'fixed', inset: 0, zIndex: 50, pointerEvents: 'none',
  }
  const desktopPopoverStyle: React.CSSProperties = {
    position: 'fixed',
    top: pos.top,
    left: pos.left,
    width: POPOVER_WIDTH,
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: 14,
    boxShadow: '0 8px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)',
    padding: 14,
    maxHeight: '80vh',
    overflowY: 'auto',
    zIndex: 51,
    pointerEvents: 'all',
  }
  const mobileWrapperStyle: React.CSSProperties = {
    position: 'fixed', inset: 0, zIndex: 50,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(0,0,0,0.35)',
  }
  const mobilePopoverStyle: React.CSSProperties = {
    background: 'white',
    borderRadius: 16,
    width: 'calc(100vw - 32px)',
    maxWidth: 320,
    maxHeight: '80vh',
    overflowY: 'auto',
    padding: 16,
    position: 'relative',
    zIndex: 51,
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
  }

  const content = (
    <div
      style={isMobile ? mobileWrapperStyle : desktopWrapperStyle}
      onClick={e => { if (!isMobile) return; if (e.target === e.currentTarget) onClose() }}
    >
      {!isMobile && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={onClose} />
      )}

      <div style={isMobile ? mobilePopoverStyle : desktopPopoverStyle}>

        {/* Arrow — desktop only */}
        {!isMobile && pos.showAbove && (
          <div style={{
            position: 'absolute', top: '100%', left: pos.arrowLeft,
            width: 0, height: 0,
            borderLeft: '7px solid transparent', borderRight: '7px solid transparent',
            borderTop: '7px solid #e5e7eb',
          }}>
            <div style={{
              position: 'absolute', top: -8, left: -6,
              width: 0, height: 0,
              borderLeft: '6px solid transparent', borderRight: '6px solid transparent',
              borderTop: '6px solid white',
            }} />
          </div>
        )}
        {!isMobile && !pos.showAbove && (
          <div style={{
            position: 'absolute', bottom: '100%', left: pos.arrowLeft,
            width: 0, height: 0,
            borderLeft: '7px solid transparent', borderRight: '7px solid transparent',
            borderBottom: '7px solid #e5e7eb',
          }}>
            <div style={{
              position: 'absolute', bottom: -8, left: -6,
              width: 0, height: 0,
              borderLeft: '6px solid transparent', borderRight: '6px solid transparent',
              borderBottom: '6px solid white',
            }} />
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="font-semibold text-gray-800 text-sm">
              {lDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
              {' · '}{timeStart}–{timeEnd}
            </p>
            {lesson.title && <p className="text-xs text-gray-500 mt-0.5">{lesson.title}</p>}
            <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${
              isIndividual ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
            }`}>{lesson.tag}</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-gray-500 text-lg leading-none ml-2 shrink-0"
          >×</button>
        </div>

        {lesson.notes && <p className="text-xs text-gray-500 mb-3">{lesson.notes}</p>}

        {/* Attendance */}
        {lesson.students.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Посещаемость</p>
              <span className="text-xs font-semibold text-gray-400">
                {lesson.students.filter(s => s.attended).length}
                <span className="font-normal"> / {lesson.students.length}</span>
              </span>
            </div>
            <div className="space-y-1">
              {lesson.students.map(ls => {
                const initials = ls.student.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
                const isPending = pendingAttendance === ls.studentId
                return (
                  <button
                    key={ls.studentId}
                    onClick={() => !isPending && onAttendance(lesson.id, ls.studentId, !ls.attended)}
                    disabled={isPending}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all text-left ${
                      ls.attended
                        ? 'bg-green-50 border-green-200 hover:bg-green-100'
                        : 'bg-gray-50 border-gray-100 hover:border-gray-300 hover:bg-gray-100'
                    } ${isPending ? 'opacity-60' : ''}`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors ${
                      ls.attended ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {isPending ? (
                        <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                      ) : initials}
                    </div>
                    <span className={`flex-1 text-xs font-medium truncate ${
                      ls.attended ? 'text-green-800' : 'text-gray-600'
                    }`}>{ls.student.name}</span>
                    <span className={`text-sm shrink-0 ${ls.attended ? 'text-green-500' : 'text-gray-300'}`}>
                      {ls.attended ? '✓' : '○'}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {lesson.students.length === 0 && !editMode && (
          <p className="text-xs text-gray-400 mb-3">Ученики не назначены</p>
        )}

        {/* Actions */}
        {!editMode && (
          <div className="flex gap-2">
            <button
              onClick={openEdit}
              className="flex-1 py-2 text-xs text-purple-600 border border-purple-200 rounded-xl hover:bg-purple-50 transition-colors font-medium"
            >Редактировать</button>
            <button
              onClick={() => onDelete(lesson.id)}
              className="flex-1 py-2 text-xs text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
            >Удалить</button>
          </div>
        )}

        {/* Edit form */}
        {editMode && (
          <form onSubmit={handleSubmit} className="space-y-2.5 border-t border-gray-100 pt-3">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Редактирование</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Дата</label>
                <input
                  name="date" type="date"
                  defaultValue={lDate.toISOString().slice(0, 10)}
                  className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Время</label>
                <input
                  name="time" type="time"
                  defaultValue={`${String(lDate.getHours()).padStart(2,'0')}:${String(lDate.getMinutes()).padStart(2,'0')}`}
                  className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Тип</label>
              <select
                name="tag" defaultValue={lesson.tag}
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="Индивидуальное">Индивидуальное</option>
                <option value="Группа">Группа</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Тема</label>
              <input
                name="title" defaultValue={lesson.title ?? ''} placeholder="Необязательно"
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Ученики</label>
              {editStudentIds.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {editStudentIds.map(id => {
                    const s = students.find(s => s.id === id)
                    if (!s) return null
                    return (
                      <span key={id} className="flex items-center gap-0.5 px-2 py-0.5 bg-purple-600 text-white rounded-full text-[10px] font-medium">
                        {s.name}
                        <button type="button" onClick={() => toggleEditStudent(id)} className="opacity-70 hover:opacity-100">×</button>
                      </span>
                    )
                  })}
                </div>
              )}
              <div className="relative">
                <input
                  type="text" placeholder="Поиск ученика..."
                  value={editStudentSearch}
                  onChange={e => { setEditStudentSearch(e.target.value); setEditShowDropdown(true) }}
                  onFocus={() => setEditShowDropdown(true)}
                  onBlur={() => setEditShowDropdown(false)}
                  className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                {editShowDropdown && (
                  <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-32 overflow-y-auto">
                    {students
                      .filter(s => !editStudentIds.includes(s.id) && s.name.toLowerCase().includes(editStudentSearch.toLowerCase()))
                      .map(s => (
                        <button key={s.id} type="button"
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => { toggleEditStudent(s.id); setEditStudentSearch(''); setEditShowDropdown(false) }}
                          className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                        >{s.name}</button>
                      ))}
                    {students.filter(s => !editStudentIds.includes(s.id) && s.name.toLowerCase().includes(editStudentSearch.toLowerCase())).length === 0 && (
                      <p className="px-3 py-1.5 text-xs text-gray-400">Не найдено</p>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Заметки</label>
              <textarea
                name="notes" rows={2} defaultValue={lesson.notes ?? ''}
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit" disabled={editLoading}
                className="flex-1 py-2 bg-purple-600 text-white text-xs rounded-xl hover:bg-purple-700 disabled:opacity-60 font-medium transition-colors"
              >{editLoading ? 'Сохранение...' : 'Сохранить'}</button>
              <button
                type="button" onClick={cancelEdit}
                className="px-3 py-2 border border-gray-200 text-gray-600 text-xs rounded-xl hover:bg-gray-50 transition-colors"
              >Отмена</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )

  return createPortal(content, document.body)
}
