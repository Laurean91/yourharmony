# Lesson Popover Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the side panel in `/bigbos/schedule` with a popover that appears above (or below) the clicked lesson block; on mobile (< 768px) it renders as a centered modal with backdrop.

**Architecture:** Extract position logic into a pure utility function (`src/lib/popoverPosition.ts`), create two new client components (`LessonPopover.tsx`, `AddLessonPopover.tsx`) that render via `createPortal`, then strip the side-panel JSX and flex-row wrapper from `WeekSchedule.tsx` and wire the new components in.

**Tech Stack:** React 18 `createPortal`, `getBoundingClientRect()`, Tailwind CSS, Jest + jsdom for unit tests.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/lib/popoverPosition.ts` | **Create** | Pure position calculation — no DOM imports |
| `src/lib/popoverPosition.test.ts` | **Create** | Unit tests for position logic |
| `src/components/LessonPopover.tsx` | **Create** | Existing-lesson popover: details, attendance, edit form |
| `src/components/AddLessonPopover.tsx` | **Create** | New-lesson popover: add form |
| `src/components/WeekSchedule.tsx` | **Modify** | Remove side panel, add portal renders, capture anchorRect |

---

## Task 1: Position Utility

**Files:**
- Create: `src/lib/popoverPosition.ts`
- Create: `src/lib/popoverPosition.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/popoverPosition.test.ts`:

```ts
import { calcPopoverPosition } from '@/lib/popoverPosition'

const vp = { width: 1280, height: 800, scrollY: 0 }
const W = 260
const H = 280

function rect(top: number, bottom: number, left: number, width = 100): DOMRect {
  return { top, bottom, left, right: left + width, width, height: bottom - top, x: left, y: top, toJSON: () => ({}) } as DOMRect
}

describe('calcPopoverPosition', () => {
  it('positions above when there is enough space above', () => {
    const pos = calcPopoverPosition(rect(400, 430, 600), W, H, vp)
    expect(pos.showAbove).toBe(true)
    expect(pos.top).toBe(400 - H - 10)
  })

  it('positions below when space above is insufficient', () => {
    const pos = calcPopoverPosition(rect(100, 130, 600), W, H, vp)
    expect(pos.showAbove).toBe(false)
    expect(pos.top).toBe(130 + 10)
  })

  it('clamps left so popover does not overflow right edge', () => {
    const pos = calcPopoverPosition(rect(400, 430, 1200, 60), W, H, vp)
    expect(pos.left).toBeLessThanOrEqual(vp.width - W - 8)
  })

  it('clamps left so popover does not overflow left edge', () => {
    const pos = calcPopoverPosition(rect(400, 430, 5, 60), W, H, vp)
    expect(pos.left).toBeGreaterThanOrEqual(8)
  })

  it('arrowLeft stays within popover bounds', () => {
    const pos = calcPopoverPosition(rect(400, 430, 600), W, H, vp)
    expect(pos.arrowLeft).toBeGreaterThanOrEqual(10)
    expect(pos.arrowLeft).toBeLessThanOrEqual(W - 24)
  })

  it('uses scrollY when anchor is below the fold', () => {
    const pos = calcPopoverPosition(rect(400, 430, 600), W, H, { ...vp, scrollY: 300 })
    expect(pos.top).toBe(400 + 300 - H - 10)
  })
})
```

- [ ] **Step 2: Run tests — expect FAIL ("Cannot find module")**

```bash
npx jest src/lib/popoverPosition.test.ts --no-coverage
```

Expected: `Cannot find module '@/lib/popoverPosition'`

- [ ] **Step 3: Create `src/lib/popoverPosition.ts`**

```ts
export interface PopoverPosition {
  top: number
  left: number
  showAbove: boolean
  arrowLeft: number
}

const GAP = 10

