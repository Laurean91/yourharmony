import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Calendar, Star, CheckSquare } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

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
                take: 5,
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
      <div className="rounded-2xl px-6 py-5 mb-8 animate-fade-slide-up"
        style={{
          background: 'linear-gradient(135deg, #ecfdf5 0%, #eff6ff 100%)',
          border: '1px solid #d1fae5',
          boxShadow: '0 4px 20px rgba(5,150,105,0.08)',
        }}>
        <div className="flex items-center gap-4">
          <div className="shrink-0 rounded-2xl overflow-hidden shadow-md" style={{ width: 52, height: 52 }}>
            <Image src="/logo.png" width={52} height={52} alt="Гармония" className="object-cover w-full h-full" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">
              Привет, <span style={{ color: '#059669' }}>{parent.name}</span> 👋
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">Личный кабинет клуба «Гармония»</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {parent.students.map(({ student }, idx) => {
          const lessonsDone = student.lessons.filter(l => l.lesson.date <= now)
          const lastGrade   = lessonsDone.find(l => l.grade != null)
          const nextLesson  = student.lessons.find(l => l.lesson.date > now)
          const attended    = student.lessons.filter(l => l.lesson.date <= now && l.attended).length
          const total       = lessonsDone.length
          const rate        = total > 0 ? Math.round((attended / total) * 100) : null

          return (
            <div key={student.id}
              className="rounded-2xl overflow-hidden animate-fade-slide-up"
              style={{
                background: '#fff',
                boxShadow: '0 4px 24px rgba(5,150,105,0.08)',
                border: '1px solid #d1fae5',
                animationDelay: `${idx * 120}ms`,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLDivElement
                el.style.transform = 'translateY(-2px)'
                el.style.boxShadow = '0 8px 32px rgba(5,150,105,0.14)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLDivElement
                el.style.transform = 'translateY(0)'
                el.style.boxShadow = '0 4px 24px rgba(5,150,105,0.08)'
              }}>

              {/* Student header */}
              <div className="px-6 py-5"
                style={{ background: 'linear-gradient(90deg, #ecfdf5 0%, #eff6ff 100%)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-extrabold text-gray-900">{student.name}</p>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                      style={{ background: '#d1fae5', color: '#065f46' }}>
                      {student.tag}
                    </span>
                  </div>
                  {student.age && (
                    <div className="text-right">
                      <p className="text-2xl font-black text-gray-800">{student.age}</p>
                      <p className="text-xs text-gray-400">лет</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
                {[
                  {
                    label: 'Посещ.',
                    value: rate != null ? `${rate}%` : '—',
                    color: '#059669',
                    barColor: 'linear-gradient(90deg, #34d399, #059669)',
                  },
                  {
                    label: 'Уроков',
                    value: total,
                    color: '#374151',
                    barColor: 'linear-gradient(90deg, #93c5fd, #3b82f6)',
                  },
                  {
                    label: 'Оценка',
                    value: lastGrade?.grade ?? '—',
                    color: lastGrade ? '#3b82f6' : '#9ca3af',
                    barColor: 'linear-gradient(90deg, #fcd34d, #f59e0b)',
                  },
                ].map(({ label, value, color, barColor }) => (
                  <div key={label} className="relative px-2 py-3 text-center overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: barColor }} />
                    <p className="text-[10px] text-gray-400 mb-0.5 leading-tight">{label}</p>
                    <p className="text-base font-black" style={{ color }}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Next lesson */}
              {nextLesson && (
                <div className="px-6 py-3 flex items-center gap-3 border-b border-gray-100">
                  <Calendar size={15} style={{ color: '#059669' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400">Ближайший урок</p>
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {new Date(nextLesson.lesson.date).toLocaleDateString('ru-RU', {
                        weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                      {nextLesson.lesson.title && ` — ${nextLesson.lesson.title}`}
                    </p>
                  </div>
                </div>
              )}

              {/* Quick links */}
              <div className="grid grid-cols-3 divide-x divide-gray-100">
                {[
                  { href: `/parent/schedule?studentId=${student.id}`,   label: 'Расписание', icon: Calendar,    color: '#059669' },
                  { href: `/parent/grades?studentId=${student.id}`,     label: 'Оценки',     icon: Star,        color: '#f59e0b' },
                  { href: `/parent/attendance?studentId=${student.id}`, label: 'Посещения',  icon: CheckSquare, color: '#3b82f6' },
                ].map(({ href, label, icon: Icon, color }) => (
                  <Link key={href} href={href}
                    className="group flex flex-col items-center gap-1.5 py-4 text-xs font-medium text-gray-500 transition-all min-h-[44px]"
                    style={{ transition: 'background 0.15s, color 0.15s' }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLAnchorElement
                      el.style.background = `${color}10`
                      el.style.color = color
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLAnchorElement
                      el.style.background = 'transparent'
                      el.style.color = '#6b7280'
                    }}>
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
          <p className="text-4xl mb-3">👶</p>
          <p className="text-sm">Пока нет привязанных детей.<br/>Обратитесь к преподавателю.</p>
        </div>
      )}
    </div>
  )
}
