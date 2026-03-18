'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { updateTeacherProfile } from '../app/actions'

interface TeacherProfile {
  name: string
  bio: string
  photoUrl: string | null
  badges: string
}

export default function TeacherForm({ teacher }: { teacher: TeacherProfile }) {
  const router = useRouter()
  const [photoPreview, setPhotoPreview] = useState<string | null>(teacher.photoUrl)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

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

  return (
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

      {/* Кнопки */}
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
  )
}
