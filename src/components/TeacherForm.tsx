'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { updateTeacherProfile, updateTeacherPageContent } from '../app/actions'
import type { TeacherCredential, TeacherApproachItem } from '../app/actions'
import { useAdminTheme } from '@/contexts/AdminThemeContext'

interface TeacherProfile {
  name: string
  bio: string
  photoUrl: string | null
  badges: string
}

interface TeacherPageContent {
  credentials: TeacherCredential[]
  approach: TeacherApproachItem[]
  showCredentials: boolean
  showApproach: boolean
}

const DEFAULT_CREDENTIALS: TeacherCredential[] = [
  { icon: '🎓', title: 'Сертификат CELTA', description: 'Certificate in English Language Teaching to Adults — международный сертификат Кембриджского университета, один из наиболее признанных в мире.' },
  { icon: '📊', title: 'IELTS 8.0', description: 'Высший балл в системе международного тестирования знания английского языка, подтверждающий уровень C2 (экспертный).' },
  { icon: '👦', title: 'Специализация: дети', description: 'Более 7 лет работы исключительно с детьми от 4 до 14 лет. Знает, как объяснить сложное просто и сделать урок интересным для каждого возраста.' },
  { icon: '🎮', title: 'Игровые методики', description: 'Коммуникативный подход в сочетании с ролевыми играми, песнями и творческими заданиями. Дети учатся говорить с первого занятия.' },
]

const DEFAULT_APPROACH: TeacherApproachItem[] = [
  { title: 'Коммуникативный метод', text: 'Дети общаются на английском с первого занятия. Никакой зубрёжки — только живое общение в контексте.' },
  { title: 'Погружение через игру', text: 'Язык осваивается в игровых ситуациях: ролевые игры, диалоги, задания. Ребёнок не переводит — он думает на английском.' },
  { title: 'Индивидуальный подход', text: 'Группы до 8 человек. Каждый ребёнок в поле зрения, получает обратную связь и двигается в комфортном темпе.' },
  { title: 'Позитивная атмосфера', text: 'Поощрение и поддержка — не критика. Ребёнок не боится ошибаться и говорит свободнее.' },
]

