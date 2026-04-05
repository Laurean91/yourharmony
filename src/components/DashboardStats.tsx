'use client'

import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { CalendarDays, BarChart2, GraduationCap, TrendingUp } from 'lucide-react'
import { useAdminTheme } from '@/contexts/AdminThemeContext'

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

function CustomTooltip({ active, payload, label, isDark }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: isDark ? 'rgba(28,16,69,0.95)' : '#fff',
      border: `1px solid ${isDark ? 'rgba(167,139,250,0.2)' : 'rgba(139,92,246,0.15)'}`,
      borderRadius: 12,
      padding: '10px 14px',
      boxShadow: '0 8px 24px rgba(109,40,217,0.12)',
      fontSize: 12,
    }}>
      <p style={{ color: isDark ? 'rgba(167,139,250,0.7)' : '#6b7280', marginBottom: 4, fontWeight: 600 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color, fontWeight: 600, margin: '2px 0' }}>
          {p.name}: <span style={{ color: isDark ? '#fff' : '#111' }}>{p.value}</span>
        </p>
      ))}
    </div>
  )
}

const kpiConfig = [
  {
    key: 'revenue',
    label: 'Доход за месяц',
    icon: TrendingUp,
    topBorder: 'linear-gradient(90deg, #7c3aed, #a78bfa)',
    iconBg: (isDark: boolean) => isDark ? 'rgba(124,58,237,0.2)' : 'rgba(124,58,237,0.1)',
    iconColor: '#7c3aed',
    glowColor: 'rgba(124,58,237,0.25)',
  },
  {
    key: 'weekLessons',
    label: 'Занятий на неделе',
    icon: CalendarDays,
    topBorder: 'linear-gradient(90deg, #f97316, #fb923c)',
    iconBg: (isDark: boolean) => isDark ? 'rgba(249,115,22,0.2)' : 'rgba(249,115,22,0.1)',
    iconColor: '#f97316',
    glowColor: 'rgba(249,115,22,0.2)',
  },
  {
    key: 'monthLessons',
    label: 'Занятий в месяце',
    icon: BarChart2,
    topBorder: 'linear-gradient(90deg, #10b981, #34d399)',
    iconBg: (isDark: boolean) => isDark ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.1)',
    iconColor: '#10b981',
    glowColor: 'rgba(16,185,129,0.2)',
  },
  {
    key: 'newStudents',
    label: 'Новых учеников',
    icon: GraduationCap,
    topBorder: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
    iconBg: (isDark: boolean) => isDark ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.1)',
    iconColor: '#3b82f6',
    glowColor: 'rgba(59,130,246,0.2)',
  },
]

export default function DashboardStats({ bookings, lessons, students, monthRevenue, prevRevenue }: Props) {
  const { theme } = useAdminTheme()
  const isDark = theme === 'dark'

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

  const prevPct = prevRevenue > 0
    ? Math.round(((monthRevenue - prevRevenue) / prevRevenue) * 100)
    : null

  const values: Record<string, string | number> = {
    revenue:      `${monthRevenue.toLocaleString('ru-RU')} ₽`,
    weekLessons,
    monthLessons,
    newStudents,
  }

  return (
    <div className="space-y-4 mb-6">
      {/* ── KPI row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiConfig.map(({ key, label, icon: Icon, topBorder, iconBg, iconColor, glowColor }) => (
          <div
            key={key}
            className="rounded-2xl p-5 relative overflow-hidden transition-all duration-300 cursor-default"
            style={{
              background: 'var(--adm-bg-card)',
              border: '1px solid var(--adm-border-card)',
              boxShadow: 'var(--adm-shadow-card)',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLDivElement
              el.style.transform = 'translateY(-4px)'
              el.style.boxShadow = `0 12px 32px ${glowColor}`
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLDivElement
              el.style.transform = ''
              el.style.boxShadow = 'var(--adm-shadow-card)'
            }}
          >
            {/* Colored top border */}
            <div
              className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
              style={{ background: topBorder }}
            />
            {/* Subtle corner glow in dark mode */}
            {isDark && (
              <div
                className="absolute top-[-10px] right-[-10px] w-[60px] h-[60px] rounded-full pointer-events-none"
                style={{ background: glowColor, filter: 'blur(18px)', opacity: 0.5 }}
              />
            )}
            {/* Icon */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ background: iconBg(isDark) }}
            >
              <Icon size={18} style={{ color: iconColor }} />
            </div>
            {/* Value */}
            <p
              className="text-[26px] font-extrabold leading-none"
              style={{ color: 'var(--adm-text-primary)', letterSpacing: '-0.04em' }}
            >
              {values[key]}
            </p>
            <p
              className="text-[12px] mt-1 font-medium"
              style={{ color: 'var(--adm-text-muted)' }}
            >
              {label}
            </p>
            {/* Delta — only on revenue card */}
            {key === 'revenue' && prevPct !== null && (
              <p
                className="text-[11px] font-semibold mt-2 flex items-center gap-1"
                style={{ color: prevPct >= 0 ? (isDark ? '#34d399' : '#10b981') : (isDark ? '#fb923c' : '#f97316') }}
              >
                {prevPct >= 0 ? '▲' : '▼'} {Math.abs(prevPct)}% vs прошлый месяц
              </p>
            )}
          </div>
        ))}
      </div>

      {/* ── Area chart ── */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: 'var(--adm-bg-card)',
          border: '1px solid var(--adm-border-card)',
          boxShadow: 'var(--adm-shadow-card)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold" style={{ color: 'var(--adm-text-primary)' }}>
            Активность за 6 месяцев
          </p>
          <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--adm-text-muted)' }}>
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
              <linearGradient id="gradBookings2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#7c3aed" stopOpacity={isDark ? 0.35 : 0.18} />
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.01} />
              </linearGradient>
              <linearGradient id="gradLessons2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#f97316" stopOpacity={isDark ? 0.25 : 0.15} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? 'rgba(167,139,250,0.08)' : 'rgba(139,92,246,0.07)'}
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: isDark ? 'rgba(167,139,250,0.5)' : '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: isDark ? 'rgba(167,139,250,0.5)' : '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip isDark={isDark} />} />
            <Area
              type="monotone"
              dataKey="Заявки"
              stroke={isDark ? '#a78bfa' : '#7c3aed'}
              strokeWidth={2}
              fill="url(#gradBookings2)"
              dot={{ r: 3, fill: isDark ? '#a78bfa' : '#7c3aed', strokeWidth: 0 }}
              activeDot={{ r: 5, fill: isDark ? '#a78bfa' : '#7c3aed', strokeWidth: 2, stroke: isDark ? '#1c1045' : '#fff' }}
            />
            <Area
              type="monotone"
              dataKey="Занятия"
              stroke="#f97316"
              strokeWidth={2}
              strokeDasharray="5 3"
              fill="url(#gradLessons2)"
              dot={{ r: 3, fill: '#f97316', strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#f97316', strokeWidth: 2, stroke: isDark ? '#1c1045' : '#fff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