export function calcPopoverPosition(
  anchorRect: DOMRect,
  popoverWidth: number,
  popoverHeight: number,
  viewport: { width: number; height: number; scrollY: number }
): PopoverPosition {
  const spaceAbove = anchorRect.top
  const spaceBelow = viewport.height - anchorRect.bottom
  const showAbove = spaceAbove >= popoverHeight + GAP || spaceAbove > spaceBelow

  const top = showAbove
    ? anchorRect.top + viewport.scrollY - popoverHeight - GAP
    : anchorRect.bottom + viewport.scrollY + GAP

  const rawLeft = anchorRect.left + anchorRect.width / 2 - popoverWidth / 2
  const left = Math.max(8, Math.min(rawLeft, viewport.width - popoverWidth - 8))

  const arrowLeft = Math.max(
    10,
    Math.min(anchorRect.left + anchorRect.width / 2 - left - 7, popoverWidth - 24)
  )

  return { top, left, showAbove, arrowLeft }
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npx jest src/lib/popoverPosition.test.ts --no-coverage
```

Expected: `6 passed`

- [ ] **Step 5: Commit**

```bash
git add src/lib/popoverPosition.ts src/lib/popoverPosition.test.ts
git commit -m "feat: popover position utility with tests"
```

---

## Task 2: LessonPopover Component

**Files:**
- Create: `src/components/LessonPopover.tsx`

Contains all content currently in the side panel for an existing lesson: header, attendance list, edit/delete buttons, inline edit form. Renders via `createPortal`.

- [ ] **Step 1: Create `src/components/LessonPopover.tsx`**

```tsx
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

  // ── Desktop popover styles ──────────────────────────────────────────────
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

  // ── Mobile modal styles ─────────────────────────────────────────────────
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
      {/* Desktop backdrop (invisible, captures outside clicks) */}
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/LessonPopover.tsx
git commit -m "feat: LessonPopover component with portal positioning"
```

---

## Task 3: AddLessonPopover Component

**Files:**
- Create: `src/components/AddLessonPopover.tsx`

Simple add form (time, type, title, students). Mirrors the add-form currently in the side panel.

- [ ] **Step 1: Create `src/components/AddLessonPopover.tsx`**

```tsx
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
    { width: window.innerWidth, height: window.innerHeight, scrollY: window.scrollY }
  )

  function toggleStudent(id: string) {
    setSelectedStudentIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const t = formData.get('time') as string
    formData.set('date', `${date}T${t || time}:00`)
    await onSubmit(formData, selectedStudentIds)
    setLoading(false)
  }

  const displayDate = new Date(date + 'T12:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })

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
        {/* Arrow */}
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/AddLessonPopover.tsx
git commit -m "feat: AddLessonPopover component"
```

---

## Task 4: Update WeekSchedule.tsx

**Files:**
- Modify: `src/components/WeekSchedule.tsx`

Remove the side panel and flex-row wrapper; add `anchorRect` state; capture `getBoundingClientRect()` on lesson and slot clicks; render the two new popover components.

- [ ] **Step 1: Add imports at the top of `WeekSchedule.tsx`**

After the existing `import { useState, useRef, useEffect } from 'react'` line, add:

```ts
import LessonPopover from './LessonPopover'
import AddLessonPopover from './AddLessonPopover'
```

- [ ] **Step 2: Add `anchorRect` state, remove edit-mode states**

In the state block (around line 72), **add** after `const [addLoading, setAddLoading] = useState(false)`:

```ts
const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null)
```

**Remove** these 5 state declarations (they move into `LessonPopover`):

```ts
// Edit mode
const [editMode, setEditMode] = useState(false)
const [editLoading, setEditLoading] = useState(false)
const [editStudentIds, setEditStudentIds] = useState<string[]>([])
const [editStudentSearch, setEditStudentSearch] = useState('')
const [editShowDropdown, setEditShowDropdown] = useState(false)
```

- [ ] **Step 3: Remove edit-mode functions**

Remove these 4 functions entirely (they live in `LessonPopover` now):

```ts
function openEditMode(lesson: Lesson) { ... }
function closeEditMode() { ... }
async function handleEditLesson(e: React.FormEvent<HTMLFormElement>) { ... }
function toggleEditStudent(id: string) { ... }
```

- [ ] **Step 4: Add edit callback function**

Add a new `handleEditLesson` callback after `handleDelete`:

```ts
async function handleEditLesson(id: string, formData: FormData, studentIds: string[]) {
  studentIds.forEach(sid => formData.append('studentIds', sid))
  await updateLesson(id, formData)
  window.location.reload()
}
```

- [ ] **Step 5: Update `handleDelete` to also clear `anchorRect`**

Find:
```ts
async function handleDelete(id: string) {
  await deleteLesson(id)
  setLessons(ls => ls.filter(l => l.id !== id))
  setSelected(null)
}
```

Replace with:
```ts
async function handleDelete(id: string) {
  await deleteLesson(id)
  setLessons(ls => ls.filter(l => l.id !== id))
  setSelected(null)
  setAnchorRect(null)
}
```

- [ ] **Step 6: Update `handleSlotClick` to accept and store `anchorRect`**

Find:
```ts
function handleSlotClick(day: Date, hour: number) {
  const dateKey = toDateKey(day)
  const time = `${String(hour).padStart(2, '0')}:00`
  setAddSlot({ date: dateKey, time })
  setSelected(null)
}
```

Replace with:
```ts
function handleSlotClick(e: React.MouseEvent<HTMLDivElement>, day: Date, hour: number) {
  const dateKey = toDateKey(day)
  const time = `${String(hour).padStart(2, '0')}:00`
  setAnchorRect(e.currentTarget.getBoundingClientRect())
  setAddSlot({ date: dateKey, time })
  setSelected(null)
}
```

- [ ] **Step 7: Update the slot `onClick` to pass the event**

Find:
```ts
onClick={() => handleSlotClick(day, h)}
```

Replace with:
```ts
onClick={e => handleSlotClick(e, day, h)}
```

- [ ] **Step 8: Update the lesson block `onClick` to capture `anchorRect`**

Find (line ~425):
```ts
onClick={e => { e.stopPropagation(); if (isActive) { setSelected(null); closeEditMode() } else { setSelected(l); setAddSlot(null); closeEditMode() } }}
```

Replace with:
```ts
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
```

- [ ] **Step 9: Update the "+" button onClick to store `anchorRect`**

Find:
```ts
onClick={() => { setAddSlot({ date: toDateKey(new Date()), time: '09:00' }); setSelected(null) }}
```

Replace with:
```ts
onClick={e => {
  setAnchorRect(e.currentTarget.getBoundingClientRect())
  setAddSlot({ date: toDateKey(new Date()), time: '09:00' })
  setSelected(null)
}}
```

- [ ] **Step 10: Remove the flex-row wrapper and replace with fragment**

Find the outer layout div (around line 316):
```tsx
<div className="flex flex-col md:flex-row gap-4 items-start">
  {/* Timeline grid */}
  <div className="w-full min-w-0 overflow-x-auto">
    ...
  </div>

  {/* Side panel */}
  {(selected || addSlot) && (
    <div className="w-full md:w-72 md:shrink-0 bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
      ...entire side panel JSX...
    </div>
  )}
