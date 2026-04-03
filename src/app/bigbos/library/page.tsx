'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import { BookOpen, Upload, Trash2, FileText, Tag, Users, X, Plus, ExternalLink } from 'lucide-react'

type LibraryFile = {
  id: string
  title: string
  description: string | null
  url: string
  name: string
  size: number
  category: string | null
  targetTag: string
  createdAt: string
}

const CATEGORIES = ['Чтение', 'Грамматика', 'Аудио', 'Словарный запас', 'Разговорная речь', 'Другое']
const TARGET_TAGS = ['Все', 'Индивидуальное', 'Групповое']

const TAG_STYLES: Record<string, { bg: string; text: string }> = {
  'Все':           { bg: '#dbeafe', text: '#1e40af' },
  'Индивидуальное':{ bg: '#f3e8ff', text: '#6d28d9' },
  'Групповое':     { bg: '#d1fae5', text: '#065f46' },
}

const CAT_COLORS: Record<string, string> = {
  'Чтение':         '#fde68a',
  'Грамматика':     '#bfdbfe',
  'Аудио':          '#a7f3d0',
  'Словарный запас':'#fecaca',
  'Разговорная речь':'#fed7aa',
  'Другое':         '#e5e7eb',
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} КБ`
  return `${(bytes / 1024 / 1024).toFixed(1)} МБ`
}

export default function LibraryPage() {
  const [files, setFiles] = useState<LibraryFile[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [isPending, startTransition] = useTransition()

  // form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [targetTag, setTargetTag] = useState('Все')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/library')
      .then(r => r.json())
      .then(data => { setFiles(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null
    setSelectedFile(f)
    if (f && !title) setTitle(f.name.replace(/\.[^/.]+$/, ''))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedFile || !title.trim()) { setError('Выберите файл и введите название'); return }
    setError('')

    startTransition(async () => {
      const fd = new FormData()
      fd.append('file', selectedFile)
      fd.append('title', title.trim())
      fd.append('description', description.trim())
      fd.append('category', category)
      fd.append('targetTag', targetTag)

      const res = await fetch('/api/library', { method: 'POST', body: fd })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Ошибка загрузки')
        return
      }
      const newFile: LibraryFile = await res.json()
      setFiles(prev => [newFile, ...prev])
      setShowForm(false)
      setTitle(''); setDescription(''); setCategory(''); setTargetTag('Все'); setSelectedFile(null)
      if (fileRef.current) fileRef.current.value = ''
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const res = await fetch(`/api/library/${id}`, { method: 'DELETE' })
      if (res.ok) setFiles(prev => prev.filter(f => f.id !== id))
    })
  }

  const grouped = CATEGORIES.reduce<Record<string, LibraryFile[]>>((acc, cat) => {
    acc[cat] = files.filter(f => f.category === cat)
    return acc
  }, { 'Без категории': files.filter(f => !f.category || !CATEGORIES.includes(f.category)) })

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)' }}>
            <BookOpen size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">Полезная литература</h1>
            <p className="text-xs text-gray-400 mt-0.5">Книги и материалы для учеников</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ background: showForm ? '#6b7280' : 'linear-gradient(135deg, #7c3aed, #a78bfa)', boxShadow: showForm ? 'none' : '0 4px 14px rgba(124,58,237,0.35)' }}
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Отмена' : 'Добавить файл'}
        </button>
      </div>

      {/* Upload form */}
      {showForm && (
        <form onSubmit={handleSubmit}
          className="mb-8 rounded-2xl border p-6"
          style={{ background: '#faf9ff', borderColor: 'rgba(124,58,237,0.15)' }}>
          <h2 className="text-sm font-bold text-gray-700 mb-4">Новый файл</h2>

          {/* File picker */}
          <div className="mb-4">
            <input ref={fileRef} type="file" id="lib-file" className="hidden"
              accept=".pdf,.doc,.docx,.epub,.mp3,.wav,.ogg,.jpg,.jpeg,.png,.webp"
              onChange={handleFileChange} />
            <label htmlFor="lib-file"
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-colors text-sm"
              style={{ borderColor: selectedFile ? '#7c3aed' : '#d1d5db', color: selectedFile ? '#7c3aed' : '#9ca3af' }}>
              <Upload size={16} />
              {selectedFile ? selectedFile.name : 'Выберите файл (PDF, EPUB, Word, MP3, изображение)'}
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Название *</label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                placeholder="Например: «Wizard of Oz» для начинающих"
                className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                style={{ borderColor: '#e5e7eb', background: '#fff', color: '#111827' }} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Категория</label>
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
                style={{ borderColor: '#e5e7eb' }}>
                <option value="">— без категории —</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Описание</label>
              <input value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Краткое описание материала"
                className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                style={{ borderColor: '#e5e7eb', background: '#fff', color: '#111827' }} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Для группы</label>
              <select value={targetTag} onChange={e => setTargetTag(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
                style={{ borderColor: '#e5e7eb' }}>
                {TARGET_TAGS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

          <button type="submit" disabled={isPending}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-all"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)' }}>
            <Upload size={15} />
            {isPending ? 'Загрузка...' : 'Загрузить'}
          </button>
        </form>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: 'Всего файлов', value: files.length, color: '#7c3aed' },
          { label: 'Для всех', value: files.filter(f => f.targetTag === 'Все').length, color: '#1e40af' },
          { label: 'Для групп', value: files.filter(f => f.targetTag !== 'Все').length, color: '#065f46' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 text-center" style={{ background: '#fff', border: '1px solid #f3f4f6' }}>
            <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* File list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: '#f3f4f6' }} />
          ))}
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-400 font-medium">Библиотека пуста</p>
          <p className="text-xs text-gray-300 mt-1">Добавьте первый файл, нажав кнопку выше</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([cat, catFiles]) => {
            if (catFiles.length === 0) return null
            return (
              <div key={cat}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{cat}</span>
                  <span className="text-xs font-semibold rounded-full px-2 py-0.5"
                    style={{ background: CAT_COLORS[cat] ?? '#e5e7eb', color: '#374151' }}>
                    {catFiles.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {catFiles.map(f => (
                    <div key={f.id}
                      className="flex items-start gap-4 rounded-2xl px-4 py-3.5 group transition-all"
                      style={{ background: '#fff', border: '1px solid #f3f4f6' }}>

                      <div className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center"
                        style={{ background: CAT_COLORS[f.category ?? ''] ?? '#f3f4f6' }}>
                        <FileText size={18} style={{ color: '#4b5563' }} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{f.title}</p>
                        {f.description && (
                          <p className="text-xs text-gray-400 mt-0.5 truncate">{f.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="text-[10px] font-semibold rounded-full px-2 py-0.5"
                            style={{ background: TAG_STYLES[f.targetTag]?.bg ?? '#e5e7eb', color: TAG_STYLES[f.targetTag]?.text ?? '#374151' }}>
                            <Users size={8} className="inline mr-1" />
                            {f.targetTag}
                          </span>
                          <span className="text-[10px] text-gray-300">{formatSize(f.size)}</span>
                          <span className="text-[10px] text-gray-300 truncate max-w-[120px]">{f.name}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <a href={f.url} target="_blank" rel="noopener noreferrer"
                          className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-gray-100"
                          title="Открыть файл">
                          <ExternalLink size={14} className="text-gray-400" />
                        </a>
                        <button onClick={() => handleDelete(f.id)} disabled={isPending}
                          className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-red-50"
                          title="Удалить">
                          <Trash2 size={14} className="text-gray-300 group-hover:text-red-400 transition-colors" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Tag legend */}
      <div className="mt-8 rounded-2xl p-4" style={{ background: '#f8f7ff', border: '1px solid rgba(124,58,237,0.1)' }}>
        <p className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1.5"><Tag size={11} /> Группы</p>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-full font-medium" style={{ background: '#dbeafe', color: '#1e40af' }}>Все — виден всем родителям</span>
          <span className="px-2.5 py-1 rounded-full font-medium" style={{ background: '#f3e8ff', color: '#6d28d9' }}>Индивидуальное — только индивидуальные занятия</span>
          <span className="px-2.5 py-1 rounded-full font-medium" style={{ background: '#d1fae5', color: '#065f46' }}>Групповое — только групповые занятия</span>
        </div>
      </div>
    </div>
  )
}
