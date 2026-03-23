import { getFinancePrices, getFinanceStats } from '../../actions'
import FinanceChart from '../../../components/FinanceChart'
import PriceSettingsForm from '../../../components/PriceSettingsForm'

export const dynamic = 'force-dynamic'

/* ── delta badge (server-safe) ── */
function DeltaBadge({ current, prev }: { current: number; prev: number }) {
  if (prev === 0) return null
  const pct = Math.round(((current - prev) / prev) * 100)
  const up = pct >= 0
  return (
    <span
      className="inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-md ml-2"
      style={{
        background: up ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
        color: up ? '#16a34a' : '#dc2626',
      }}
    >
      {up ? '▲' : '▼'} {Math.abs(pct)}%
    </span>
  )
}

export default async function FinancePage() {
  const [prices, stats] = await Promise.all([getFinancePrices(), getFinanceStats()])

  const mr = stats.monthlyRevenue
  const prevMonth = mr.length >= 2 ? mr[mr.length - 2] : null
  const prevTotal      = prevMonth ? prevMonth.individual + prevMonth.group : 0
  const prevIndividual = prevMonth?.individual ?? 0
  const prevGroup      = prevMonth?.group ?? 0

  const maxStudentTotal = stats.studentRevenue[0]?.total ?? 1

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">Финансы</h1>
        <p className="text-sm text-gray-400 mt-0.5">Доходы на основе отмеченных занятий</p>
      </div>

      {/* ── Price settings ── */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: '#fff',
          border: '1px solid rgba(139,92,246,0.12)',
          boxShadow: '0 1px 10px rgba(109,40,217,0.04)',
        }}
      >
        <PriceSettingsForm individual={prices.individual} group={prices.group} />
      </div>

      {/* ── Summary KPI cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* Total */}
        <div
          className="rounded-2xl p-5"
          style={{
            background: 'linear-gradient(135deg,#7c3aed 0%,#6d28d9 100%)',
            boxShadow: '0 4px 20px rgba(124,58,237,0.3)',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-white/70 uppercase tracking-wide">Доход за месяц</p>
            <DeltaBadge current={stats.totalThisMonth} prev={prevTotal} />
          </div>
          <p className="text-3xl font-extrabold text-white leading-none">
            {stats.totalThisMonth.toLocaleString('ru-RU')}
            <span className="text-xl ml-1">₽</span>
          </p>
          {prevTotal > 0 && (
            <p className="text-xs text-white/50 mt-2">
              прошлый месяц: {prevTotal.toLocaleString('ru-RU')} ₽
            </p>
          )}
        </div>

        {/* Individual */}
        <div
          className="rounded-2xl p-5"
          style={{
            background: '#fff',
            border: '1px solid rgba(139,92,246,0.15)',
            boxShadow: '0 2px 12px rgba(109,40,217,0.06)',
          }}
        >
          <div className="flex items-center mb-3">
            <span
              className="w-2 h-2 rounded-full mr-2 shrink-0"
              style={{ background: '#7c3aed' }}
            />
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Индивидуальные</p>
            <DeltaBadge current={stats.totalIndividual} prev={prevIndividual} />
          </div>
          <p className="text-2xl font-extrabold text-gray-900">
            {stats.totalIndividual.toLocaleString('ru-RU')}
            <span className="text-base text-gray-400 ml-1 font-medium">₽</span>
          </p>
          {prevIndividual > 0 && (
            <p className="text-xs text-gray-400 mt-2">
              прошлый: {prevIndividual.toLocaleString('ru-RU')} ₽
            </p>
          )}
        </div>

        {/* Group */}
        <div
          className="rounded-2xl p-5"
          style={{
            background: '#fff',
            border: '1px solid rgba(249,115,22,0.15)',
            boxShadow: '0 2px 12px rgba(249,115,22,0.06)',
          }}
        >
          <div className="flex items-center mb-3">
            <span
              className="w-2 h-2 rounded-full mr-2 shrink-0"
              style={{ background: '#f97316' }}
            />
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Групповые</p>
            <DeltaBadge current={stats.totalGroup} prev={prevGroup} />
          </div>
          <p className="text-2xl font-extrabold text-gray-900">
            {stats.totalGroup.toLocaleString('ru-RU')}
            <span className="text-base text-gray-400 ml-1 font-medium">₽</span>
          </p>
          {prevGroup > 0 && (
            <p className="text-xs text-gray-400 mt-2">
              прошлый: {prevGroup.toLocaleString('ru-RU')} ₽
            </p>
          )}
        </div>
      </div>

      {/* ── Chart ── */}
      <div
        className="rounded-2xl p-5 md:p-6"
        style={{
          background: '#fff',
          border: '1px solid rgba(139,92,246,0.12)',
          boxShadow: '0 1px 10px rgba(109,40,217,0.04)',
        }}
      >
        <FinanceChart data={stats.monthlyRevenue} />
      </div>

      {/* ── Student revenue table ── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: '#fff',
          border: '1px solid rgba(139,92,246,0.12)',
          boxShadow: '0 1px 10px rgba(109,40,217,0.04)',
        }}
      >
        {/* Table header */}
        <div
          className="px-6 py-4"
          style={{ borderBottom: '1px solid rgba(139,92,246,0.08)' }}
        >
          <h2 className="text-base font-semibold text-gray-800">Доход по ученикам</h2>
          <p className="text-sm text-gray-400 mt-0.5">На основе посещённых занятий за всё время</p>
        </div>

        {stats.studentRevenue.length === 0 ? (
          <p className="p-6 text-sm text-gray-400 text-center py-10">
            Нет данных — отметьте посещаемость в расписании
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr
                  className="text-[10px] uppercase tracking-wider"
                  style={{
                    color: '#9ca3af',
                    background: 'rgba(139,92,246,0.03)',
                    borderBottom: '1px solid rgba(139,92,246,0.08)',
                  }}
                >
                  <th className="px-6 py-3 text-left font-semibold">Ученик</th>
                  <th className="px-4 py-3 text-left font-semibold">Тип</th>
                  <th className="px-4 py-3 text-right font-semibold">Посещ.</th>
                  <th className="px-4 py-3 text-right font-semibold pr-6">Сумма</th>
                </tr>
              </thead>
              <tbody>
                {stats.studentRevenue.map((s, idx) => {
                  const isInd = s.tag !== 'Группа' && s.tag !== 'Групповое'
                  const barWidth = Math.round((s.total / maxStudentTotal) * 100)
                  return (
                    <tr
                      key={s.studentId}
                      className={`transition-colors hover:bg-purple-50/60 ${idx % 2 === 1 ? 'bg-purple-50/30' : 'bg-white'}`}
                      style={{ borderBottom: '1px solid rgba(139,92,246,0.06)' }}
                    >
                      {/* Name + avatar */}
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                            style={{
                              background: isInd
                                ? 'linear-gradient(135deg,#a78bfa,#7c3aed)'
                                : 'linear-gradient(135deg,#fb923c,#f97316)',
                            }}
                          >
                            {s.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-semibold text-gray-800">{s.name}</span>
                        </div>
                      </td>

                      {/* Type badge */}
                      <td className="px-4 py-3.5">
                        <span
                          className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold"
                          style={
                            isInd
                              ? { background: 'rgba(124,58,237,0.1)', color: '#7c3aed' }
                              : { background: 'rgba(249,115,22,0.1)', color: '#ea580c' }
                          }
                        >
                          {s.tag}
                        </span>
                      </td>

                      {/* Attended count */}
                      <td className="px-4 py-3.5 text-right text-gray-500 font-medium">{s.attended}</td>

                      {/* Revenue + bar */}
                      <td className="px-4 py-3.5 pr-6 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className="font-bold text-gray-900 text-sm">
                            {s.total.toLocaleString('ru-RU')} ₽
                          </span>
                          <div
                            className="h-1 rounded-full"
                            style={{
                              width: `${barWidth}%`,
                              minWidth: 12,
                              maxWidth: 80,
                              background: isInd
                                ? 'linear-gradient(90deg,#a78bfa,#7c3aed)'
                                : 'linear-gradient(90deg,#fb923c,#f97316)',
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
