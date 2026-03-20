'use client'

import { useState } from 'react'
import { updateStudent } from '@/app/actions'

interface Student {
  id: string
  name: string
  age: number | null
  phone: string | null
  tag: string
  notes: string | null
}

const TAG_OPTIONS = ['Индивидуальное', 'Группа']

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400'

export default function StudentEditForm({
  student,
  onClose,
}: {
  student: Student
  onClose: () => void
}) {
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const formData = new FormData(e.currentTarget)
    await updateStudent(student.id, formData)
    setSaving(false)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 p-4 bg-purple-50 rounded-2xl border border-purple-100">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Имя *</label>
          <input name="name" required defaultValue={student.name} className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Возраст</label>
          <input name="age" type="number" min="1" max="99" defaultValue={student.age ?? ''} className={inputCls} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Телефон родителя</label>
          <input name="phone" defaultValue={student.phone ?? ''} className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Тип занятий</label>
          <select name="tag" defaultValue={student.tag} className={inputCls}>
            {TAG_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Заметки</label>
        <textarea name="notes" defaultValue={student.notes ?? ''} rows={2} className={inputCls + ' resize-none'} />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="px-4 py-1.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-60">
          {saving ? 'Сохранение...' : 'Сохранить'}
        </button>
        <button type="button" onClick={onClose} className="px-4 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50">
          Отмена
        </button>
      </div>
    </form>
  )
}
