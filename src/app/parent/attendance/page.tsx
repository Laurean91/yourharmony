'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckSquare, Check, X } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useToast } from '@/components/ui/toast'
import { AttendanceRowSkeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'

type Student = { id: string; name: string; tag: string }
type AttendanceData = {
  total: number
  attended: number
  missed: number
  rate: number
  lessons: { lessonId: string; date: string; title: string | null; tag: string; attended: boolean }[]
}

function AttendancePageInner() {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const [children, setChildren] = useState<Student[]>([])
  const [selected, setSelected] = useState<string>('')
  const [data,     setData]     = useState<AttendanceData | null>(null)
  const [loading,  setLoading]  = useState(false)

  useEffect(() => {
    fetch('/api/parent/me')
      .then(r => r.json())
      .then(d => {
        setChildren(d.students ?? [])
        const initial = searchParams.get('studentId') ?? d.students?.[0]?.id ?? ''
        setSelected(initial)
      })
  }, [searchParams])

  useEffect(() => {
    if (!selected) return
    setLoading(true)
    fetch(`/api/parent/attendance?studentId=${selected}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => { setLoading(false); toast.error('Не удалось загрузить посещаемость') })
  }, [selected])

  const pieData = data
    ? [
        { name: 'Посещено', value: data.attended, color: '#34d399' },
        { name: 'Пропущено', value: data.missed,  color: '#fca5a5' },
      ].filter(d => d.value > 0)
    : []

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #34d399, #059669)' }}>
          <CheckSquare size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Посещаемость</h1>
          <p className="text-xs text-gray-400">Статистика посещений</p>
        </div>
      </div>

      {children.length > 1 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {children.map(c => (
            <button key={c.id} onClick={() => setSelected(c.id)}
              className="px-3 py-1.5 rounded-full text-sm font-semibold transition-all"
              style={{
                background: selected === c.id ? 'linear-gradient(90deg, #34d399, #059669)' : '#f3f4f6',
                color: selected === c.id ? '#fff' : '#6b7280',
              }}>
              {c.name}
            </button>
          ))}
        </div>
      )}

      {loading && <AttendanceRowSkeleton count={5} />}

      {!loading && data && (
        <>
          {/* Stats cards */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {[
              { label: 'Всего', value: data.total,    color: '#6b7280' },
              { label: 'Посещено',     value: data.attended, color: '#059669' },
              { label: 'Пропущено',    value: data.missed,   color: '#dc2626' },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-2xl p-3 text-center"
                style={{ background: '#fff', border: '1px solid #f3f4f6', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <p className="text-xl font-black" style={{ color }}>{value}</p>
                <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{label}</p>
              </div>
            ))}
          </div>

          {/* Pie chart */}
          {pieData.length > 0 && (
            <div className="rounded-2xl p-5 mb-6"
              style={{ background: '#fff', border: '1px solid #d1fae5', boxShadow: '0 2px 12px rgba(5,150,105,0.06)' }}>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="shrink-0" style={{ width: 120, height: 120 }}>
                  <ResponsiveContainer width={120} height={120}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={30} outerRadius={55} dataKey="value" strokeWidth={0}>
                        {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip formatter={(v) => [`${v} уроков`]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <p className="text-3xl font-black" style={{ color: '#059669' }}>{data.rate}%</p>
                  <p className="text-sm text-gray-500 mb-3">посещаемость</p>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1.5">
                    {pieData.map(d => (
                      <div key={d.name} className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ background: d.color }} />
                        {d.name}: <strong>{d.value}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Lesson list */}
          <div className="space-y-2">
            {data.lessons.map(lesson => (
              <div key={lesson.lessonId} className="rounded-xl px-4 py-3.5 flex items-center gap-3 min-h-[52px]"
                style={{
                  background: lesson.attended ? '#f0fdf4' : '#fff5f5',
                  border: `1px solid ${lesson.attended ? '#bbf7d0' : '#fecaca'}`,
                }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: lesson.attended ? '#34d399' : '#fca5a5' }}>
                  {lesson.attended
                    ? <Check size={13} className="text-white" />
                    : <X size={13} className="text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {new Date(lesson.date).toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' })}
                    {lesson.title && <span className="text-gray-500 font-normal ml-1">— {lesson.title}</span>}
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
                  style={lesson.attended
                    ? { background: '#d1fae5', color: '#065f46' }
                    : { background: '#fee2e2', color: '#991b1b' }}>
                  {lesson.attended ? 'Посещён' : 'Пропущен'}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && !data && (
        <EmptyState
          icon={<CheckSquare size={40} />}
          title="Данных пока нет"
          description="Посещаемость появится после того, как пройдут первые занятия"
        />
      )}
    </div>
  )
}

export default function AttendancePage() {
  return (
    <Suspense>
      <AttendancePageInner />
    </Suspense>
  )
}
