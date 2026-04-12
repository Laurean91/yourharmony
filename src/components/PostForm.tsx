'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import RichTextEditor from './RichTextEditor'
import SlugInput from './SlugInput'
import Image from 'next/image'

interface Category {
  id: string
  name: string
}

interface PostFormProps {
  categories: Category[]
  post?: {
    id: string
    title: string
    slug: string
    excerpt: string | null
    content: string
    coverImage: string | null
    isPublished: boolean
    categoryId: string | null
  }
  action: (formData: FormData) => Promise<void>
  submitLabel: string
}

export default function PostForm({ categories, post, action, submitLabel }: PostFormProps) {
  const router = useRouter()
  const [content, setContent] = useState(post?.content ?? '')
  const [slug, setSlug] = useState(post?.slug ?? '')
  const [coverPreview, setCoverPreview] = useState<string | null>(post?.coverImage ?? null)
  const [isPublished, setIsPublished] = useState(post?.isPublished ?? false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    try {
      const fd = new FormData(e.currentTarget)
      // Поля, управляемые стейтом, передаём явно
      fd.set('content', content)
      fd.set('slug', slug)
      fd.set('isPublished', String(isPublished))
      if (post?.coverImage) fd.set('existingCoverImage', post.coverImage)
      await action(fd)
      router.push('/bigbos/blog')
      router.refresh()
    } catch (err) {
      console.error(err)
      const msg = err instanceof Error ? err.message : 'Ошибка при сохранении. Попробуйте ещё раз.'
      alert(msg)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Title + Slug */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-5">Основное</h2>
        <SlugInput
          initialTitle={post?.title}
          initialSlug={post?.slug}
          onSlugChange={setSlug}
        />
      </div>

      {/* Excerpt */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Краткое описание (excerpt)
        </label>
        <textarea
          name="excerpt"
          defaultValue={post?.excerpt ?? ''}
          rows={3}
          maxLength={300}
          placeholder="Одно-два предложения о чём статья. Отображается в карточке и в метатегах."
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
        />
      </div>

      {/* Cover image */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Обложка статьи</label>
        {coverPreview && (
          <div className="relative aspect-[16/9] max-h-52 overflow-hidden rounded-xl mb-4 border border-gray-200">
            <Image src={coverPreview} alt="Обложка" fill className="object-cover" />
          </div>
        )}
        <input
          type="file"
          name="coverFile"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) setCoverPreview(URL.createObjectURL(file))
          }}
          className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-semibold file:bg-purple-50 dark:file:bg-purple-900/30 file:text-purple-700 dark:file:text-purple-400 hover:file:bg-purple-100 dark:hover:file:bg-purple-900/50"
        />
      </div>

      {/* Content editor */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Содержимое статьи <span className="text-red-500">*</span>
        </label>
        <RichTextEditor
          value={content}
          onChange={setContent}
          placeholder="Начните писать статью..."
        />
      </div>

      {/* Category + Status */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-5">Параметры публикации</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Категория</label>
            <select
              name="categoryId"
              defaultValue={post?.categoryId ?? ''}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            >
              <option value="">— Без категории —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col justify-center">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <button
                type="button"
                role="switch"
                aria-checked={isPublished}
                onClick={() => setIsPublished(!isPublished)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                  isPublished ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                    isPublished ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                  {isPublished ? 'Опубликовано' : 'Черновик'}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {isPublished ? 'Статья видна читателям' : 'Статья скрыта'}
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
        >
          Отмена
        </button>
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
            submitLabel
          )}
        </button>
      </div>
    </form>
  )
}
