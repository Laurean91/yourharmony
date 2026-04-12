'use client'

import Image from 'next/image'
import {
  Home, Calendar, Star, CheckSquare, Sparkles, Library,
  LogOut, MoreHorizontal, X, ChevronRight, BookOpen,
  Flame, Trophy, Target, Zap,
} from 'lucide-react'
import { useState } from 'react'

/* ── Mock data ─────────────────────────────────────────────────── */

const PARENT = { name: 'Анна' }

const STUDENTS = [
  {
    id: '1',
    name: 'Мария Иванова',
    tag: 'Beginners',
    age: 7,
    initials: 'МИ',
    attended: 18,
    total: 22,
    rate: 82,
    lastGrade: 5,
    streak: 4,
    stars: 285,
    level: { name: 'Исследователь', color: '#0D9488', bg: '#F0FDFA', nextAt: 25, pct: 72 },
    badges: [
      { label: 'Первый урок', icon: Target, color: '#059669', bg: '#ECFDF5' },
      { label: '10 уроков',   icon: Zap,    color: '#2563EB', bg: '#EFF6FF' },
      { label: 'Серия 4',     icon: Flame,  color: '#EA580C', bg: '#FFF7ED' },
    ],
    nextLesson: { date: 'ср, 10 апр., 16:00', title: 'Colors & Animals' },
  },
  {
    id: '2',
    name: 'Дмитрий Иванов',
    tag: 'Pre-Intermediate',
    age: 10,
    initials: 'ДИ',
    attended: 34,
    total: 40,
    rate: 85,
    lastGrade: 4,
    streak: 7,
    stars: 460,
    level: { name: 'Продвинутый', color: '#8B5CF6', bg: '#F5F3FF', nextAt: 50, pct: 68 },
    badges: [
      { label: '25 уроков',       icon: Trophy, color: '#7C3AED', bg: '#F5F3FF' },
      { label: 'Серия 7',         icon: Flame,  color: '#EA580C', bg: '#FFF7ED' },
      { label: '3 пятёрки подряд', icon: Star,   color: '#DB2777', bg: '#FDF2F8' },
    ],
    nextLesson: { date: 'чт, 11 апр., 15:00', title: 'Travel & Transport' },
  },
]

const LIBRARY_COUNT = 12

/* ── SVG Progress Ring ─────────────────────────────────────────── */

const RADIUS = 42
const STROKE = 4
const CIRC = 2 * Math.PI * RADIUS

function ProgressRing({ percent, color }: { percent: number; color: string }) {
  const offset = CIRC * (1 - Math.min(percent, 100) / 100)
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" className="absolute inset-0" style={{ transform: 'rotate(-90deg)' }}>
      <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="#e0e7ff" strokeWidth={STROKE} />
      <circle cx="50" cy="50" r={RADIUS} fill="none" stroke={color} strokeWidth={STROKE}
        strokeDasharray={`${CIRC}`} strokeDashoffset={`${offset}`} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1)' }} />
    </svg>
  )
}

/* ── Nav items ─────────────────────────────────────────────────── */

const NAV = [
  { href: '#', label: 'Главная',      mobile: 'Главная',    icon: Home },
  { href: '#', label: 'Расписание',   mobile: 'Расписание', icon: Calendar },
  { href: '#', label: 'Успеваемость', mobile: 'Оценки',     icon: Star },
  { href: '#', label: 'Посещаемость', mobile: 'Посещения',  icon: CheckSquare },
  { href: '#', label: 'Звёзды',       mobile: 'Звёзды',     icon: Sparkles },
  { href: '#', label: 'Литература',   mobile: 'Книги',      icon: Library },
]

/* ── Page ──────────────────────────────────────────────────────── */

