'use client'

import { useState } from 'react'
import { createStudent } from '@/app/actions'
import { useAdminTheme } from '@/contexts/AdminThemeContext'

export default function AddStudentModal() {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const { theme } = useAdminTheme()
  const isDark = theme === 'dark'

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const formData = new FormData(e.currentTarget)
    await createStudent(formData)
    setSaving(false)
    setOpen(false)
  }

  const inputStyle = {
    width: '100%',
    background: 'var(--adm-bg-input)',
    border: '1px solid var(--adm-border-card)',
    color: 'var(--adm-text-primary)',
    borderRadius: 12,
    padding: '8px 12px',
    fontSize: 14,
    outline: 'none',
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-purple-600 text-white px-5 py-2 rounded-xl font-medium hover:bg-purple-700 text-sm transition-colors"
      >
        + Добавить ученика
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div
            className="relative rounded-2xl shadow-xl w-full max-w-md p-6 z-10"
            style={{
              background: isDark ? 'rgba(28,16,69,0.98)' : '#ffffff',
              border: '1px solid var(--adm-border-card)',
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold" style={{ color: 'var(--adm-text-primary)' }}>Новый ученик</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-xl leading-none transition-colors"
                style={{ color: 'var(--adm-text-muted)' }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--adm-text-primary)' }}>Имя *</label>
                  <input
                    name="name"
                    required
                    placeholder="Имя ученика"
                    style={inputStyle}
                    onFocus={e => { e.currentTarget.style.borderColor = '#7c3aed' }}
                    onBlur={e  => { e.currentTarget.style.borderColor = 'var(--adm-border-card)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--adm-text-primary)' }}>Возраст</label>
                  <input
                    name="age"
                    type="number"
                    min="1"
                    max="99"
                    placeholder="Лет"
                    style={inputStyle}
                    onFocus={e => { e.currentTarget.style.borderColor = '#7c3aed' }}
                    onBlur={e  => { e.currentTarget.style.borderColor = 'var(--adm-border-card)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--adm-text-primary)' }}>Тип занятий</label>
                  <select
                    name="tag"
                    style={{ ...inputStyle, appearance: 'none' as const }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#7c3aed' }}
                    onBlur={e  => { e.currentTarget.style.borderColor = 'var(--adm-border-card)' }}
                  >
                    <option value="Индивидуальное">Индивидуальное</option>
                    <option value="Группа">Группа</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--adm-text-primary)' }}>Телефон родителя</label>
                  <input
                    name="phone"
                    placeholder="+7..."
                    style={inputStyle}
                    onFocus={e => { e.currentTarget.style.borderColor = '#7c3aed' }}
                    onBlur={e  => { e.currentTarget.style.borderColor = 'var(--adm-border-card)' }}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--adm-text-primary)' }}>Заметки</label>
                  <textarea
                    name="notes"
                    rows={2}
                    placeholder="Дополнительная информация..."
                    style={{ ...inputStyle, resize: 'none' as const }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#7c3aed' }}
                    onBlur={e  => { e.currentTarget.style.borderColor = 'var(--adm-border-card)' }}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-purple-600 text-white py-2 rounded-xl font-medium hover:bg-purple-700 disabled:opacity-60 text-sm transition-colors"
                >
                  {saving ? 'Сохранение...' : 'Добавить'}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 py-2 rounded-xl font-medium text-sm transition-colors"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.08)' : '#f3f4f6',
                    color: 'var(--adm-text-primary)',
                  }}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
