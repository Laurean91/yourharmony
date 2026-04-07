'use client'

import { useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { MonthlyRevenue } from '../app/actions'
import { useAdminTheme } from '@/contexts/AdminThemeContext'

const PERIODS = [
  { label: '3 мес', value: 3 },
  { label: '6 мес', value: 6 },
  { label: '12 мес', value: 12 },
]

export default function FinanceChart({ data }: { data: MonthlyRevenue[] }) {
  const [period, setPeriod] = useState(6)
  const { theme } = useAdminTheme()
  const isDark = theme === 'dark'
  const sliced = data.slice(-period)

  const gridStroke = isDark ? 'rgba(255,255,255,0.06)' : '#f0f0f0'
  const tickColor  = isDark ? 'rgba(167,139,250,0.6)'  : '#9ca3af'

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold" style={{ color: 'var(--adm-text-primary)' }}>Доходы по месяцам</h2>
        <div className="flex gap-1">
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className="px-3 py-1 text-sm rounded-lg transition-colors"
              style={
                period === p.value
                  ? { background: '#7c3aed', color: '#fff' }
                  : {
                      background: isDark ? 'rgba(255,255,255,0.08)' : '#f3f4f6',
                      color: isDark ? 'rgba(167,139,250,0.8)' : '#4b5563',
                    }
              }
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={sliced} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: tickColor }} />
          <YAxis tick={{ fontSize: 12, fill: tickColor }} tickFormatter={v => `${v / 1000}к`} />
          <Tooltip
            contentStyle={{
              background: isDark ? 'rgba(28,16,69,0.95)' : '#fff',
              border: isDark ? '1px solid rgba(139,92,246,0.2)' : '1px solid #e5e7eb',
              borderRadius: 12,
              color: isDark ? '#fff' : '#111827',
            }}
            formatter={((v: unknown) => v != null ? `${Number(v).toLocaleString('ru-RU')} ₽` : '') as any}
          />
          <Legend wrapperStyle={{ color: isDark ? 'rgba(167,139,250,0.8)' : '#6b7280' }} />
          <Bar dataKey="individual" name="Индивидуальные" fill="#7c3aed" radius={[4, 4, 0, 0]} />
          <Bar dataKey="group" name="Групповые" fill="#f97316" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