export default function ParentPreview() {
  const [activeNav, setActiveNav] = useState(0)
  const [showMore, setShowMore] = useState(false)

  const totalStars = STUDENTS.reduce((s, st) => s + st.stars, 0)
  const avgRate = Math.round(STUDENTS.reduce((s, st) => s + st.rate, 0) / STUDENTS.length)

  return (
    <div data-parent-theme="light" className="min-h-screen" style={{ background: 'var(--par-bg-base)' }}>

      {/* ── Preview banner ── */}
      <div className="sticky top-0 z-[60] text-center py-2 px-4 text-xs font-bold text-white"
        style={{ background: 'linear-gradient(90deg, #4F46E5, #F97316)' }}>
        Режим предпросмотра — макет с тестовыми данными
      </div>

      {/* ── Desktop top nav ── */}
      <nav className="sticky top-[32px] z-50 hidden md:flex items-center gap-1 px-4 h-[60px]"
        style={{
          background: 'var(--par-nav-bg)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--par-nav-border)',
        }}>
        <div className="flex items-center gap-2.5 mr-5 shrink-0">
          <Image src="/logo.png" width={30} height={30} alt="Гармония" className="rounded-lg" />
          <div>
            <span className="text-[17px] font-extrabold tracking-tight" style={{ color: 'var(--par-accent)' }}>
              Гармония
            </span>
            <p className="text-[9px] font-medium -mt-0.5" style={{ color: 'var(--par-text-muted)' }}>
              Кабинет родителя
            </p>
          </div>
        </div>

        <div className="flex items-center gap-0.5 overflow-x-auto flex-1">
          {NAV.map((item, i) => {
            const active = activeNav === i
            const Icon = item.icon
            return (
              <button key={i} onClick={() => setActiveNav(i)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer"
                style={active
                  ? { background: 'var(--par-nav-active-bg)', color: 'var(--par-nav-active)', fontWeight: 600 }
                  : { color: 'var(--par-nav-item)', background: 'transparent', border: 'none' }
                }>
                <Icon size={14} className="shrink-0" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2 ml-2 shrink-0">
          <div className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ background: 'linear-gradient(135deg, #4F46E5, #F97316)', boxShadow: '0 2px 12px rgba(79,70,229,0.3)' }}>
            А
          </div>
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer"
            style={{ color: 'var(--par-text-muted)' }}>
            <LogOut size={14} />
          </button>
        </div>
      </nav>

      {/* ── Content ── */}
      <main className="p-4 md:p-8 max-w-3xl mx-auto pb-24 md:pb-8">

        {/* Welcome card */}
        <div className="rounded-2xl px-6 py-5 mb-6 parent-card-in"
          style={{
            background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 50%, #FFF7ED 100%)',
            border: '1px solid rgba(79,70,229,0.12)',
            boxShadow: '0 4px 24px rgba(79,70,229,0.08)',
          }}>
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-extrabold" style={{ color: 'var(--par-text-primary)' }}>
                Привет, <span style={{ color: 'var(--par-accent)' }}>{PARENT.name}</span>
              </h1>
              <p className="text-sm mt-0.5" style={{ color: 'var(--par-text-muted)' }}>
                Личный кабинет клуба «Гармония»
              </p>
            </div>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            {
              label: 'Всего звёзд', value: totalStars, icon: Sparkles,
              gradient: 'linear-gradient(90deg, #F97316, #FB923C)',
              iconBg: '#FFF7ED', iconColor: '#F97316',
              glow: 'rgba(249,115,22,0.15)',
            },
            {
              label: 'Посещаемость', value: `${avgRate}%`, icon: CheckSquare,
              gradient: 'linear-gradient(90deg, #4F46E5, #818CF8)',
              iconBg: '#EEF2FF', iconColor: '#4F46E5',
              glow: 'rgba(79,70,229,0.15)',
            },
            {
              label: 'Ближ. урок', value: '10 апр', icon: Calendar,
              gradient: 'linear-gradient(90deg, #0D9488, #14B8A6)',
              iconBg: '#F0FDFA', iconColor: '#0D9488',
              glow: 'rgba(13,148,136,0.15)',
            },
          ].map((kpi, i) => {
            const Icon = kpi.icon
            return (
              <div key={i}
                className={`parent-card-in parent-card-hover rounded-2xl p-4 relative overflow-hidden cursor-default parent-delay-${i + 1}`}
                style={{
                  background: 'var(--par-bg-card)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid var(--par-border-card)',
                  boxShadow: 'var(--par-shadow-card)',
                }}>
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: kpi.gradient }} />
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: kpi.iconBg }}>
                  <Icon size={17} style={{ color: kpi.iconColor }} />
                </div>
                <p className="text-2xl font-black leading-none mb-1" style={{ color: 'var(--par-text-primary)' }}>
                  {kpi.value}
                </p>
                <p className="text-[11px] font-medium" style={{ color: 'var(--par-text-muted)' }}>{kpi.label}</p>
              </div>
            )
          })}
        </div>

        {/* Student cards */}
        <div className="space-y-5">
          {STUDENTS.map((student, idx) => (
            <div key={student.id}
              className={`parent-card-in parent-card-hover rounded-3xl overflow-hidden parent-delay-${idx + 3}`}
              style={{
                background: 'var(--par-bg-card)',
                backdropFilter: 'blur(12px)',
                boxShadow: 'var(--par-shadow-card)',
                border: '1.5px solid var(--par-border-card)',
              }}>

              {/* Profile header */}
              <div className="px-6 py-5" style={{ background: 'linear-gradient(120deg, #EEF2FF 0%, #E0E7FF 50%, #FFF7ED 100%)' }}>
                <div className="flex items-center gap-5">
                  {/* Avatar + progress ring */}
                  <div className="relative flex-shrink-0" style={{ width: 100, height: 100 }}>
                    <ProgressRing percent={student.rate} color="var(--par-accent)" />
                    <div className="absolute inset-[8px] rounded-full flex items-center justify-center text-white text-lg font-extrabold"
                      style={{
                        background: 'linear-gradient(135deg, #4F46E5, #818CF8)',
                        boxShadow: '0 4px 16px rgba(79,70,229,0.3)',
                      }}>
                      {student.initials}
                    </div>
                    {/* streak badge */}
                    {student.streak >= 2 && (
                      <div className="absolute -bottom-1 -right-1 flex items-center justify-center rounded-full text-white text-[10px] font-extrabold border-2 z-10"
                        style={{
                          width: 26, height: 26,
                          background: 'linear-gradient(135deg, #F97316, #EF4444)',
                          borderColor: '#EEF2FF',
                        }}>
                        {student.streak}
                      </div>
                    )}
                  </div>

                  {/* Name + info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xl font-extrabold truncate" style={{ color: 'var(--par-text-primary)' }}>
                      {student.name}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                        style={{ background: 'rgba(79,70,229,0.1)', color: '#4F46E5' }}>
                        {student.tag}
                      </span>
                      <span className="text-xs font-medium" style={{ color: 'var(--par-text-muted)' }}>
                        {student.age} лет
                      </span>
                    </div>
                    {student.streak >= 2 && (
                      <p className="text-xs font-semibold mt-1.5 flex items-center gap-1" style={{ color: '#F97316' }}>
                        <Flame size={12} />
                        Серия {student.streak} {student.streak < 5 ? 'урока' : 'уроков'} подряд!
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Level + progress bar */}
              <div className="px-6 py-4" style={{ background: student.level.bg, borderTop: '1px solid rgba(79,70,229,0.06)' }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="px-3 py-0.5 rounded-full text-xs font-extrabold shrink-0"
                      style={{ background: student.level.color, color: '#fff' }}>
                      {student.level.name}
                    </span>
                    <span className="text-xs truncate" style={{ color: 'var(--par-text-muted)' }}>
                      ещё {student.level.nextAt - student.attended} ур.
                    </span>
                  </div>
                  <span className="text-xs font-bold ml-2 shrink-0" style={{ color: student.level.color }}>
                    {student.attended}/{student.level.nextAt}
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(79,70,229,0.08)' }}>
                  <div className="h-full rounded-full" style={{
                    width: `${student.level.pct}%`,
                    background: `linear-gradient(90deg, ${student.level.color}99, ${student.level.color})`,
                    transition: 'width 1s cubic-bezier(0.16,1,0.3,1)',
                  }} />
                </div>

                {/* Badges */}
                {student.badges.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {student.badges.map(badge => {
                      const BadgeIcon = badge.icon
                      return (
                        <span key={badge.label}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border"
                          style={{ background: badge.bg, color: badge.color, borderColor: badge.color + '33' }}>
                          <BadgeIcon size={11} />
                          {badge.label}
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3" style={{ borderTop: '1px solid rgba(79,70,229,0.06)' }}>
                {[
                  { label: 'Посещ.',  value: `${student.rate}%`, color: '#4F46E5', bar: 'linear-gradient(90deg,#818CF8,#4F46E5)' },
                  { label: 'Уроков',  value: student.total,      color: 'var(--par-text-primary)', bar: 'linear-gradient(90deg,#93c5fd,#3b82f6)' },
                  { label: 'Оценка',  value: student.lastGrade,  color: '#F97316', bar: 'linear-gradient(90deg,#fcd34d,#f59e0b)' },
                ].map((stat, si) => (
                  <div key={stat.label} className="relative px-2 py-3 text-center overflow-hidden"
                    style={{ borderLeft: si > 0 ? '1px solid rgba(79,70,229,0.06)' : undefined }}>
                    <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: stat.bar }} />
                    <p className="text-[10px] mb-0.5 leading-tight" style={{ color: 'var(--par-text-muted)' }}>{stat.label}</p>
                    <p className="text-base font-black" style={{ color: stat.color }}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Next lesson */}
              <div className="px-6 py-3 flex items-center gap-3" style={{ borderTop: '1px solid rgba(79,70,229,0.06)' }}>
                <Calendar size={15} style={{ color: 'var(--par-accent)' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs" style={{ color: 'var(--par-text-muted)' }}>Ближайший урок</p>
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--par-text-primary)' }}>
                    {student.nextLesson.date} — {student.nextLesson.title}
                  </p>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--par-text-muted)' }} />
              </div>

              {/* Quick links */}
              <div className="grid grid-cols-3" style={{ borderTop: '1px solid rgba(79,70,229,0.06)' }}>
                {[
                  { label: 'Расписание', icon: Calendar },
                  { label: 'Оценки',     icon: Star },
                  { label: 'Посещения',  icon: CheckSquare },
                ].map((link, li) => {
                  const LinkIcon = link.icon
                  return (
                    <button key={link.label}
                      className="parent-quick-link flex flex-col items-center gap-1.5 py-4 text-xs font-medium min-h-[44px] cursor-pointer"
                      style={{ color: 'var(--par-text-secondary)', background: 'transparent', border: 'none', borderLeft: li > 0 ? '1px solid rgba(79,70,229,0.06)' : undefined }}>
                      <LinkIcon size={18} />
                      {link.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Teaser cards: Stars + Library */}
        <div className="grid grid-cols-2 gap-3 mt-5 parent-card-in parent-delay-5">
          {/* Stars card */}
          <div className="parent-card-hover rounded-2xl p-4 h-full flex flex-col gap-3 cursor-pointer"
            style={{
              background: 'var(--par-bg-card)',
              backdropFilter: 'blur(12px)',
              border: '1.5px solid var(--par-border-card)',
              boxShadow: 'var(--par-shadow-card)',
            }}>
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)' }}>
                <Sparkles size={17} style={{ color: '#d97706' }} />
              </div>
              <ChevronRight size={14} style={{ color: 'var(--par-text-muted)' }} />
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5">
              {STUDENTS.map(st => (
                <div key={st.id} className="flex items-baseline gap-1">
                  <span className="text-2xl font-black leading-none" style={{ color: '#d97706' }}>{st.stars}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-bold leading-tight" style={{ color: 'var(--par-text-primary)' }}>Звёздная карта</p>
              <p className="text-[10px] mt-0.5 leading-tight" style={{ color: 'var(--par-text-muted)' }}>Рейтинг среди учеников</p>
            </div>
          </div>

          {/* Library card */}
          <div className="parent-card-hover rounded-2xl p-4 h-full flex flex-col gap-3 cursor-pointer"
            style={{
              background: 'var(--par-bg-card)',
              backdropFilter: 'blur(12px)',
              border: '1.5px solid var(--par-border-card)',
              boxShadow: 'var(--par-shadow-card)',
            }}>
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg, #E0E7FF, #C7D2FE)' }}>
                <BookOpen size={17} style={{ color: '#4F46E5' }} />
              </div>
              <ChevronRight size={14} style={{ color: 'var(--par-text-muted)' }} />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black leading-none" style={{ color: 'var(--par-accent)' }}>{LIBRARY_COUNT}</span>
              <span className="text-[10px]" style={{ color: 'var(--par-text-muted)' }}>файлов</span>
            </div>
            <div>
              <p className="text-xs font-bold leading-tight" style={{ color: 'var(--par-text-primary)' }}>Литература</p>
              <p className="text-[10px] mt-0.5 leading-tight" style={{ color: 'var(--par-text-muted)' }}>Учебные материалы</p>
            </div>
          </div>
        </div>
      </main>

      {/* ── Mobile bottom nav ── */}
      {showMore && (
        <>
          <div className="fixed inset-0 z-40 md:hidden" style={{ background: 'rgba(0,0,0,0.35)' }}
            onClick={() => setShowMore(false)} />
          <div className="fixed bottom-[60px] left-0 right-0 z-50 md:hidden rounded-t-2xl overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.98)',
              borderTop: '1px solid rgba(79,70,229,0.12)',
              backdropFilter: 'blur(20px)',
            }}>
            <div className="px-4 pt-3 pb-2">
              <div className="w-8 h-1 rounded-full mx-auto mb-3" style={{ background: 'rgba(79,70,229,0.2)' }} />
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--par-text-muted)' }}>Разделы</p>
                <button onClick={() => setShowMore(false)} className="cursor-pointer" style={{ color: 'var(--par-text-muted)', background: 'none', border: 'none' }}>
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1 px-3 pb-4">
              {[
                { label: 'Посещения', icon: CheckSquare },
                { label: 'Литература', icon: Library },
              ].map(item => {
                const Icon = item.icon
                return (
                  <button key={item.label}
                    className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl transition-all cursor-pointer"
                    style={{ background: 'transparent', color: 'var(--par-nav-item)', border: 'none' }}>
                    <Icon size={22} />
                    <span style={{ fontSize: 11, fontWeight: 500, lineHeight: 1 }}>{item.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden flex items-center"
        style={{
          height: 'calc(60px + env(safe-area-inset-bottom, 0px))',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(79,70,229,0.10)',
          boxShadow: '0 -4px 20px rgba(79,70,229,0.08)',
        }}>
        {[
          { label: 'Главная',  icon: Home,       isFab: false },
          { label: 'Оценки',   icon: Star,       isFab: false },
          { label: '',          icon: Calendar,   isFab: true  },
          { label: 'Звёзды',   icon: Sparkles,   isFab: false },
          { label: 'Ещё',      icon: MoreHorizontal, isFab: false, isMore: true },
        ].map((tab, i) => {
          const Icon = tab.icon

          if (tab.isFab) {
            return (
              <div key="fab" className="flex-1 flex items-center justify-center">
                <button className="flex items-center justify-center rounded-full text-white cursor-pointer"
                  style={{
                    width: 48, height: 48, border: 'none',
                    background: 'linear-gradient(135deg, #4F46E5, #F97316)',
                    boxShadow: '0 4px 20px rgba(79,70,229,0.4)',
                    transform: 'translateY(-10px)',
                  }}>
                  <Icon size={22} />
                </button>
              </div>
            )
          }

          const active = i === 0 && !showMore
          return (
            <button key={i}
              onClick={() => { if ('isMore' in tab && tab.isMore) setShowMore(v => !v) }}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 relative cursor-pointer"
              style={{
                minHeight: 44, border: 'none', background: 'transparent',
                color: active || (('isMore' in tab && tab.isMore) && showMore)
                  ? 'var(--par-accent)' : 'var(--par-text-muted)',
              }}>
              {active && (
                <span className="absolute rounded-full"
                  style={{ width: 4, height: 4, background: 'var(--par-accent)', top: 4, left: '50%', transform: 'translateX(-50%)' }} />
              )}
              <Icon size={20} />
              <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, lineHeight: 1 }}>{tab.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
