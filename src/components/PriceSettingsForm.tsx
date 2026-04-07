'use client'

import { useState } from 'react'
import { updateFinancePrices } from '../app/actions'
import { useAdminTheme } from '@/contexts/AdminThemeContext'

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
  const { theme } = useAdminTheme()
  const isDark = theme === 'dark'

  async function handleSave() {
    setSaving(true)
    await updateFinancePrices(Number(indPrice) || 0, Number(grpPrice) || 0)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const inputStyle = {
    background: 'var(--adm-bg-input)',
    border: '1px solid var(--adm-border-card)',
    color: 'var(--adm-text-primary)',
    borderRadius: 10,
    padding: '8px 12px',
    fontSize: 14,
    width: '100%',
    outline: 'none',
  }

  return (
    <div>
      <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--adm-text-primary)' }}>Стоимость занятий</h2>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm mb-1" style={{ color: 'var(--adm-text-muted)' }}>Индивидуальное, ₽</label>
          <input
            type="number"
            value={indPrice}
            onChange={e => setIndPrice(e.target.value)}
            style={inputStyle}
            onFocus={e => { e.currentTarget.style.borderColor = '#7c3aed' }}
            onBlur={e  => { e.currentTarget.style.borderColor = 'var(--adm-border-card)' }}
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm mb-1" style={{ color: 'var(--adm-text-muted)' }}>Групповое, ₽</label>
          <input
            type="number"
            value={grpPrice}
            onChange={e => setGrpPrice(e.target.value)}
            style={inputStyle}
            onFocus={e => { e.currentTarget.style.borderColor = '#7c3aed' }}
            onBlur={e  => { e.currentTarget.style.borderColor = 'var(--adm-border-card)' }}
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
