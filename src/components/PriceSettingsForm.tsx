'use client'

import { useState } from 'react'
import { updateFinancePrices } from '../app/actions'

export default function PriceSettingsForm({
  individual,
  group,
}: {
  individual: number
  group: number
}) {
  const [indPrice, setIndPrice] = useState(String(individual))
  const [grpPrice, setGrpPrice] = useState(String(group))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    await updateFinancePrices(Number(indPrice) || 0, Number(grpPrice) || 0)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
      <h2 className="text-base font-semibold text-gray-800 mb-4">Стоимость занятий</h2>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm text-gray-500 mb-1">Индивидуальное, ₽</label>
          <input
            type="number"
            value={indPrice}
            onChange={e => setIndPrice(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm text-gray-500 mb-1">Групповое, ₽</label>
          <input
            type="number"
            value={grpPrice}
            onChange={e => setGrpPrice(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-60 transition-colors whitespace-nowrap"
          >
            {saved ? 'Сохранено!' : saving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  )
}
