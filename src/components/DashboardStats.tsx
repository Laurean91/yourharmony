'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface Booking {
  createdAt: Date | string
  status: string
}

interface Lesson {
  date: Date | string
}

interface Student {
  createdAt: Date | string
}

interface Props {
  bookings: Booking[]
  lessons: Lesson[]
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

function getThisMonthCount(items: { date?: Date | string; createdAt?: Date | string }[], field: 'date' | 'createdAt') {
  const now = new Date()
  return items.filter(item => {
    const d = new Date((item[field] as Date | string) ?? '')
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length
}

export default function DashboardStats({ bookings, lessons, students }: Props) {
  const months = getLast6Months()

  const bookingData = months.map(m => ({
    name: m.label,
    Заявки: bookings.filter(b => {
      const d = new Date(b.createdAt)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === m.key
    }).length,
  }))

  const weekLessons = getThisWeekCount(lessons)
  const monthLessons = getThisMonthCount(lessons.map(l => ({ date: l.date })), 'date')
  const newStudentsMonth = getThisMonthCount(students.map(s => ({ createdAt: s.createdAt })), 'createdAt')

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

      {/* Bookings chart */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <p className="text-sm font-semibold text-gray-800 mb-4">Заявки за 6 месяцев</p>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={bookingData} barSize={20}>
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={20} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: 'none' }}
              cursor={{ fill: '#f3f4f6' }}
            />
            <Bar dataKey="Заявки" radius={[4, 4, 0, 0]}>
              {bookingData.map((_, i) => (
                <Cell key={i} fill={i === bookingData.length - 1 ? '#7c3aed' : '#ddd6fe'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Stats cards */}
      <div className="flex flex-col gap-3">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Занятий на этой неделе</p>
            <p className="text-2xl font-bold text-purple-600">{weekLessons}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-lg">📅</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Занятий в этом месяце</p>
            <p className="text-2xl font-bold text-violet-600">{monthLessons}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-lg">📊</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Новых учеников за месяц</p>
            <p className="text-2xl font-bold text-orange-500">{newStudentsMonth}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-lg">🎓</div>
        </div>
      </div>

    </div>
  )
}
