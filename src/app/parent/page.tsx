import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Calendar, Star, CheckSquare, Library, Sparkles, TrendingUp, Award, Flame } from 'lucide-react'
import Link from 'next/link'
import StudentPhotoUpload from '../../components/StudentPhotoUpload'
import ParentDashboardClient, { type StudentData, type ParentData } from '../../components/ParentDashboardClient'

// ── helpers ────────────────────────────────────────────────────────────────

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
  if (streak >= 3)    badges.push({ label: `Серия ${streak}`, icon: '🔥', color: '#EA580C', bg: '#FFF7ED' })
  const hasGrades = grades.length >= 3
  if (hasGrades) {
    const avg = grades.reduce((a, b) => a + b, 0) / grades.length
    if (avg >= 4.7) badges.push({ label: 'Отличник', icon: '⭐', color: '#CA8A04', bg: '#FEFCE8' })
  }
  let fives = 0
  for (const g of grades) {
    if (g === 5) fives++
    else fives = 0
    if (fives >= 3) { badges.push({ label: '3 пятёрки подряд', icon: '💫', color: '#DB2777', bg: '#FDF2F8' }); break }
  }
  return badges
}

const RADIUS = 42, STROKE = 4, CIRC = 2 * Math.PI * RADIUS

function ProgressRingPath({ percent, color }: { percent: number; color: string }) {
  const offset = CIRC * (1 - Math.min(percent, 100) / 100)
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" className="absolute inset-0" style={{ transform: 'rotate(-90deg)' }}>
      <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="rgba(79,70,229,0.1)" strokeWidth={STROKE} />
      <circle cx="50" cy="50" r={RADIUS} fill="none" stroke={color} strokeWidth={STROKE}
        strokeDasharray={`${CIRC}`} strokeDashoffset={`${offset}`} strokeLinecap="round" />
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
                take: 200,
              },
            },
          },
        },
      },
    },
  })

  if (!parent) redirect('/parent/login')

  const studentTags = [...new Set(parent.students.map(ps => ps.student.tag))]
  const [libraryCount, libraryRecent] = await Promise.all([
    prisma.libraryFile.count({
      where: { OR: [{ targetTag: 'Все' }, ...(studentTags.length ? [{ targetTag: { in: studentTags } }] : [])] },
    }),
    prisma.libraryFile.findMany({
      where: { OR: [{ targetTag: 'Все' }, ...(studentTags.length ? [{ targetTag: { in: studentTags } }] : [])] },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: { title: true, category: true },
    }),
  ])

  const now = new Date()

  const studentsData: StudentData[] = parent.students.map(({ student }) => {
    const allPast    = student.lessons.filter(l => l.lesson.date <= now)
    const nextLesson = [...student.lessons].reverse().find(l => l.lesson.date > now)
    const attended   = allPast.filter(l => l.attended).length
    const total      = allPast.length
    const rate       = total > 0 ? Math.round((attended / total) * 100) : 0
    const lastGrade  = allPast.find(l => l.grade != null)
    const gradesAsc  = [...allPast]
      .sort((a, b) => a.lesson.date.getTime() - b.lesson.date.getTime())
      .map(l => l.grade).filter((g): g is number => g != null)
    const streak = getStreak(student.lessons as LessonEntry[], now)
    const level  = getLevel(attended)
    const badges = getBadges(attended, streak, gradesAsc)
    const stars  = calcStars(student.lessons)
    const levelPct = attended >= level.nextAt ? 100 : Math.round((attended / level.nextAt) * 100)

    return {
      id: student.id, name: student.name, tag: student.tag, age: student.age,
      photoUrl: student.photoUrl ?? null, attended, total, rate, streak,
      lastGrade: lastGrade?.grade ?? null,
      levelName: level.name, levelColor: level.color, levelBg: level.bg,
      levelNextAt: level.nextAt, levelPct, badges, stars,
      nextLesson: nextLesson ? {
        date: new Date(nextLesson.lesson.date).toLocaleDateString('ru-RU', {
          weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
        }),
        title: nextLesson.lesson.title ?? null,
      } : null,
      gradesAsc,
    }
  })

  const parentData: ParentData = {
    name: parent.name, students: studentsData, libraryCount, libraryRecent,
  }

  const studentCards = studentsData.length > 0
    ? studentsData.map(s => <StudentDashboard key={s.id} student={s} />)
    : [
        <div key="empty" className="text-center py-20" style={{ color: 'var(--par-text-muted)' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="mx-auto mb-3" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
          <p className="text-sm">Пока нет привязанных детей.<br/>Обратитесь к преподавателю.</p>
        </div>,
      ]

  const footer = (studentsData.length > 0 || libraryCount > 0) ? (
    <div className={`grid gap-3 mt-4 ${studentsData.length > 0 && libraryCount > 0 ? 'grid-cols-2' : 'grid-cols-1'} lg:grid-cols-4`}>
      {studentsData.length > 0 && (
        <Link href="/parent/stars" className="block group">
          <div className="parent-glass rounded-2xl p-4 flex items-center gap-3 active:scale-[0.98]">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(245,158,11,0.15))' }}>
              <Sparkles size={18} style={{ color: '#d97706' }} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold leading-tight" style={{ color: 'var(--par-text-primary)' }}>Звёздная карта</p>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--par-text-muted)' }}>
                {studentsData.map(s => `${s.stars}⭐`).join(' · ')}
              </p>
            </div>
          </div>
        </Link>
      )}
      {libraryCount > 0 && (
        <Link href="/parent/library" className="block group">
          <div className="parent-glass rounded-2xl p-4 flex items-center gap-3 active:scale-[0.98]">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, rgba(79,70,229,0.15), rgba(129,140,248,0.1))' }}>
              <Library size={18} style={{ color: 'var(--par-accent)' }} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold leading-tight" style={{ color: 'var(--par-text-primary)' }}>Литература</p>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--par-text-muted)' }}>
                {libraryCount} {libraryCount < 5 ? 'файла' : 'файлов'}
              </p>
            </div>
          </div>
        </Link>
      )}
    </div>
  ) : null

  return (
    <ParentDashboardClient data={parentData} studentCards={studentCards} footer={footer} />
  )
}

