'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { calcPopoverPosition } from '@/lib/popoverPosition'

interface Student { id: string; name: string; tag: string }

interface AddLessonPopoverProps {
  date: string          // 'YYYY-MM-DD'
  time: string          // 'HH:MM'
  anchorRect: DOMRect
  students: Student[]
  onClose: () => void
  onSubmit: (formData: FormData, studentIds: string[]) => Promise<void>
}

const POPOVER_WIDTH = 260

export default function AddLessonPopover({
  date, time, anchorRect, students, onClose, onSubmit,
}: AddLessonPopoverProps) {
  const [loading, setLoading] = useState(false)
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])
  const [studentSearch, setStudentSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  const pos = calcPopoverPosition(
    anchorRect, POPOVER_WIDTH, 340,
    {
      width: typeof window !== 'undefined' ? window.innerWidth : 1280,
      height: typeof window !== 'undefined' ? window.innerHeight : 800,
      scrollY: typeof window !== 'undefined' ? window.scrollY : 0,
    }
  )

  function toggleStudent(id: string) {
    setSelectedStudentIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    try {
      const formData = new FormData(e.currentTarget)
      const t = formData.get('time') as string
      formData.set('date', `${date}T${t || time}:00`)
      await onSubmit(formData, selectedStudentIds)
    } finally {
      setLoading(false)
    }
  }

  const displayDate = new Date(date + 'T12:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })

  // ── Desktop popover styles ──────────────────────────────────────────────
  const desktopPopoverStyle: React.CSSProperties = {
    position: 'fixed',
    top: pos.top,
    left: pos.left,
    width: POPOVER_WIDTH,
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: 14,
    boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
    padding: 14,
    maxHeight: '80vh',
    overflowY: 'auto',
    zIndex: 51,
    pointerEvents: 'all',
  }

  // ── Mobile modal styles ─────────────────────────────────────────────────
  const mobilePopoverStyle: React.CSSProperties = {
    background: 'white', borderRadius: 16,
    width: 'calc(100vw - 32px)', maxWidth: 320,
    maxHeight: '80vh', overflowY: 'auto',
    padding: 16, position: 'relative', zIndex: 51,
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
  }

  const content = (
    <div
      style={isMobile
        ? { position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.35)' }
        : { position: 'fixed', inset: 0, zIndex: 50, pointerEvents: 'none' }
      }
      onClick={e => { if (isMobile && e.target === e.currentTarget) onClose() }}
    >
      {!isMobile && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={onClose} />
      )}

      <div style={isMobile ? mobilePopoverStyle : desktopPopoverStyle}>
        {/* Arrow — desktop only */}
        {!isMobile && pos.showAbove && (
          <div style={{ position: 'absolute', top: '100%', left: pos.arrowLeft, width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: '7px solid #e5e7eb' }}>
            <div style={{ position: 'absolute', top: -8, left: -6, width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '6px solid white' }} />
          </div>
        )}
        {!isMobile && !pos.showAbove && (
          <div style={{ position: 'absolute', bottom: '100%', left: pos.arrowLeft, width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderBottom: '7px solid #e5e7eb' }}>
            <div style={{ position: 'absolute', bottom: -8, left: -6, width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '6px solid white' }} />
          </div>
        )}

        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-gray-800 text-sm">Новое занятие — {displayDate}</p>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-500 text-lg leading-none ml-2">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Время</label>
              <input
                name="time" type="time" defaultValue={time}
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Тип</label>
              <select
                name="tag"
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="Индивидуальное">Индивидуальное</option>
                <option value="Группа">Группа</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Тема</label>
            <input
              name="title" placeholder="Необязательно"
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {students.length > 0 && (
            <div>
              <label className="block text-xs text-gray-500 mb-1">Ученики</label>
              {selectedStudentIds.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {selectedStudentIds.map(id => {
                    const s = students.find(s => s.id === id)
                    if (!s) return null
                    return (
                      <span key={id} className="flex items-center gap-0.5 px-2 py-0.5 bg-purple-600 text-white rounded-full text-[10px] font-medium">
                        {s.name}
                        <button type="button" onClick={() => toggleStudent(id)} className="opacity-70 hover:opacity-100">×</button>
                      </span>
                    )
                  })}
                </div>
              )}
              <div className="relative">
                <input
                  type="text" placeholder="Поиск ученика..."
                  value={studentSearch}
                  onChange={e => { setStudentSearch(e.target.value); setShowDropdown(true) }}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => setShowDropdown(false)}
                  className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                {showDropdown && (
                  <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-32 overflow-y-auto">
                    {students
                      .filter(s => !selectedStudentIds.includes(s.id) && s.name.toLowerCase().includes(studentSearch.toLowerCase()))
                      .map(s => (
                        <button key={s.id} type="button"
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => { toggleStudent(s.id); setStudentSearch(''); setShowDropdown(false) }}
                          className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                        >{s.name}</button>
                      ))}
                    {students.filter(s => !selectedStudentIds.includes(s.id) && s.name.toLowerCase().includes(studentSearch.toLowerCase())).length === 0 && (
                      <p className="px-3 py-1.5 text-xs text-gray-400">Не найдено</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <button
            type="submit" disabled={loading}
            className="w-full py-2 bg-purple-600 text-white text-xs rounded-xl hover:bg-purple-700 disabled:opacity-60 font-medium transition-colors"
          >{loading ? 'Создание...' : 'Создать занятие'}</button>
        </form>
      </div>
    </div>
  )

  return createPortal(content, document.body)
}
