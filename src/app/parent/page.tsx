import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Calendar, Star, CheckSquare } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import StudentPhotoUpload from '../../components/StudentPhotoUpload'

function calcStars(lessons: Array<{ attended: boolean; grade: number | null }>): number {
  return lessons.reduce((sum, l) => {
    let pts = 0
    if (l.attended) pts += 10
    if (l.grade === 5) pts += 15
    else if (l.grade === 4) pts += 10
    else if (l.grade === 3) pts += 5
    else if (l.grade === 2) pts += 2
    return sum + pts
  }, 0)
}

// ── helpers ────────────────────────────────────────────────────────────────

type LessonEntry = { lesson: { date: Date }; attended: boolean; grade: number | null }

function getStreak(lessonStudents: LessonEntry[], now: Date): number {
  const past = [...lessonStudents]
    .filter(l => l.lesson.date <= now)
    .sort((a, b) => b.lesson.date.getTime() - a.lesson.date.getTime())
  let streak = 0
  for (const ls of past) {
    if (ls.attended) streak++
    else break
  }
  return streak
}

type Level = { name: string; color: string; bg: string; nextAt: number }

function getLevel(attended: number): Level {
  if (attended >= 50) return { name: 'Мастер',        color: '#F97316', bg: '#FFF7ED', nextAt: 50  }
  if (attended >= 25) return { name: 'Продвинутый',   color: '#8B5CF6', bg: '#F5F3FF', nextAt: 50  }
  if (attended >= 10) return { name: 'Исследователь', color: '#0D9488', bg: '#F0FDFA', nextAt: 25  }
  return                      { name: 'Начинающий',   color: '#3B82F6', bg: '#EFF6FF', nextAt: 10  }
}

type Badge = { label: string; icon: string; color: string; bg: string }

function getBadges(attended: number, streak: number, grades: number[]): Badge[] {
  const badges: Badge[] = []

  if (attended >= 1)  badges.push({ label: 'Первый урок',   icon: '🎯', color: '#059669', bg: '#ECFDF5' })
  if (attended >= 10) badges.push({ label: '10 уроков',      icon: '🔟', color: '#2563EB', bg: '#EFF6FF' })
  if (attended >= 25) badges.push({ label: '25 уроков',      icon: '🎖', color: '#7C3AED', bg: '#F5F3FF' })
  if (attended >= 50) badges.push({ label: '50 уроков',      icon: '🏆', color: '#D97706', bg: '#FFFBEB' })

  if (streak >= 3)  badges.push({ label: `Серия ${streak}`, icon: '🔥', color: '#EA580C', bg: '#FFF7ED' })

  const hasGrades = grades.length >= 3
  if (hasGrades) {
    const avg = grades.reduce((a, b) => a + b, 0) / grades.length
    if (avg >= 4.7) badges.push({ label: 'Отличник',          icon: '⭐', color: '#CA8A04', bg: '#FEFCE8' })
  }

  // 3 пятёрки подряд
  let consecutiveFives = 0
  for (const g of grades) {
    if (g === 5) consecutiveFives++
    else consecutiveFives = 0
    if (consecutiveFives >= 3) {
      badges.push({ label: '3 пятёрки подряд', icon: '💫', color: '#DB2777', bg: '#FDF2F8' })
      break
    }
  }

  return badges
}

// ── SVG progress ring ──────────────────────────────────────────────────────

// RADIUS=42, strokeWidth=4:
//   ring inner edge = 42-2 = 40px from center (10px from SVG edge)
//   ring outer edge = 42+2 = 44px from center (6px from SVG edge)
//   avatar with inset-[12px] → outer edge at 50-12=38px from center < 40 ✓
const RADIUS = 42
const STROKE = 4
const CIRC = 2 * Math.PI * RADIUS // ≈ 263.9

function ProgressRingPath({ percent, color }: { percent: number; color: string }) {
  const offset = CIRC * (1 - Math.min(percent, 100) / 100)
  return (
    <svg
      width="100" height="100"
      viewBox="0 0 100 100"
      className="absolute inset-0"
      style={{ transform: 'rotate(-90deg)' }}
    >
      {/* track */}
      <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="#e5e7eb" strokeWidth={STROKE} />
      {/* progress arc */}
      <circle
        cx="50" cy="50" r={RADIUS}
        fill="none"
        stroke={color}
        strokeWidth={STROKE}
        strokeDasharray={`${CIRC}`}
        strokeDashoffset={`${offset}`}
        strokeLinecap="round"
      />
    </svg>
  )
}

