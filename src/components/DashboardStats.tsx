'use client'

import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts'
import { CalendarDays, BarChart2, GraduationCap, TrendingUp } from 'lucide-react'

interface Booking  { createdAt: Date | string; status: string }
interface Lesson   { date: Date | string }
interface Student  { createdAt: Date | string }

interface Props {
  bookings:     Booking[]
  lessons:      Lesson[]
  students:     Student[]
  monthRevenue: number
  prevRevenue:  number
}

/* ── helpers ── */
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

/* ── custom tooltip ── */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#fff',
      border: '1px solid rgba(139,92,246,0.15)',
      borderRadius: 12,
      padding: '10px 14px',
      boxShadow: '0 8px 24px rgba(109,40,217,0.12)',
      fontSize: 12,
    }}>
      <p style={{ color: '#6b7280', marginBottom: 4, fontWeight: 600 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color, fontWeight: 600, margin: '2px 0' }}>
          {p.name}: <span style={{ color: '#111' }}>{p.value}</span>
        </p>
      ))}
    </div>
  )
}

/* ── delta badge ── */
function DeltaBadge({ current, prev }: { current: number; prev: number }) {
  if (prev === 0) return null
  const pct = Math.round(((current - prev) / prev) * 100)
  const up = pct >= 0
  return (
    <span
      className="inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-md"
      style={{
        background: up ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
        color: up ? '#16a34a' : '#dc2626',
      }}
    >
      {up ? '▲' : '▼'} {Math.abs(pct)}%
    </span>
  )
}

export default function DashboardStats({ bookings, lessons, students, monthRevenue, prevRevenue }: Props) {
  const months = getLast6Months()

  const chartData = months.map(m => ({
    name: m.label,
    Заявки: bookings.filter(b => {
      const d = new Date(b.createdAt)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === m.key
    }).length,
    Занятия: lessons.filter(l => {
      const d = new Date(l.date)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === m.key
    }).length,
  }))

  const weekLessons  = getThisWeekCount(lessons)
  const monthLessons = getThisMonthCount(lessons.map(l => ({ date: l.date })), 'date')
  const newStudents  = getThisMonthCount(students.map(s => ({ createdAt: s.createdAt })), 'createdAt')

  const kpiCards = [
    {
      label: 'Доход за месяц',
      value: `${monthRevenue.toLocaleString('ru-RU')} ₽`,
      icon: TrendingUp,
      gradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
      glow: 'rgba(124,58,237,0.28)',
      extra: <DeltaBadge current={monthRevenue} prev={prevRevenue} />,
    },
    {
      label: 'Занятий на неделе',
      value: weekLessons,
      icon: CalendarDays,
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      glow: 'rgba(139,92,246,0.25)',
      extra: null,
    },
    {
      label: 'Занятий в месяце',
      value: monthLessons,
      icon: BarChart2,
      gradient: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
      glow: 'rgba(167,139,250,0.25)',
      extra: null,
    },
    {
      label: 'Новых учеников',
      value: newStudents,
      icon: GraduationCap,
      gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
      glow: 'rgba(249,115,22,0.28)',
      extra: null,
    },
  ]

  return (
    <div className="space-y-4 mb-6">
      {/* ── KPI row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpiCards.map(({ label, value, icon: Icon, gradient, glow, extra }) => (
          <div
            key={label}
            className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background: gradient, boxShadow: `0 4px 20px ${glow}` }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(255,255,255,0.18)' }}
            >
              <Icon size={19} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-medium text-white/70 leading-tight truncate">{label}</p>
              <div className="flex items-baseline gap-1.5 mt-0.5 flex-wrap">
                <p className="text-2xl font-extrabold text-white leading-none">{value}</p>
                {extra}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Area chart ── */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: '#fff',
          border: '1px solid rgba(139,92,246,0.12)',
          boxShadow: '0 2px 16px rgba(109,40,217,0.05)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-gray-800">Активность за 6 месяцев</p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-0.5 rounded-full bg-purple-500" />
              Заявки
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-0.5 rounded-full bg-orange-400" />
              Занятия
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="gradBookings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.01} />
              </linearGradient>
              <linearGradient id="gradLessons" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#f97316" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,92,246,0.07)" vertical={false} />
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
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="Заявки"
              stroke="#7c3aed"
              strokeWidth={2.5}
              fill="url(#gradBookings)"
              dot={{ r: 3, fill: '#7c3aed', strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#7c3aed', strokeWidth: 2, stroke: '#fff' }}
            />
            <Area
              type="monotone"
              dataKey="Занятия"
              stroke="#f97316"
              strokeWidth={2}
              strokeDasharray="5 3"
              fill="url(#gradLessons)"
              dot={{ r: 3, fill: '#f97316', strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#f97316', strokeWidth: 2, stroke: '#fff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
