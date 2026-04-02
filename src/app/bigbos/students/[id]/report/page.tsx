import { notFound } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import PrintButton from './PrintButton'

const GRADE_LABEL: Record<number, string> = { 5: 'Отлично', 4: 'Хорошо', 3: 'Удовл.', 2: 'Неудовл.', 1: 'Плохо' }
const GRADE_COLOR: Record<number, string> = { 5: '#059669', 4: '#2563eb', 3: '#d97706', 2: '#dc2626', 1: '#9d174d' }

export default async function StudentReportPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (session?.user?.role !== 'TEACHER') notFound()

  const { id } = await params

  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      lessons: {
        include: { lesson: true },
        orderBy: { lesson: { date: 'desc' } },
        take: 60,
      },
    },
  })
  if (!student) notFound()

  const teacherProfile = await prisma.teacherProfile.findUnique({ where: { id: 'singleton' } })
  const teacherName = teacherProfile?.name ?? 'Учитель'

  const records = student.lessons.map(ls => ({
    date:     ls.lesson.date,
    title:    ls.lesson.title,
    attended: ls.attended,
    grade:    ls.grade,
    comment:  ls.comment,
  }))

  const attended = records.filter(r => r.attended).length
  const total    = records.length
  const missed   = total - attended
  const rate     = total > 0 ? Math.round((attended / total) * 100) : 0
  const graded   = records.filter(r => r.grade != null)
  const avgGrade = graded.length > 0
    ? (graded.reduce((s, r) => s + (r.grade ?? 0), 0) / graded.length).toFixed(1)
    : null

  const from = records.length > 0
    ? records[records.length - 1].date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—'
  const to = records.length > 0
    ? records[0].date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—'
  const today = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .report-page { padding: 0 !important; max-width: 100% !important; }
        }
        @page { size: A4; margin: 20mm 15mm; }
      `}</style>

      {/* Print button — hidden when printing */}
      <div className="no-print fixed top-4 right-4 z-50 flex gap-2">
        <a href="/bigbos/students"
          className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:text-gray-700 transition-all"
          style={{ background: '#f3f4f6' }}>
          ← Назад
        </a>
        <PrintButton />
      </div>

      <div className="report-page max-w-[780px] mx-auto px-6 py-10 md:py-12 bg-white min-h-screen">

        {/* Header */}
        <div className="flex items-start justify-between mb-8 pb-6"
          style={{ borderBottom: '2px solid #7c3aed' }}>
          <div>
            <p className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-1">
              Языковой клуб «Гармония»
            </p>
            <h1 className="text-3xl font-black text-gray-900 mb-1">{student.name}</h1>
            <p className="text-sm text-gray-500">
              Группа: <strong>{student.tag}</strong>
              {student.age && <span className="ml-3">Возраст: <strong>{student.age} лет</strong></span>}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Отчёт сформирован</p>
            <p className="text-sm font-bold text-gray-700">{today}</p>
            <p className="text-xs text-gray-400 mt-1">Период: {from} — {to}</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Всего уроков', value: total,    color: '#6b7280' },
            { label: 'Посещено',     value: attended,  color: '#059669' },
            { label: 'Пропущено',    value: missed,    color: '#dc2626' },
            { label: 'Посещаемость', value: `${rate}%`, color: rate >= 80 ? '#059669' : '#d97706' },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-2xl p-4 text-center"
              style={{ background: '#fafafa', border: '1px solid #f3f4f6' }}>
              <p className="text-2xl font-black" style={{ color }}>{value}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {avgGrade && (
          <div className="rounded-2xl p-4 mb-8 flex items-center gap-4"
            style={{ background: 'linear-gradient(90deg, #fef9c3, #fef3c7)', border: '1px solid #fde68a' }}>
            <div className="text-center">
              <p className="text-4xl font-black text-amber-600">{avgGrade}</p>
              <p className="text-xs text-amber-500 font-medium">средний балл</p>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">
                Оценок поставлено: {graded.length} из {total}
              </p>
              <div className="flex gap-2 mt-2 flex-wrap">
                {[5, 4, 3, 2, 1].map(g => {
                  const count = graded.filter(r => r.grade === g).length
                  if (!count) return null
                  return (
                    <span key={g} className="px-2 py-0.5 rounded-full text-xs font-bold"
                      style={{ background: '#fff', border: `1px solid ${GRADE_COLOR[g]}`, color: GRADE_COLOR[g] }}>
                      {g} — {count}×
                    </span>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Lesson table */}
        <h2 className="text-sm font-extrabold text-gray-700 uppercase tracking-wide mb-3">
          Журнал уроков
        </h2>
        <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ede9fe' }}>
              <th className="py-2 pr-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide w-28">Дата</th>
              <th className="py-2 pr-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Тема</th>
              <th className="py-2 pr-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide w-16">Присут.</th>
              <th className="py-2 pr-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide w-14">Оценка</th>
              <th className="py-2 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Комментарий</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                <td className="py-2 pr-4 text-gray-500 text-xs">
                  {r.date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                </td>
                <td className="py-2 pr-4 text-gray-700">{r.title ?? '—'}</td>
                <td className="py-2 pr-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full text-[10px] font-black text-white flex items-center justify-center"
                    style={{ background: r.attended ? '#34d399' : '#fca5a5' }}>
                    {r.attended ? '✓' : '✗'}
                  </span>
                </td>
                <td className="py-2 pr-4 text-center">
                  {r.grade != null ? (
                    <span className="font-black text-base" style={{ color: GRADE_COLOR[r.grade] }}>{r.grade}</span>
                  ) : <span className="text-gray-300">—</span>}
                </td>
                <td className="py-2 text-xs text-gray-500">{r.comment ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer */}
        <div className="mt-12 pt-6 flex items-end justify-between"
          style={{ borderTop: '1px solid #e5e7eb' }}>
          <div>
            <p className="text-xs text-gray-400">Преподаватель</p>
            <p className="text-sm font-bold text-gray-700 mt-0.5">{teacherName}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 mb-4">Подпись</p>
            <div style={{ borderBottom: '1px solid #9ca3af', width: 160 }} />
          </div>
        </div>
      </div>
    </>
  )
}
