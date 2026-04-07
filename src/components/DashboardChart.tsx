'use client'

import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { useAdminTheme } from '@/contexts/AdminThemeContext'

interface Booking  { createdAt: Date | string; status: string }
interface Lesson   { date: Date | string }

interface Props {
  bookings: Booking[]
  lessons:  Lesson[]
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

export default function DashboardChart({ bookings, lessons }: Props) {
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

  return (
    <div
      className="rounded-2xl p-5 h-full"
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
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="gradBookingsChart" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#7c3aed" stopOpacity={isDark ? 0.35 : 0.18} />
              <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.01} />
            </linearGradient>
            <linearGradient id="gradLessonsChart" x1="0" y1="0" x2="0" y2="1">
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
            fill="url(#gradBookingsChart)"
            dot={{ r: 3, fill: isDark ? '#a78bfa' : '#7c3aed', strokeWidth: 0 }}
            activeDot={{ r: 5, fill: isDark ? '#a78bfa' : '#7c3aed', strokeWidth: 2, stroke: isDark ? '#1c1045' : '#fff' }}
          />
          <Area
            type="monotone"
            dataKey="Занятия"
            stroke="#f97316"
            strokeWidth={2}
            strokeDasharray="5 3"
            fill="url(#gradLessonsChart)"
            dot={{ r: 3, fill: '#f97316', strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#f97316', strokeWidth: 2, stroke: isDark ? '#1c1045' : '#fff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
