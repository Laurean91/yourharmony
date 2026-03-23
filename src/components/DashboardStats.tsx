'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { CalendarDays, BarChart2, GraduationCap } from 'lucide-react'

interface Booking  { createdAt: Date | string; status: string }
interface Lesson   { date: Date | string }
interface Student  { createdAt: Date | string }

interface Props {
  bookings: Booking[]
  lessons:  Lesson[]
  students: Student[]
}

function getLast6Months() {
  const months: { label: string; key: string }[] = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({
      label: d.toLocaleDateString('ru-RU', { month: 'short' }),
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
    })
  }
  return months
}

function getThisWeekCount(lessons: Lesson[]) {
  const now = new Date()
  const dayOfWeek = (now.getDay() + 6) % 7
  const monday = new Date(now)
  monday.setDate(now.getDate() - dayOfWeek)
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  return lessons.filter(l => {
    const d = new Date(l.date)
    return d >= monday && d <= sunday
  }).length
}

function getThisMonthCount(
  items: { date?: Date | string; createdAt?: Date | string }[],
  field: 'date' | 'createdAt',
) {
  const now = new Date()
  return items.filter(item => {
    const d = new Date((item[field] as Date | string) ?? '')
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length
}

const statCards = [
  {
    key: 'week',
    label: 'Занятий на неделе',
    icon: CalendarDays,
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
    glow: 'rgba(124,58,237,0.3)',
    iconBg: 'rgba(255,255,255,0.18)',
  },
  {
    key: 'month',
    label: 'Занятий в месяце',
    icon: BarChart2,
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    glow: 'rgba(139,92,246,0.3)',
    iconBg: 'rgba(255,255,255,0.18)',
  },
  {
    key: 'students',
    label: 'Новых учеников',
    icon: GraduationCap,
    gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    glow: 'rgba(249,115,22,0.3)',
    iconBg: 'rgba(255,255,255,0.18)',
  },
]

export default function DashboardStats({ bookings, lessons, students }: Props) {
  const months = getLast6Months()

  const bookingData = months.map(m => ({
    name: m.label,
    Заявки: bookings.filter(b => {
      const d = new Date(b.createdAt)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === m.key
    }).length,
  }))

  const weekLessons    = getThisWeekCount(lessons)
  const monthLessons   = getThisMonthCount(lessons.map(l  => ({ date: l.date })),        'date')
  const newStudents    = getThisMonthCount(students.map(s => ({ createdAt: s.createdAt })), 'createdAt')
  const values         = { week: weekLessons, month: monthLessons, students: newStudents }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

      {/* Bar chart — bookings for 6 months */}
      <div
        className="lg:col-span-2 rounded-2xl p-5"
        style={{
          background: '#fff',
          border: '1px solid rgba(139,92,246,0.12)',
          boxShadow: '0 2px 16px rgba(109,40,217,0.06)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-gray-800">Заявки за 6 месяцев</p>
          <span className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{ background: 'rgba(124,58,237,0.08)', color: '#7c3aed' }}
          >
            {bookings.length} всего
          </span>
        </div>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={bookingData} barSize={22}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              width={20}
            />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 10,
                border: '1px solid rgba(139,92,246,0.15)',
                boxShadow: '0 4px 16px rgba(109,40,217,0.1)',
              }}
              cursor={{ fill: 'rgba(139,92,246,0.06)' }}
            />
            <Bar dataKey="Заявки" radius={[6, 6, 0, 0]}>
              {bookingData.map((_, i) => (
                <Cell
                  key={i}
                  fill={i === bookingData.length - 1 ? '#7c3aed' : '#ddd6fe'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Metric cards */}
      <div className="flex flex-col gap-3">
        {statCards.map(({ key, label, icon: Icon, gradient, glow, iconBg }) => (
          <div
            key={key}
            className="flex items-center gap-4 p-4 rounded-2xl"
            style={{
              background: gradient,
              boxShadow: `0 4px 20px ${glow}`,
            }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: iconBg }}
            >
              <Icon size={20} className="text-white" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-white/70 leading-tight">{label}</p>
              <p className="text-3xl font-extrabold text-white leading-none mt-0.5">
                {values[key as keyof typeof values]}
              </p>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