// ── Student Dashboard (wide layout) ───────────────────────────────────────

function StudentDashboard({ student: s }: { student: StudentData }) {
  const initials = s.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  const kpi = [
    {
      label: 'Посещаемость',
      value: s.rate > 0 ? `${s.rate}%` : '—',
      sub: `${s.attended} из ${s.total} уроков`,
      icon: TrendingUp,
      iconBg: 'rgba(79,70,229,0.1)',
      iconColor: 'var(--par-accent)',
      valueColor: 'var(--par-accent)',
    },
    {
      label: 'Последняя оценка',
      value: s.lastGrade ?? '—',
      sub: s.lastGrade
        ? s.lastGrade >= 5 ? 'Отлично!' : s.lastGrade >= 4 ? 'Хорошо' : 'Удовл.'
        : 'Нет оценки',
      icon: Star,
      iconBg: 'rgba(217,119,6,0.1)',
      iconColor: '#d97706',
      valueColor: s.lastGrade
        ? s.lastGrade >= 4 ? '#d97706' : s.lastGrade >= 3 ? '#ca8a04' : '#dc2626'
        : 'var(--par-text-muted)',
    },
    {
      label: 'Серия уроков',
      value: s.streak > 0 ? s.streak : '—',
      sub: s.streak >= 2 ? `${s.streak} подряд 🔥` : 'Нет серии',
      icon: Flame,
      iconBg: 'rgba(249,115,22,0.1)',
      iconColor: 'var(--par-cta)',
      valueColor: s.streak >= 2 ? 'var(--par-cta)' : 'var(--par-text-muted)',
    },
    {
      label: 'Звёзды',
      value: s.stars,
      sub: `Уровень: ${s.levelName}`,
      icon: Award,
      iconBg: 'rgba(139,92,246,0.1)',
      iconColor: '#8b5cf6',
      valueColor: '#8b5cf6',
    },
  ]

  return (
    <div className="space-y-4">

      {/* ── Row 1: Profile + KPI ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Profile card — col-span-1 */}
        <div className="parent-glass rounded-2xl p-5 flex flex-col gap-4">

          {/* Avatar row */}
          <div className="flex items-start gap-4">
            {/* StudentPhotoUpload owns its 100×100 container — don't wrap with sized div */}
            <div className="relative shrink-0">
              <ProgressRingPath percent={s.rate} color="var(--par-accent)" />
              <StudentPhotoUpload studentId={s.id} photoUrl={s.photoUrl} initials={initials} />
              {s.streak >= 2 && (
                <div
                  className="absolute bottom-0 right-0 flex items-center justify-center rounded-full text-white text-[9px] font-extrabold border-2 border-white z-20"
                  style={{ width: 22, height: 22, background: 'linear-gradient(135deg, var(--par-cta), #EF4444)' }}
                  title={`Серия ${s.streak} уроков подряд`}
                >
                  {s.streak}
                </div>
              )}
            </div>

            {/* Name + tags */}
            <div className="flex-1 min-w-0 pt-1">
              <p className="text-base font-extrabold leading-snug" style={{ color: 'var(--par-text-primary)' }}>
                {s.name}
              </p>
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                {s.tag && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
                    style={{ background: 'rgba(79,70,229,0.1)', color: 'var(--par-accent)' }}>
                    {s.tag}
                  </span>
                )}
                {s.age && (
                  <span className="text-[11px]" style={{ color: 'var(--par-text-muted)' }}>
                    {s.age} лет
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Level bar */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold"
                style={{ background: s.levelColor, color: '#fff' }}>
                {s.levelName}
              </span>
              <span className="text-[11px] font-semibold" style={{ color: 'var(--par-text-muted)' }}>
                {s.attended}
                <span style={{ color: 'var(--par-text-muted)' }}>/{s.levelNextAt} ур.</span>
              </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(79,70,229,0.08)' }}>
              <div className="h-full rounded-full" style={{
                width: `${s.levelPct}%`,
                background: `linear-gradient(90deg, ${s.levelColor}80, ${s.levelColor})`,
                transition: 'width 0.7s ease',
              }} />
            </div>
          </div>

          {/* Quick nav links */}
          <div className="grid grid-cols-3 gap-1 border-t pt-3" style={{ borderColor: 'var(--par-glass-border)' }}>
            {[
              { href: `/parent/schedule?studentId=${s.id}`,   label: 'Расписание', icon: Calendar },
              { href: `/parent/grades?studentId=${s.id}`,     label: 'Оценки',     icon: Star },
              { href: `/parent/attendance?studentId=${s.id}`, label: 'Посещения',  icon: CheckSquare },
            ].map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}
                className="parent-quick-link flex flex-col items-center gap-1 py-2 rounded-xl text-[10px] font-medium"
                style={{ color: 'var(--par-text-secondary)' }}>
                <Icon size={15} />
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* KPI grid — col-span-2, 2×2 */}
        <div className="md:col-span-2 grid grid-cols-2 gap-3">
          {kpi.map(({ label, value, sub, icon: Icon, iconBg, iconColor, valueColor }) => (
            <div key={label} className="parent-glass rounded-2xl p-4 flex flex-col justify-between gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: iconBg }}>
                <Icon size={16} style={{ color: iconColor }} />
              </div>
              <div>
                <p className="text-2xl font-black leading-none mb-0.5" style={{ color: valueColor }}>
                  {value}
                </p>
                <p className="text-xs font-semibold leading-tight" style={{ color: 'var(--par-text-primary)' }}>
                  {label}
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--par-text-muted)' }}>
                  {sub}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Row 2: Next lesson + badges ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Next lesson */}
        {s.nextLesson ? (
          <Link href={`/parent/schedule?studentId=${s.id}`} className="block">
            <div className="parent-glass rounded-2xl p-4 flex items-center gap-4 h-full">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(79,70,229,0.1)' }}>
                <Calendar size={18} style={{ color: 'var(--par-accent)' }} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5"
                  style={{ color: 'var(--par-text-muted)' }}>
                  Ближайший урок
                </p>
                <p className="text-sm font-bold leading-snug" style={{ color: 'var(--par-text-primary)' }}>
                  {s.nextLesson.date}
                </p>
                {s.nextLesson.title && (
                  <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--par-text-secondary)' }}>
                    {s.nextLesson.title}
                  </p>
                )}
              </div>
            </div>
          </Link>
        ) : (
          <div className="parent-glass rounded-2xl p-4 flex items-center gap-4 opacity-50">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(79,70,229,0.06)' }}>
              <Calendar size={18} style={{ color: 'var(--par-text-muted)' }} />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5"
                style={{ color: 'var(--par-text-muted)' }}>
                Ближайший урок
              </p>
              <p className="text-sm" style={{ color: 'var(--par-text-muted)' }}>
                Нет запланированных уроков
              </p>
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="parent-glass rounded-2xl p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-2.5"
            style={{ color: 'var(--par-text-muted)' }}>
            Достижения
          </p>
          {s.badges.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {s.badges.map(badge => (
                <span key={badge.label}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border"
                  style={{ background: badge.bg, color: badge.color, borderColor: badge.color + '33' }}>
                  {badge.icon} {badge.label}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm" style={{ color: 'var(--par-text-muted)' }}>
              Достижения появятся по мере посещений 🚀
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