</div>
```

Replace with (keep only the timeline grid, remove the side panel entirely):
```tsx
<div className="w-full min-w-0 overflow-x-auto">
  <div style={{ minWidth: 520 }}>
    {/* ...existing day headers and grid unchanged... */}
  </div>
</div>
```

> The `<div className="w-full min-w-0 overflow-x-auto">` and its inner `<div style={{ minWidth: 520 }}>` are already inside the old flex wrapper — just remove the flex wrapper and the entire side-panel `{(selected || addSlot) && ...}` block.

- [ ] **Step 11: Add popover renders at the end of the returned JSX**

After the timeline grid div and before the final closing `</div>` of the main `<div className="p-4 md:p-6">`, add:

```tsx
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
    onClose={() => { setAddSlot(null); setAnchorRect(null); setSelectedStudentIds([]) }}
    onSubmit={async (formData, studentIds) => {
      setAddLoading(true)
      studentIds.forEach(id => formData.append('studentIds', id))
      await createLesson(formData)
      setAddSlot(null)
      setAnchorRect(null)
      setSelectedStudentIds([])
      setAddLoading(false)
      window.location.reload()
    }}
  />
)}
```

- [ ] **Step 12: Remove now-unused state variables**

Remove these states that were only used by the old side-panel add form (the form is now in `AddLessonPopover`):

```ts
const [studentSearch, setStudentSearch] = useState('')
const [showDropdown, setShowDropdown] = useState(false)
```

Also remove `toggleStudent` function and `handleAddLesson` function (both now live inside `AddLessonPopover`).

- [ ] **Step 13: Verify TypeScript compiles with 0 errors**

```bash
npx tsc --noEmit
```

Expected: 0 errors. Fix any remaining references to removed states/functions.

- [ ] **Step 14: Run all tests**

```bash
npx jest --no-coverage
```

Expected: all pass (existing Navbar/Footer tests + new position tests).

- [ ] **Step 15: Commit**

```bash
git add src/components/WeekSchedule.tsx
git commit -m "feat: replace schedule side panel with lesson popover"
```

---

## Task 5: Manual Verification

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Desktop checks**

Open `http://localhost:3000/bigbos/schedule`.

- [ ] Click a lesson block — popover appears **above** it with a downward arrow
- [ ] Click a lesson near the top of the grid — popover appears **below** it with an upward arrow  
- [ ] Popover shows date/time, tag badge, attendance list
- [ ] Click a student row — attendance toggles (spinner shows, then checkmark)
- [ ] Click «Редактировать» — edit form expands inside the popover, can scroll
- [ ] Edit form: change date/time/tag/title, click «Сохранить» — page reloads with changes
- [ ] Click «Удалить» — lesson disappears, popover closes
- [ ] Click outside the popover — popover closes
- [ ] Click an empty slot — add popover appears, form creates a new lesson
- [ ] Click «+ Занятие» button in header — add popover appears over the button

- [ ] **Step 3: Mobile checks**

Open DevTools → toggle device toolbar → iPhone 12 (390×844).

- [ ] Click a lesson — centered modal appears with backdrop
- [ ] Tapping backdrop closes the modal
- [ ] Attendance, edit, delete all work the same
- [ ] Add form works on mobile
- [ ] Drag-and-drop still works (touch drag a lesson to a new slot)

- [ ] **Step 4: Commit verification**

```bash
git add -p  # nothing to stage — all committed
git log --oneline -5
```

---

## Self-Review Notes

- All spec requirements covered: popover above lesson, fallback below, arrow, attendance inline, edit form inline, mobile centered modal, backdrop, click-outside close, add form as popover.
- `calcPopoverPosition` is pure and fully tested.
- No `TBD` or placeholder steps.
- Type signatures consistent throughout: `onEdit(id, formData, studentIds)` in Task 2 matches Task 4.
- `selectedStudentIds` / `studentSearch` / `showDropdown` states and `toggleStudent` / `handleAddLesson` functions in WeekSchedule must be removed in Step 12 — if tsc passes in Step 13, they are gone.
