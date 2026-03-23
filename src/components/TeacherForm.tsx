'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { updateTeacherProfile, updateTeacherPageContent } from '../app/actions'
import type { TeacherCredential, TeacherApproachItem } from '../app/actions'

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

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Фото */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-5">Фотография</h2>
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
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            />
            <p className="text-xs text-gray-400 mt-2">PNG, JPG, WebP — рекомендуется квадратное фото</p>
          </div>
        </div>
      </div>

      {/* Основные данные */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-5">Основное</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Имя преподавателя <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              defaultValue={teacher.name}
              required
              maxLength={100}
              placeholder="Например: Анна Сергеевна"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Биография <span className="text-red-500">*</span>
            </label>
            <textarea
              name="bio"
              defaultValue={teacher.bio}
              required
              rows={5}
              maxLength={1000}
              placeholder="Расскажите о преподавателе: опыт, специализация, подход к обучению…"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
      </div>

      {/* Значки */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-2">Значки квалификации</h2>
        <p className="text-sm text-gray-400 mb-4">Перечислите через запятую. Отображаются как теги под биографией.</p>
        <input
          type="text"
          name="badges"
          defaultValue={teacher.badges}
          required
          placeholder="Сертификат CELTA, Опыт 7 лет, IELTS 8.0, Дети 6–14 лет"
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
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
          className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
        >
          Отмена
        </button>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-sm text-green-600 font-medium">✓ Сохранено</span>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-purple-600 text-white px-8 py-2.5 rounded-xl font-semibold hover:bg-purple-700 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Сохранение…
              </>
            ) : (
              'Сохранить изменения'
            )}
          </button>
        </div>
      </div>

    </form>

    {/* ─── Контент страницы /teacher ─── */}
    <div className="mt-10 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Страница преподавателя (/teacher)</h2>
          <p className="text-sm text-gray-500">Блоки «Образование и квалификация» и «Подход к обучению»</p>
        </div>

        {/* Квалификация */}
        <div className={`bg-white rounded-2xl border p-6 shadow-sm space-y-4 transition-colors ${showCredentials ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-800">Образование и квалификация</h3>
            <button
              type="button"
              onClick={() => setShowCredentials(v => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${showCredentials ? 'bg-purple-600' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${showCredentials ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          {credentials.map((item, i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50">
              <div className="flex gap-3">
                <div className="w-24 flex-shrink-0">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Иконка</label>
                  <input
                    type="text"
                    value={item.icon}
                    onChange={e => setCredentials(prev => prev.map((c, idx) => idx === i ? { ...c, icon: e.target.value } : c))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="🎓"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Заголовок</label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={e => setCredentials(prev => prev.map((c, idx) => idx === i ? { ...c, title: e.target.value } : c))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Описание</label>
                <textarea
                  value={item.description}
                  rows={2}
                  onChange={e => setCredentials(prev => prev.map((c, idx) => idx === i ? { ...c, description: e.target.value } : c))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Подход */}
        <div className={`bg-white rounded-2xl border p-6 shadow-sm space-y-4 transition-colors ${showApproach ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-800">Подход к обучению</h3>
            <button
              type="button"
              onClick={() => setShowApproach(v => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${showApproach ? 'bg-purple-600' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${showApproach ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          {approach.map((item, i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Заголовок</label>
                <input
                  type="text"
                  value={item.title}
                  onChange={e => setApproach(prev => prev.map((a, idx) => idx === i ? { ...a, title: e.target.value } : a))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Текст</label>
                <textarea
                  value={item.text}
                  rows={2}
                  onChange={e => setApproach(prev => prev.map((a, idx) => idx === i ? { ...a, text: e.target.value } : a))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
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
            className="flex items-center gap-2 bg-purple-600 text-white px-8 py-2.5 rounded-xl font-semibold hover:bg-purple-700 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {pageSaving ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Сохранение…
              </>
            ) : (
              'Сохранить страницу'
            )}
          </button>
        </div>
      </div>
    </>
  )
}
