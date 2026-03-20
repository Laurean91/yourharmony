import { getFinancePrices, getFinanceStats } from '../../actions'
import FinanceChart from '../../../components/FinanceChart'
import PriceSettingsForm from '../../../components/PriceSettingsForm'

export default async function FinancePage() {
  const [prices, stats] = await Promise.all([getFinancePrices(), getFinanceStats()])

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Финансы</h1>

      {/* Price settings */}
      <PriceSettingsForm individual={prices.individual} group={prices.group} />

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Доход в этом месяце</p>
          <p className="text-2xl font-bold text-purple-700">
            {stats.totalThisMonth.toLocaleString('ru-RU')} ₽
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Индивидуальные</p>
          <p className="text-2xl font-bold text-gray-800">
            {stats.totalIndividual.toLocaleString('ru-RU')} ₽
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Групповые</p>
          <p className="text-2xl font-bold text-orange-500">
            {stats.totalGroup.toLocaleString('ru-RU')} ₽
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
        <FinanceChart data={stats.monthlyRevenue} />
      </div>

      {/* Student revenue table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">Доход по ученикам</h2>
          <p className="text-sm text-gray-400 mt-0.5">На основе посещённых занятий</p>
        </div>
        {stats.studentRevenue.length === 0 ? (
          <p className="p-5 text-sm text-gray-400">Нет данных — отметьте посещаемость в календаре</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                  <th className="px-5 py-3 text-left">Ученик</th>
                  <th className="px-5 py-3 text-left">Тип</th>
                  <th className="px-5 py-3 text-right">Занятий</th>
                  <th className="px-5 py-3 text-right">Сумма</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.studentRevenue.map(s => (
                  <tr key={s.studentId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-800">{s.name}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          s.tag === 'Групповое'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {s.tag}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-gray-600">{s.attended}</td>
                    <td className="px-5 py-3 text-right font-semibold text-gray-800">
                      {s.total.toLocaleString('ru-RU')} ₽
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
