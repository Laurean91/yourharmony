'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

export type StudentData = {
  id: string
  name: string
  tag: string | null
  age: number | null
  photoUrl: string | null
  attended: number
  total: number
  rate: number
  streak: number
  lastGrade: number | null
  levelName: string
  levelColor: string
  levelBg: string
  levelNextAt: number
  levelPct: number
  badges: { label: string; icon: string; color: string; bg: string }[]
  stars: number
  nextLesson: { date: string; title: string | null } | null
  gradesAsc: number[]
}

export type ParentData = {
  name: string
  students: StudentData[]
  libraryCount: number
  libraryRecent: { title: string; category: string | null }[]
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function ParentDashboardClient({
  data,
  studentCards,
  footer,
}: {
  data: ParentData
  studentCards: React.ReactNode[]
  footer: React.ReactNode
}) {
  const [activeIdx, setActiveIdx] = useState(0)
  const students = data.students
  const hasMultiple = students.length > 1

  return (
    <div className="px-4 md:px-8 py-6 max-w-5xl mx-auto">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-extrabold leading-tight" style={{ color: 'var(--par-text-primary)' }}>
              Привет, <span style={{ color: 'var(--par-accent)' }}>{data.name}</span> 👋
            </h1>
            <p className="text-xs" style={{ color: 'var(--par-text-muted)' }}>Личный кабинет клуба «Гармония»</p>
          </div>
        </div>

        {/* Child switcher — top right on desktop if multiple */}
        {hasMultiple && (
          <div className="hidden md:flex items-center gap-3">
            {students.map((s, i) => {
              const active = i === activeIdx
              const initials = getInitials(s.name)
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveIdx(i)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200"
                  style={{
                    background: active ? 'var(--par-nav-active-bg)' : 'transparent',
                    border: active ? '1.5px solid var(--par-accent)' : '1.5px solid var(--par-glass-border)',
                    outline: 'none',
                  }}
                >
                  <div
                    className="relative rounded-full overflow-hidden shrink-0"
                    style={{ width: 26, height: 26 }}
                  >
                    {s.photoUrl ? (
                      <Image src={s.photoUrl} alt={s.name} fill className="object-cover" />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-white font-bold text-[10px]"
                        style={{ background: 'linear-gradient(135deg, var(--par-accent), var(--par-cta))' }}
                      >
                        {initials}
                      </div>
                    )}
                  </div>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: active ? 'var(--par-accent)' : 'var(--par-text-secondary)' }}
                  >
                    {s.name.split(' ')[0]}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Mobile child switcher */}
      {hasMultiple && (
        <div className="flex md:hidden items-center justify-center gap-4 mb-5">
          {students.map((s, i) => {
            const active = i === activeIdx
            const initials = getInitials(s.name)
            return (
              <button
                key={s.id}
                onClick={() => setActiveIdx(i)}
                className="flex flex-col items-center gap-1.5 transition-all duration-300"
              >
                <div
                  className="relative rounded-full overflow-hidden"
                  style={{
                    width: active ? 56 : 44,
                    height: active ? 56 : 44,
                    boxShadow: active ? 'var(--par-ring-glow)' : '0 2px 8px rgba(0,0,0,0.06)',
                    border: active ? '2.5px solid var(--par-accent)' : '2px solid var(--par-glass-border)',
                    opacity: active ? 1 : 0.6,
                    transition: 'all 0.3s',
                  }}
                >
                  {s.photoUrl ? (
                    <Image src={s.photoUrl} alt={s.name} fill className="object-cover" />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center font-bold text-white"
                      style={{
                        background: 'linear-gradient(135deg, var(--par-accent), var(--par-cta))',
                        fontSize: active ? 16 : 13,
                      }}
                    >
                      {initials}
                    </div>
                  )}
                </div>
                <span
                  className="text-[11px] font-semibold truncate max-w-[64px]"
                  style={{ color: active ? 'var(--par-accent)' : 'var(--par-text-muted)' }}
                >
                  {s.name.split(' ')[0]}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* ── Animated content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIdx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          {studentCards[activeIdx] ?? (
            <div className="text-center py-16" style={{ color: 'var(--par-text-muted)' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="mx-auto mb-3" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
              <p className="text-sm">Пока нет привязанных детей.<br/>Обратитесь к преподавателю.</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {footer}
    </div>
  )
}
