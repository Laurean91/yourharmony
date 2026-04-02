'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { BookOpen, Save, Check, ChevronDown, BookMarked, Paperclip, X, FileText, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { JournalEntrySkeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'

type Lesson = { id: string; date: string; title: string | null; tag: string }
type JournalEntry = { studentId: string; name: string; attended: boolean; grade: number | null; comment: string }
type LessonFile = { id: string; url: string; name: string; size: number }

export default function JournalPage() {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [lessons,      setLessons]      = useState<Lesson[]>([])
  const [lessonId,     setLessonId]     = useState<string>('')
  const [entries,      setEntries]      = useState<JournalEntry[]>([])
  const [homework,     setHomework]     = useState<string>('')
  const [files,        setFiles]        = useState<LessonFile[]>([])
  const [uploading,    setUploading]    = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [saving,       setSaving]       = useState(false)
  const [saved,        setSaved]        = useState(false)

  // Load past lessons
  useEffect(() => {
    fetch('/api/admin/lessons/past')
      .then(r => r.json())
      .then(data => setLessons(Array.isArray(data) ? data : []))
  }, [])

  const loadJournal = useCallback(async (id: string) => {
    if (!id) return
    setLoading(true)
    const data = await fetch(`/api/lessons/${id}/journal`).then(r => r.json())
    setHomework(data.homework ?? '')
    setFiles(data.files ?? [])
    setEntries(
      (data.entries ?? []).map((e: Omit<JournalEntry, 'comment'> & { comment: string | null }) => ({
        ...e,
        comment: e.comment ?? '',
      }))
    )
    setLoading(false)
    setSaved(false)
  }, [])

  useEffect(() => { loadJournal(lessonId) }, [lessonId, loadJournal])

  function toggle(studentId: string, field: 'attended', value: boolean): void
  function toggle(studentId: string, field: 'grade', value: number | null): void
  function toggle(studentId: string, field: 'comment', value: string): void
  function toggle(studentId: string, field: keyof JournalEntry, value: unknown) {
    setEntries(es => es.map(e => e.studentId === studentId ? { ...e, [field]: value } : e))
    setSaved(false)
  }

  async function uploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !lessonId) return
    e.target.value = ''
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch(`/api/lessons/${lessonId}/files`, { method: 'POST', body: fd })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as { error?: string }).error ?? 'Ошибка загрузки')
      }
      const record: LessonFile = await res.json()
      setFiles(prev => [...prev, record])
      toast.success(`Файл «${file.name}» загружен`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ошибка загрузки файла')
    } finally {
      setUploading(false)
    }
  }

  async function deleteFile(fileId: string) {
    try {
      const res = await fetch(`/api/lessons/${lessonId}/files/${fileId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setFiles(prev => prev.filter(f => f.id !== fileId))
      toast.success('Файл удалён')
    } catch {
      toast.error('Ошибка удаления файла')
    }
  }

  async function saveJournal() {
    if (!lessonId) return
    setSaving(true)
    try {
      const res = await fetch(`/api/lessons/${lessonId}/journal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          homework: homework || null,
          entries: entries.map(e => ({
            studentId: e.studentId,
            attended:  e.attended,
            grade:     e.grade,
            comment:   e.comment || null,
          })),
        }),
      })
      if (!res.ok) throw new Error()
      setSaved(true)
      toast.success('Журнал сохранён')
    } catch {
      toast.error('Ошибка сохранения. Попробуйте ещё раз.')
    } finally {
      setSaving(false)
    }
  }

  const selectedLesson = lessons.find(l => l.id === lessonId)

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)' }}>
          <BookOpen size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Журнал</h1>
          <p className="text-xs text-gray-400">Отметить посещаемость и поставить оценки</p>
        </div>
      </div>

      {/* Lesson selector */}
      <div className="rounded-2xl p-5 mb-6"
        style={{ background: '#fff', border: '1px solid #ede9fe', boxShadow: '0 2px 12px rgba(124,58,237,0.06)' }}>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Выберите урок
        </label>
        <div className="relative">
          <select
            value={lessonId}
            onChange={e => setLessonId(e.target.value)}
            className="w-full rounded-xl px-4 py-3 pr-10 text-sm text-gray-800 appearance-none outline-none transition-all"
            style={{ border: '1.5px solid #ede9fe', background: '#fafafa' }}>
            <option value="">— выберите урок —</option>
            {lessons.map(l => (
              <option key={l.id} value={l.id}>
                {new Date(l.date).toLocaleDateString('ru-RU', {
                  weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
                {l.title ? ` — ${l.title}` : ''}
                {` [${l.tag}]`}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {loading && <JournalEntrySkeleton count={4} />}

      {!loading && lessonId && entries.length === 0 && (
        <EmptyState
          icon={<BookOpen size={40} />}
          title="В этом уроке нет учеников"
          description="Добавьте учеников в расписании при создании урока"
        />
      )}

      {!loading && entries.length > 0 && (
        <>
          {selectedLesson && (
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                style={{ background: '#ede9fe', color: '#5b21b6' }}>
                {selectedLesson.tag}
              </span>
              <span className="text-sm text-gray-500">
                {new Date(selectedLesson.date).toLocaleDateString('ru-RU', {
                  weekday: 'long', day: 'numeric', month: 'long',
                })}
              </span>
            </div>
          )}

          {/* Homework */}
          <div className="rounded-2xl p-4 mb-4"
            style={{ background: '#fefce8', border: '1.5px solid #fde68a' }}>
            <div className="flex items-center gap-2 mb-2">
              <BookMarked size={14} className="text-amber-500 shrink-0" />
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Домашнее задание для группы</p>
            </div>
            <textarea
              value={homework}
              onChange={e => { setHomework(e.target.value); setSaved(false) }}
              placeholder="Например: повторить слова по теме Animals, с. 24 упр. 3..."
              rows={2}
              className="w-full rounded-xl px-3 py-2 text-sm text-gray-700 resize-none outline-none transition-all"
              style={{ border: '1.5px solid #fde68a', background: '#fffbeb' }}
              onFocus={e => { e.currentTarget.style.borderColor = '#f59e0b' }}
              onBlur={e  => { e.currentTarget.style.borderColor = '#fde68a' }}
            />

            {/* Attached files */}
            {files.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {files.map(f => (
                  <div key={f.id} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                    style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
                    <FileText size={13} className="text-amber-500 shrink-0" />
                    <a href={f.url} target="_blank" rel="noopener noreferrer"
                      className="flex-1 text-xs font-medium text-amber-800 truncate hover:underline">
                      {f.name}
                    </a>
                    <span className="text-[10px] text-amber-400 shrink-0">
                      {(f.size / 1024).toFixed(0)} КБ
                    </span>
                    <button onClick={() => deleteFile(f.id)}
                      className="shrink-0 text-amber-400 hover:text-red-500 transition-colors">
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload button */}
            <div className="mt-3">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.webp,.gif,.mp3,.wav,.ogg,.mp4,.webm"
                onChange={uploadFile}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                style={{ background: '#fef3c7', color: '#92400e', border: '1px dashed #fbbf24' }}>
                {uploading
                  ? <><Loader2 size={12} className="animate-spin" />Загрузка...</>
                  : <><Paperclip size={12} />Прикрепить файл</>}
              </button>
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <button
              onClick={() => setEntries(es => es.map(e => ({ ...e, attended: true })))}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={{ background: '#d1fae5', color: '#065f46' }}>
              Отметить всех
            </button>
            <button
              onClick={() => setEntries(es => es.map(e => ({ ...e, attended: false })))}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={{ background: '#fee2e2', color: '#991b1b' }}>
              Снять все
            </button>
          </div>

          <div className="space-y-3 mb-6">
            {entries.map(entry => (
              <div key={entry.studentId} className="rounded-2xl p-4 overflow-hidden"
                style={{
                  background: '#fff',
                  border: `1.5px solid ${entry.attended ? '#bbf7d0' : '#f3f4f6'}`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}>
                {/* Student name + attendance toggle */}
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-gray-900 truncate max-w-[180px]">{entry.name}</p>
                  <button
                    onClick={() => toggle(entry.studentId, 'attended', !entry.attended)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                    style={entry.attended
                      ? { background: '#d1fae5', color: '#065f46' }
                      : { background: '#f3f4f6', color: '#9ca3af' }}>
                    {entry.attended && <Check size={12} />}
                    {entry.attended ? 'Присутствует' : 'Отсутствует'}
                  </button>
                </div>

                {entry.attended && (
                  <div className="grid grid-cols-1 gap-2">
                    {/* Grade */}
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Оценка</p>
                      <div className="flex gap-1.5">
                        {[5, 4, 3, 2, 1].map(g => (
                          <button key={g}
                            onClick={() => toggle(entry.studentId, 'grade', entry.grade === g ? null : g)}
                            className="w-9 h-9 rounded-xl text-sm font-black transition-all"
                            style={entry.grade === g
                              ? { background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff', boxShadow: '0 2px 8px rgba(124,58,237,0.3)' }
                              : { background: '#f5f3ff', color: '#7c3aed' }}>
                            {g}
                          </button>
                        ))}
                        {entry.grade !== null && (
                          <button onClick={() => toggle(entry.studentId, 'grade', null)}
                            className="px-2 text-xs text-gray-400 hover:text-gray-600 transition-all">
                            ✕
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Comment */}
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Комментарий</p>
                      <textarea
                        value={entry.comment}
                        onChange={e => toggle(entry.studentId, 'comment', e.target.value)}
                        placeholder="Заметка для родителей..."
                        rows={2}
                        className="w-full rounded-xl px-3 py-2 text-sm text-gray-700 resize-none outline-none transition-all"
                        style={{ border: '1.5px solid #ede9fe', background: '#fafafa' }}
                        onFocus={e => { e.currentTarget.style.borderColor = '#7c3aed' }}
                        onBlur={e  => { e.currentTarget.style.borderColor = '#ede9fe' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button onClick={saveJournal} disabled={saving || saved}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-sm font-bold text-white transition-all mb-24 md:mb-6"
            style={{
              background: saved
                ? 'linear-gradient(90deg, #34d399, #059669)'
                : 'linear-gradient(90deg, #7c3aed, #6d28d9)',
              boxShadow: saved ? '0 4px 14px rgba(5,150,105,0.25)' : '0 4px 14px rgba(124,58,237,0.3)',
              opacity: saving ? 0.8 : 1,
            }}>
            {saved ? <><Check size={16} />Сохранено</> : saving ? 'Сохранение...' : <><Save size={16} />Сохранить журнал</>}
          </button>
        </>
      )}
    </div>
  )
}