// ── page ───────────────────────────────────────────────────────────────────

export default async function ParentDashboard() {
  const session = await auth()
  if (!session || session.user.role !== 'PARENT') redirect('/parent/login')

  const parent = await prisma.parent.findUnique({
    where: { userId: session.user.id },
    include: {
      students: {
        include: {
          student: {
            include: {
              lessons: {
                include: { lesson: true },
                orderBy: { lesson: { date: 'desc' } },
                // fetch enough for streak + badge computation
                take: 200,
              },
            },
          },
        },
      },
    },
  })

  if (!parent) redirect('/parent/login')

  const now = new Date()

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">

      {/* Welcome header */}
      <div
        className="rounded-2xl px-6 py-5 mb-8 animate-fade-slide-up"
        style={{
          background: 'linear-gradient(135deg, #ecfdf5 0%, #eff6ff 100%)',
          border: '1px solid #d1fae5',
          boxShadow: '0 4px 20px rgba(5,150,105,0.08)',
        }}
      >
        <div className="flex items-center gap-4">
          <Image src="/logo.svg" width={44} height={44} alt="Гармония" />
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">
              Привет, <span style={{ color: '#059669' }}>{parent.name}</span> 👋
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">Личный кабинет клуба «Гармония»</p>
          </div>
        </div>
      </div>

      {/* ── Star miniature teaser ── */}
      {parent.students.length > 0 && (
        <Link href="/parent/stars" className="block mb-5 animate-fade-slide-up">
          <div
            className="rounded-2xl overflow-hidden flex items-stretch transition-shadow hover:shadow-md active:scale-[0.99]"
            style={{
              background: '#fff',
              border: '1.5px solid #d1fae5',
              boxShadow: '0 4px 20px rgba(5,150,105,0.08)',
            }}
          >
            {/* Space portal — left accent panel */}
            <div
              className="relative flex items-center justify-center flex-shrink-0"
              style={{
                width: 76,
                background: 'linear-gradient(160deg, #1e1b4b 0%, #2d1b69 60%, #0f172a 100%)',
              }}
            >
              {/* tiny star dots */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
                {[5,18,32,48,62,74,88,95,12,55,78,38,65,25,42,85].map((x, i) => (
                  <circle key={i} cx={`${x}%`} cy={`${[15,65,30,80,10,50,25,70,45,5,85,55,35,90,20,60][i]}%`}
                    r={i % 3 === 0 ? 0.9 : 0.5} fill="white" opacity={0.15 + (i % 4) * 0.07} />
                ))}
              </svg>
              {/* 3 mini planets */}
              <div className="relative z-10" style={{ width: 40, height: 40 }}>
                <div className="absolute rounded-full"
                  style={{ top: 0, left: 8, width: 20, height: 20, background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', boxShadow: '0 0 8px rgba(139,92,246,0.6)' }} />
                <div className="absolute rounded-full"
                  style={{ bottom: 0, right: 0, width: 15, height: 15, background: 'linear-gradient(135deg, #F97316, #EF4444)', boxShadow: '0 0 6px rgba(249,115,22,0.5)' }} />
                <div className="absolute rounded-full"
                  style={{ top: 14, left: 0, width: 11, height: 11, background: 'linear-gradient(135deg, #06B6D4, #3B82F6)', boxShadow: '0 0 5px rgba(6,182,212,0.4)' }} />
              </div>
            </div>

            {/* Main info */}
            <div className="flex-1 px-3 py-3.5 min-w-0">
              <div className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B" aria-hidden="true">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span className="font-extrabold text-gray-800 whitespace-nowrap" style={{ fontSize: 13 }}>Звёздная карта</span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5 leading-tight">Посмотри место среди учеников</p>
            </div>

            {/* Star counts per child */}
            <div className="flex items-center gap-2 pr-4 flex-shrink-0">
              {parent.students.map(({ student }) => {
                const stars = calcStars(student.lessons)
                return (
                  <div key={student.id} className="flex flex-col items-center">
                    <span className="font-black text-xl leading-none" style={{ color: '#D97706' }}>{stars}</span>
                    <span className="text-[10px] text-gray-400 mt-0.5 max-w-[44px] truncate">
                      {student.name.split(' ')[0]}
                    </span>
                  </div>
                )
              })}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#d1fae5" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"
                style={{ color: '#9ca3af' }}>
                <path d="M9 18l6-6-6-6" stroke="#9ca3af"/>
              </svg>
            </div>
          </div>
        </Link>
      )}

      <div className="space-y-5">
        {parent.students.map(({ student }, idx) => {
          const allPast    = student.lessons.filter(l => l.lesson.date <= now)
          const nextLesson = [...student.lessons].reverse().find(l => l.lesson.date > now)

          const attended = allPast.filter(l => l.attended).length
          const total    = allPast.length
          const rate     = total > 0 ? Math.round((attended / total) * 100) : 0
          const lastGrade = allPast.find(l => l.grade != null)

          // for badges: grades chronological order (asc)
          const gradesAsc = [...allPast]
            .sort((a, b) => a.lesson.date.getTime() - b.lesson.date.getTime())
            .map(l => l.grade)
            .filter((g): g is number => g != null)

          const streak = getStreak(student.lessons as LessonEntry[], now)
          const level  = getLevel(attended)
          const badges = getBadges(attended, streak, gradesAsc)

          const initials = student.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
          const levelPct = attended >= level.nextAt
            ? 100
            : Math.round((attended / level.nextAt) * 100)

          return (
            <div
              key={student.id}
              className="student-card rounded-3xl overflow-hidden animate-fade-slide-up"
              style={{
                background: '#fff',
                boxShadow: '0 4px 28px rgba(5,150,105,0.09), 0 1px 4px rgba(0,0,0,0.04)',
                border: '1.5px solid #d1fae5',
                animationDelay: `${idx * 120}ms`,
              }}
            >

              {/* ── VARIANT A: Profile header with progress ring ── */}
              <div
                className="px-6 py-5"
                style={{ background: 'linear-gradient(120deg, #ecfdf5 0%, #eff6ff 100%)' }}
              >
                <div className="flex items-center gap-5">

                  {/* Avatar + ring + upload */}
                  <div className="relative flex-shrink-0" style={{ width: 100, height: 100 }}>
                    <ProgressRingPath percent={rate} color="#059669" />
                    <StudentPhotoUpload
                      studentId={student.id}
                      photoUrl={student.photoUrl ?? null}
                      initials={initials}
                    />
                    {/* streak fire badge */}
                    {streak >= 2 && (
                      <div
                        className="absolute -bottom-1 -right-1 flex items-center justify-center rounded-full text-white text-[10px] font-extrabold border-2 border-white z-10"
                        style={{
                          width: 26, height: 26,
                          background: 'linear-gradient(135deg, #F97316, #EF4444)',
                        }}
                        title={`Серия ${streak} уроков подряд`}
                      >
                        {streak}
                      </div>
                    )}
                  </div>

                  {/* Name + info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xl font-extrabold text-gray-900 truncate">{student.name}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {student.tag && (
                        <span
                          className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                          style={{ background: '#d1fae5', color: '#065f46' }}
                        >
                          {student.tag}
                        </span>
                      )}
                      {student.age && (
                        <span className="text-xs text-gray-400 font-medium">{student.age} лет</span>
                      )}
                    </div>

                    {/* Streak info */}
                    {streak >= 2 && (
                      <p className="text-xs text-orange-500 font-semibold mt-1.5 flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#F97316"><path d="M17.66 11.2c-.23-.3-.51-.56-.77-.82-.67-.6-1.43-1.03-2.07-1.66C13.33 7.26 13 4.85 13.95 3c-.95.23-1.78.75-2.49 1.32C8.86 6.23 8 9.55 8.9 12.39c.07.26.07.54-.1.75-.22.3-.6.4-.92.31-.34-.1-.56-.4-.62-.73C6.83 11.6 7 9.82 7.89 8c-1.34.93-2.23 2.47-2.71 3.93C4.46 13.5 4.5 15.07 4.97 16.5c.56 1.56 1.67 2.88 3.07 3.72c1.46.89 3.26 1.15 4.92.87C14.93 20.7 17 18.6 17.66 16.55c.64-1.95.5-4.22-.69-5.96z"/></svg>
                        Серия {streak} {streak === 1 ? 'урок' : streak < 5 ? 'урока' : 'уроков'} подряд!
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* ── VARIANT B: Level + progress bar ── */}
              <div
                className="px-6 py-4 border-t border-gray-100"
                style={{ background: level.bg }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span
                      className="px-3 py-0.5 rounded-full text-xs font-extrabold shrink-0"
                      style={{ background: level.color, color: '#fff' }}
                    >
                      {level.name}
                    </span>
                    <span className="text-xs text-gray-500 truncate">
                      {attended >= level.nextAt
                        ? 'Макс. уровень!'
                        : `ещё ${level.nextAt - attended} ур.`}
                    </span>
                  </div>
                  <span className="text-xs font-bold ml-2 shrink-0" style={{ color: level.color }}>
                    {attended}/{level.nextAt}
                  </span>
                </div>
                {/* progress bar */}
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${levelPct}%`,
                      background: `linear-gradient(90deg, ${level.color}99, ${level.color})`,
                    }}
                  />
                </div>

                {/* Achievement badges */}
                {badges.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {badges.map(badge => (
                      <span
                        key={badge.label}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border"
                        style={{
                          background: badge.bg,
                          color: badge.color,
                          borderColor: badge.color + '33',
                        }}
                        title={badge.label}
                      >
                        {badge.icon} {badge.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 divide-x divide-gray-100 border-t border-gray-100">
                {[
                  { label: 'Посещ.',  value: rate > 0 ? `${rate}%` : '—', color: '#059669', bar: 'linear-gradient(90deg,#34d399,#059669)' },
                  { label: 'Уроков', value: total,                        color: '#374151', bar: 'linear-gradient(90deg,#93c5fd,#3b82f6)' },
                  { label: 'Оценка', value: lastGrade?.grade ?? '—',      color: lastGrade ? '#3b82f6' : '#9ca3af', bar: 'linear-gradient(90deg,#fcd34d,#f59e0b)' },
                ].map(({ label, value, color, bar }) => (
                  <div key={label} className="relative px-2 py-3 text-center overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: bar }} />
                    <p className="text-[10px] text-gray-400 mb-0.5 leading-tight">{label}</p>
                    <p className="text-base font-black" style={{ color }}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Next lesson */}
              {nextLesson && (
                <div className="px-6 py-3 flex items-center gap-3 border-t border-gray-100">
                  <Calendar size={15} style={{ color: '#059669' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400">Ближайший урок</p>
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {new Date(nextLesson.lesson.date).toLocaleDateString('ru-RU', {
                        weekday: 'short', day: 'numeric', month: 'short',
                        hour: '2-digit', minute: '2-digit',
                      })}
                      {nextLesson.lesson.title && ` — ${nextLesson.lesson.title}`}
                    </p>
                  </div>
                </div>
              )}

              {/* Quick links */}
              <div className="grid grid-cols-3 divide-x divide-gray-100 border-t border-gray-100">
                {[
                  { href: `/parent/schedule?studentId=${student.id}`,   label: 'Расписание', icon: Calendar },
                  { href: `/parent/grades?studentId=${student.id}`,     label: 'Оценки',     icon: Star },
                  { href: `/parent/attendance?studentId=${student.id}`, label: 'Посещения',  icon: CheckSquare },
                ].map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="quick-link flex flex-col items-center gap-1.5 py-4 text-xs font-medium text-gray-500 min-h-[44px] cursor-pointer"
                  >
                    <Icon size={18} />
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {parent.students.length === 0 && (
        <div className="text-center py-16 text-gray-400 animate-fade-slide-up">
          <div className="text-4xl mb-3">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="mx-auto text-gray-300" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
          </div>
          <p className="text-sm">Пока нет привязанных детей.<br/>Обратитесь к преподавателю.</p>
        </div>
      )}
    </div>
  )
}
