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

const PERIODS = [
  { label: '3 мес', value: 3 },
  { label: '6 мес', value: 6 },
  { label: '12 мес', value: 12 },
]

export default function FinanceChart({ data }: { data: MonthlyRevenue[] }) {
  const [period, setPeriod] = useState(6)
  const sliced = data.slice(-period)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Доходы по месяцам</h2>
        <div className="flex gap-1">
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                period === p.value
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={sliced} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${v / 1000}к`} />
          <Tooltip formatter={(v: number) => `${v.toLocaleString('ru-RU')} ₽`} />
          <Legend />
          <Bar dataKey="individual" name="Индивидуальные" fill="#7c3aed" radius={[4, 4, 0, 0]} />
          <Bar dataKey="group" name="Групповые" fill="#f97316" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
