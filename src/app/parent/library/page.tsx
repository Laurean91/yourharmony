'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Library, FileText, Download, BookOpen, Headphones, MessageCircle, Languages, Layers } from 'lucide-react'

type Student = { id: string; name: string; tag: string }
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

// Deterministic pastel gradient per title
const GRADIENTS = [
  ['#fde68a', '#fca5a5'],  // amber → red
  ['#a7f3d0', '#6ee7b7'],  // mint
  ['#bfdbfe', '#c7d2fe'],  // blue → indigo
  ['#fed7aa', '#fde68a'],  // peach → amber
  ['#f0abfc', '#e879f9'],  // violet
  ['#99f6e4', '#67e8f9'],  // teal → sky
  ['#d9f99d', '#bbf7d0'],  // lime → green
  ['#fbcfe8', '#f9a8d4'],  // pink
]

function gradientFor(str: string) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffff
  return GRADIENTS[h % GRADIENTS.length]
}

const CAT_ICONS: Record<string, React.ElementType> = {
  'Чтение':          BookOpen,
  'Грамматика':      Languages,
  'Аудио':           Headphones,
  'Словарный запас': FileText,
  'Разговорная речь':MessageCircle,
  'Другое':          Layers,
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} КБ`
  return `${(bytes / 1024 / 1024).toFixed(1)} МБ`
}

function getExt(name: string) {
  return name.split('.').pop()?.toUpperCase() ?? 'FILE'
}

function LibraryPageInner() {
  const searchParams = useSearchParams()
  const [children, setChildren] = useState<Student[]>([])
  const [selected, setSelected] = useState('')
  const [files, setFiles] = useState<LibraryFile[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/parent/me')
      .then(r => r.json())
      .then(data => {
        setChildren(data.students ?? [])
        const initial = searchParams.get('studentId') ?? data.students?.[0]?.id ?? ''
        setSelected(initial)
      })
  }, [searchParams])

  useEffect(() => {
    if (!selected) return
    setLoading(true)
    fetch(`/api/library?studentId=${selected}`)
      .then(r => r.json())
      .then(data => { setFiles(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [selected])

  const categories = Array.from(new Set(files.map(f => f.category ?? 'Другое'))).filter(Boolean)
  const filtered = activeCategory ? files.filter(f => (f.category ?? 'Другое') === activeCategory) : files

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #059669, #34d399)' }}>
          <Library size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Полезная литература</h1>
          <p className="text-xs text-gray-400">Материалы от учителя для самостоятельного изучения</p>
        </div>
      </div>

      {/* Child selector */}
      {children.length > 1 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {children.map(c => (
            <button key={c.id} onClick={() => setSelected(c.id)}
              className="px-3 py-1.5 rounded-full text-sm font-semibold transition-all"
              style={{
                background: selected === c.id ? 'linear-gradient(90deg, #059669, #34d399)' : '#f3f4f6',
                color: selected === c.id ? '#fff' : '#6b7280',
              }}>
              {c.name}
            </button>
          ))}
        </div>
      )}

      {/* Category filters */}
      {categories.length > 1 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setActiveCategory(null)}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={{
              background: activeCategory === null ? '#065f46' : '#f0fdf4',
              color: activeCategory === null ? '#fff' : '#059669',
              border: '1px solid',
              borderColor: activeCategory === null ? '#065f46' : '#d1fae5',
            }}>
            Все
          </button>
          {categories.map(cat => {
            const Icon = CAT_ICONS[cat] ?? Layers
            return (
              <button key={cat} onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: activeCategory === cat ? '#065f46' : '#f0fdf4',
                  color: activeCategory === cat ? '#fff' : '#059669',
                  border: '1px solid',
                  borderColor: activeCategory === cat ? '#065f46' : '#d1fae5',
                }}>
                <Icon size={11} />
                {cat}
              </button>
            )
          })}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ background: '#f0fdf4' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: '#f0fdf4' }}>
            <BookOpen size={28} style={{ color: '#34d399' }} />
          </div>
          <p className="font-semibold text-gray-600">Материалов пока нет</p>
          <p className="text-sm text-gray-400 mt-1">Учитель добавит книги и материалы для вашего ребёнка</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((f, idx) => {
            const [c1, c2] = gradientFor(f.title)
            const Icon = CAT_ICONS[f.category ?? ''] ?? FileText
            return (
              <a
                key={f.id}
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex flex-col rounded-2xl overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5"
                style={{
                  background: '#fff',
                  border: '1px solid #f3f4f6',
                  animationDelay: `${idx * 60}ms`,
                }}
              >
                {/* Color band */}
                <div className="h-2 w-full"
                  style={{ background: `linear-gradient(90deg, ${c1}, ${c2})` }} />

                <div className="flex items-start gap-3 p-4">
                  {/* Icon */}
                  <div className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${c1}88, ${c2}88)` }}>
                    <Icon size={20} style={{ color: '#374151' }} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 leading-tight line-clamp-2 group-hover:text-emerald-700 transition-colors">
                      {f.title}
                    </p>
                    {f.description && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{f.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {f.category && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: `${c1}55`, color: '#374151' }}>
                          {f.category}
                        </span>
                      )}
                      <span className="text-[10px] text-gray-300 font-mono">{getExt(f.name)}</span>
                      <span className="text-[10px] text-gray-300">{formatSize(f.size)}</span>
                    </div>
                  </div>

                  {/* Download icon */}
                  <div className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-colors group-hover:bg-emerald-50">
                    <Download size={14} className="text-gray-300 group-hover:text-emerald-500 transition-colors" />
                  </div>
                </div>
              </a>
            )
          })}
        </div>
      )}

      {files.length > 0 && (
        <p className="text-center text-xs text-gray-300 mt-8">
          {files.length} {files.length === 1 ? 'материал' : files.length < 5 ? 'материала' : 'материалов'} от учителя
        </p>
      )}
    </div>
  )
}

export default function LibraryPage() {
  return (
    <Suspense>
      <LibraryPageInner />
    </Suspense>
  )
}