export default function TeacherForm({ teacher, pageContent }: { teacher: TeacherProfile; pageContent?: TeacherPageContent }) {
  const router = useRouter()
  const { theme } = useAdminTheme()
  const isDark = theme === 'dark'

  const [photoPreview, setPhotoPreview] = useState<string | null>(teacher.photoUrl)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [credentials, setCredentials] = useState<TeacherCredential[]>(
    (pageContent?.credentials?.length ?? 0) > 0 ? pageContent!.credentials : DEFAULT_CREDENTIALS
  )
  const [approach, setApproach] = useState<TeacherApproachItem[]>(
    (pageContent?.approach?.length ?? 0) > 0 ? pageContent!.approach : DEFAULT_APPROACH
  )
  const [showCredentials, setShowCredentials] = useState(pageContent?.showCredentials ?? true)
  const [showApproach, setShowApproach] = useState(pageContent?.showApproach ?? true)
  const [pageSaving, setPageSaving] = useState(false)
  const [pageSaved, setPageSaved] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setSaved(false)
    try {
      const fd = new FormData(e.currentTarget)
      fd.set('existingPhotoUrl', teacher.photoUrl ?? '')
      await updateTeacherProfile(fd)
      setSaved(true)
      router.refresh()
    } catch {
      alert('Ошибка при сохранении. Попробуйте ещё раз.')
    } finally {
      setLoading(false)
    }
  }

  async function handlePageContentSave() {
    setPageSaving(true)
    setPageSaved(false)
    try {
      const fd = new FormData()
      fd.set('credentials', JSON.stringify(credentials))
      fd.set('approach', JSON.stringify(approach))
      fd.set('showCredentials', String(showCredentials))
      fd.set('showApproach', String(showApproach))
      await updateTeacherPageContent(fd)
      setPageSaved(true)
    } catch {
      alert('Ошибка при сохранении. Попробуйте ещё раз.')
    } finally {
      setPageSaving(false)
    }
  }

  const cardStyle = {
    background: 'var(--adm-bg-card)',
    border: '1px solid var(--adm-border-card)',
    boxShadow: 'var(--adm-shadow-card)',
    borderRadius: 16,
    padding: 24,
  }

  const inputStyle = {
    width: '100%',
    background: 'var(--adm-bg-input)',
    border: `1px solid ${isDark ? 'rgba(167,139,250,0.2)' : '#d1d5db'}`,
    color: 'var(--adm-text-primary)',
    borderRadius: 8,
    padding: '10px 16px',
    fontSize: 14,
    outline: 'none',
  }

  const subCardStyle = {
    background: isDark ? 'rgba(255,255,255,0.04)' : '#f9fafb',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#f0f0f0'}`,
    borderRadius: 12,
    padding: 16,
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Фото */}
        <div style={cardStyle}>
          <h2 className="text-lg font-bold mb-5" style={{ color: 'var(--adm-text-primary)' }}>Фотография</h2>
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0">
              {photoPreview ? (
                <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-purple-200 shadow">
                  <Image src={photoPreview} alt="Фото преподавателя" fill className="object-cover" />
                </div>
              ) : (
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-400 to-orange-400 flex items-center justify-center shadow text-white text-3xl font-bold select-none">
                  {teacher.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1">
              <input
                type="file"
                name="photoFile"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) setPhotoPreview(URL.createObjectURL(file))
                }}
                className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                style={{ color: 'var(--adm-text-muted)' }}
              />
              <p className="text-xs mt-2" style={{ color: 'var(--adm-text-muted)' }}>PNG, JPG, WebP — рекомендуется квадратное фото</p>
            </div>
          </div>
        </div>

        {/* Основные данные */}
        <div style={cardStyle}>
          <h2 className="text-lg font-bold mb-5" style={{ color: 'var(--adm-text-primary)' }}>Основное</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--adm-text-primary)' }}>
                Имя преподавателя <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                defaultValue={teacher.name}
                required
                maxLength={100}
                placeholder="Например: Анна Сергеевна"
                style={inputStyle}
                onFocus={e => { e.currentTarget.style.borderColor = '#7c3aed' }}
                onBlur={e  => { e.currentTarget.style.borderColor = isDark ? 'rgba(167,139,250,0.2)' : '#d1d5db' }}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--adm-text-primary)' }}>
                Биография <span className="text-red-500">*</span>
              </label>
              <textarea
                name="bio"
                defaultValue={teacher.bio}
                required
                rows={5}
                maxLength={1000}
                placeholder="Расскажите о преподавателе: опыт, специализация, подход к обучению…"
                style={{ ...inputStyle, resize: 'none' as const }}
                onFocus={e => { e.currentTarget.style.borderColor = '#7c3aed' }}
                onBlur={e  => { e.currentTarget.style.borderColor = isDark ? 'rgba(167,139,250,0.2)' : '#d1d5db' }}
              />
            </div>
          </div>
        </div>

        {/* Значки */}
        <div style={cardStyle}>
          <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--adm-text-primary)' }}>Значки квалификации</h2>
          <p className="text-sm mb-4" style={{ color: 'var(--adm-text-muted)' }}>Перечислите через запятую. Отображаются как теги под биографией.</p>
          <input
            type="text"
            name="badges"
            defaultValue={teacher.badges}
            required
            placeholder="Сертификат CELTA, Опыт 7 лет, IELTS 8.0, Дети 6–14 лет"
            style={inputStyle}
            onFocus={e => { e.currentTarget.style.borderColor = '#7c3aed' }}
            onBlur={e  => { e.currentTarget.style.borderColor = isDark ? 'rgba(167,139,250,0.2)' : '#d1d5db' }}
          />
          <div className="flex flex-wrap gap-2 mt-3">
            {teacher.badges.split(',').map(b => b.trim()).filter(Boolean).map(badge => (
              <span key={badge} className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* Кнопки профиля */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push('/bigbos')}
            className="px-5 py-2.5 font-medium rounded-xl transition-colors"
            style={{ color: 'var(--adm-text-muted)', background: 'var(--adm-bg-hover)' }}
          >
            Отмена
          </button>
          <div className="flex items-center gap-3">
            {saved && <span className="text-sm text-green-600 font-medium">✓ Сохранено</span>}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-purple-600 text-white px-8 py-2.5 rounded-xl font-semibold hover:bg-purple-700 transition-colors shadow-sm disabled:opacity-60"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Сохранение…
                </>
              ) : 'Сохранить изменения'}
            </button>
          </div>
        </div>
      </form>

      {/* ─── Контент страницы /teacher ─── */}
      <div className="mt-10 space-y-6">
        <div>
          <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--adm-text-primary)' }}>Страница преподавателя (/teacher)</h2>
          <p className="text-sm" style={{ color: 'var(--adm-text-muted)' }}>Блоки «Образование и квалификация» и «Подход к обучению»</p>
        </div>

        {/* Квалификация */}
        <div
          className="rounded-2xl p-6 space-y-4 transition-colors"
          style={{
            background: 'var(--adm-bg-card)',
            border: '1px solid var(--adm-border-card)',
            opacity: showCredentials ? 1 : 0.6,
          }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold" style={{ color: 'var(--adm-text-primary)' }}>Образование и квалификация</h3>
            <button
              type="button"
              onClick={() => setShowCredentials(v => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${showCredentials ? 'bg-purple-600' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${showCredentials ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          {credentials.map((item, i) => (
            <div key={i} className="rounded-xl p-4 space-y-3" style={subCardStyle}>
              <div className="flex gap-3">
                <div className="w-24 flex-shrink-0">
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--adm-text-muted)' }}>Иконка</label>
                  <input
                    type="text"
                    value={item.icon}
                    onChange={e => setCredentials(prev => prev.map((c, idx) => idx === i ? { ...c, icon: e.target.value } : c))}
                    style={{ ...inputStyle, textAlign: 'center' }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#7c3aed' }}
                    onBlur={e  => { e.currentTarget.style.borderColor = isDark ? 'rgba(167,139,250,0.2)' : '#d1d5db' }}
                    placeholder="🎓"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--adm-text-muted)' }}>Заголовок</label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={e => setCredentials(prev => prev.map((c, idx) => idx === i ? { ...c, title: e.target.value } : c))}
                    style={inputStyle}
                    onFocus={e => { e.currentTarget.style.borderColor = '#7c3aed' }}
                    onBlur={e  => { e.currentTarget.style.borderColor = isDark ? 'rgba(167,139,250,0.2)' : '#d1d5db' }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--adm-text-muted)' }}>Описание</label>
                <textarea
                  value={item.description}
                  rows={2}
                  onChange={e => setCredentials(prev => prev.map((c, idx) => idx === i ? { ...c, description: e.target.value } : c))}
                  style={{ ...inputStyle, resize: 'none' as const }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#7c3aed' }}
                  onBlur={e  => { e.currentTarget.style.borderColor = isDark ? 'rgba(167,139,250,0.2)' : '#d1d5db' }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Подход */}
        <div
          className="rounded-2xl p-6 space-y-4 transition-colors"
          style={{
            background: 'var(--adm-bg-card)',
            border: '1px solid var(--adm-border-card)',
            opacity: showApproach ? 1 : 0.6,
          }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold" style={{ color: 'var(--adm-text-primary)' }}>Подход к обучению</h3>
            <button
              type="button"
              onClick={() => setShowApproach(v => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${showApproach ? 'bg-purple-600' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${showApproach ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          {approach.map((item, i) => (
            <div key={i} className="rounded-xl p-4 space-y-3" style={subCardStyle}>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--adm-text-muted)' }}>Заголовок</label>
                <input
                  type="text"
                  value={item.title}
                  onChange={e => setApproach(prev => prev.map((a, idx) => idx === i ? { ...a, title: e.target.value } : a))}
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = '#7c3aed' }}
                  onBlur={e  => { e.currentTarget.style.borderColor = isDark ? 'rgba(167,139,250,0.2)' : '#d1d5db' }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--adm-text-muted)' }}>Текст</label>
                <textarea
                  value={item.text}
                  rows={2}
                  onChange={e => setApproach(prev => prev.map((a, idx) => idx === i ? { ...a, text: e.target.value } : a))}
                  style={{ ...inputStyle, resize: 'none' as const }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#7c3aed' }}
                  onBlur={e  => { e.currentTarget.style.borderColor = isDark ? 'rgba(167,139,250,0.2)' : '#d1d5db' }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Кнопка сохранения контента */}
        <div className="flex items-center justify-end gap-3">
          {pageSaved && <span className="text-sm text-green-600 font-medium">✓ Сохранено</span>}
          <button
            type="button"
            onClick={handlePageContentSave}
            disabled={pageSaving}
            className="flex items-center gap-2 bg-purple-600 text-white px-8 py-2.5 rounded-xl font-semibold hover:bg-purple-700 transition-colors shadow-sm disabled:opacity-60"
          >
            {pageSaving ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Сохранение…
              </>
            ) : 'Сохранить страницу'}
          </button>
        </div>
      </div>
    </>
  )
}
