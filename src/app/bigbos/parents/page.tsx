'use client'

import { useState, useEffect, useCallback } from 'react'
import { Users, Plus, Trash2, Link2, Copy, Check, X } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { ParentRowSkeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { useAdminTheme } from '@/contexts/AdminThemeContext'

type Student = { id: string; name: string; tag: string; age: number | null }
type ParentRow = {
  id: string
  name: string
  phone: string | null
  email: string | null
  username: string
  createdAt: string
  students: Student[]
}

export default function ParentsPage() {
  const { toast } = useToast()
  const { theme } = useAdminTheme()
  const isDark = theme === 'dark'
  const [parents,   setParents]   = useState<ParentRow[]>([])
  const [students,  setStudents]  = useState<Student[]>([])
  const [loading,   setLoading]   = useState(true)
  const [showForm,  setShowForm]  = useState(false)
  const [linkId,    setLinkId]    = useState<string | null>(null)
  const [linkIds,   setLinkIds]   = useState<string[]>([])
  const [newPass,   setNewPass]   = useState<string | null>(null)
  const [copied,    setCopied]    = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [form, setForm] = useState({ username: '', password: '', name: '', phone: '', email: '' })

  const inputStyle = {
    width: '100%',
    borderRadius: 12,
    padding: '8px 12px',
    fontSize: 14,
    outline: 'none',
    background: isDark ? 'rgba(255,255,255,0.06)' : '#fafafa',
    border: `1.5px solid ${isDark ? 'rgba(167,139,250,0.2)' : '#e9d5ff'}`,
    color: isDark ? '#ffffff' : '#1e1b4b',
  }

  const load = useCallback(async () => {
    setLoading(true)
    const [pr, sr] = await Promise.all([
      fetch('/api/admin/parents').then(r => r.json()),
      fetch('/api/admin/students').then(r => r.json()).catch(() => []),
    ])
    setParents(Array.isArray(pr) ? pr : [])
    setStudents(Array.isArray(sr) ? sr : [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function createParent(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/admin/parents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setNewPass(form.password)
      setShowForm(false)
      setForm({ username: '', password: '', name: '', phone: '', email: '' })
      toast.success('Аккаунт родителя создан')
      load()
    } catch {
      toast.error('Ошибка создания аккаунта')
    } finally {
      setSaving(false)
    }
  }

  async function deleteParent(id: string) {
    if (!confirm('Удалить аккаунт родителя?')) return
    try {
      const res = await fetch(`/api/admin/parents/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Аккаунт удалён')
      load()
    } catch {
      toast.error('Ошибка удаления аккаунта')
    }
  }

  async function saveLinks(parentId: string) {
    await fetch(`/api/admin/parents/${parentId}/students`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentIds: linkIds }),
    })
    setLinkId(null)
    load()
  }

  function openLink(parent: ParentRow) {
    setLinkId(parent.id)
    setLinkIds(parent.students.map(s => s.id))
  }

  function copyPassword(pass: string) {
    navigator.clipboard.writeText(pass)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)' }}>
            <Users size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold" style={{ color: 'var(--adm-text-primary)' }}>Родители</h1>
            <p className="text-xs" style={{ color: 'var(--adm-text-muted)' }}>Управление аккаунтами</p>
          </div>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all"
          style={{ background: 'linear-gradient(90deg, #7c3aed, #6d28d9)', boxShadow: '0 4px 14px rgba(124,58,237,0.3)' }}>
          <Plus size={15} /> Добавить
        </button>
      </div>

      {/* New password alert */}
      {newPass && (
        <div className="rounded-2xl p-4 mb-6 flex items-center gap-4"
          style={{ background: '#ecfdf5', border: '1px solid #6ee7b7' }}>
          <div className="flex-1">
            <p className="text-sm font-bold text-emerald-800">Аккаунт создан!</p>
            <p className="text-xs text-emerald-600 mt-0.5">
              Временный пароль: <code className="font-mono font-black">{newPass}</code>
            </p>
          </div>
          <button onClick={() => copyPassword(newPass!)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
            style={{ background: copied ? '#d1fae5' : '#fff', border: '1px solid #6ee7b7', color: '#065f46' }}>
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? 'Скопировано' : 'Копировать'}
          </button>
          <button onClick={() => setNewPass(null)} className="text-emerald-400 hover:text-emerald-600">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <form onSubmit={createParent} className="rounded-2xl p-6 mb-6"
          style={{
            background: 'var(--adm-bg-card)',
            border: '1px solid var(--adm-border-card)',
            boxShadow: 'var(--adm-shadow-card)',
          }}>
          <p className="text-sm font-extrabold mb-4"
            style={{ background: 'linear-gradient(90deg, #7c3aed, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Новый аккаунт родителя
          </p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            {[
              { key: 'name',     label: 'Имя родителя',  required: true },
              { key: 'username', label: 'Логин',          required: true },
              { key: 'password', label: 'Пароль',         required: true },
              { key: 'phone',    label: 'Телефон',        required: false },
              { key: 'email',    label: 'Email',          required: false },
            ].map(({ key, label, required }) => (
              <div key={key} className={key === 'name' ? 'col-span-2' : ''}>
                <label className="block text-xs font-bold mb-1 uppercase tracking-wide"
                  style={{ color: '#6d28d9' }}>{label}</label>
                <input
                  required={required}
                  value={form[key as keyof typeof form]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = '#7c3aed' }}
                  onBlur={e  => { e.currentTarget.style.borderColor = isDark ? 'rgba(167,139,250,0.2)' : '#e9d5ff' }}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{ color: 'var(--adm-text-muted)', background: 'var(--adm-bg-hover)' }}>
              Отмена
            </button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 rounded-xl text-sm font-bold text-white transition-all"
              style={{ background: 'linear-gradient(90deg, #7c3aed, #6d28d9)', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Создание...' : 'Создать'}
            </button>
          </div>
        </form>
      )}

      {/* Link students modal */}
      {linkId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div
            className="w-full max-w-md rounded-2xl p-6 shadow-2xl"
            style={{
              background: isDark ? 'rgba(28,16,69,0.98)' : '#ffffff',
              border: '1px solid var(--adm-border-card)',
            }}
          >
            <p className="text-sm font-extrabold mb-4" style={{ color: 'var(--adm-text-primary)' }}>Привязать учеников</p>
            <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
              {students.map(s => {
                const checked = linkIds.includes(s.id)
                return (
                  <label
                    key={s.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all"
                    style={{ background: checked ? 'var(--adm-bg-hover)' : 'transparent' }}
                    onMouseEnter={e => { if (!checked) e.currentTarget.style.background = 'var(--adm-bg-hover)' }}
                    onMouseLeave={e => { if (!checked) e.currentTarget.style.background = 'transparent' }}
                  >
                    <input type="checkbox" checked={checked}
                      onChange={() => setLinkIds(ids => checked ? ids.filter(i => i !== s.id) : [...ids, s.id])}
                      className="w-4 h-4 rounded accent-violet-600" />
                    <span className="flex-1 text-sm font-medium" style={{ color: 'var(--adm-text-primary)' }}>{s.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: isDark ? 'rgba(124,58,237,0.2)' : '#ede9fe', color: isDark ? '#c4b5fd' : '#5b21b6' }}>{s.tag}</span>
                  </label>
                )
              })}
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setLinkId(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{ color: 'var(--adm-text-muted)', background: 'var(--adm-bg-hover)' }}>
                Отмена
              </button>
              <button onClick={() => saveLinks(linkId)}
                className="px-4 py-2 rounded-xl text-sm font-bold text-white transition-all"
                style={{ background: 'linear-gradient(90deg, #7c3aed, #6d28d9)' }}>
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Parents table */}
      {loading ? (
        <ParentRowSkeleton count={4} />
      ) : parents.length === 0 ? (
        <EmptyState
          icon={<Users size={40} />}
          title="Аккаунтов родителей нет"
          description="Создайте первый аккаунт, чтобы родитель мог войти в личный кабинет"
          action={{ label: 'Добавить родителя', onClick: () => setShowForm(true) }}
        />
      ) : (
        <div className="space-y-3">
          {parents.map(p => (
            <div key={p.id} className="rounded-2xl p-4"
              style={{
                background: 'var(--adm-bg-card)',
                border: '1px solid var(--adm-border-card)',
                boxShadow: 'var(--adm-shadow-card)',
              }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                  style={{ background: 'linear-gradient(135deg, #a78bfa, #7c3aed)' }}>
                  {p.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold" style={{ color: 'var(--adm-text-primary)' }}>{p.name}</p>
                    <code
                      className="text-xs px-2 py-0.5 rounded-lg font-mono"
                      style={{
                        background: isDark ? 'rgba(255,255,255,0.08)' : '#f3f4f6',
                        color: isDark ? 'rgba(167,139,250,0.8)' : '#4b5563',
                      }}>
                      @{p.username}
                    </code>
                  </div>
                  {(p.phone || p.email) && (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--adm-text-muted)' }}>
                      {[p.phone, p.email].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  {p.students.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {p.students.map(s => (
                        <span key={s.id} className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: '#d1fae5', color: '#065f46' }}>
                          {s.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openLink(p)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
                    style={{ color: 'var(--adm-text-muted)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#7c3aed'; e.currentTarget.style.background = 'rgba(124,58,237,0.1)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--adm-text-muted)'; e.currentTarget.style.background = 'transparent' }}
                    title="Привязать учеников">
                    <Link2 size={15} />
                  </button>
                  <button onClick={() => deleteParent(p.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
                    style={{ color: 'var(--adm-text-muted)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--adm-text-muted)'; e.currentTarget.style.background = 'transparent' }}
                    title="Удалить">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
