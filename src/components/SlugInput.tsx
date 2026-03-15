'use client'

import { useState, useEffect } from 'react'
import slugify from 'slugify'

interface SlugInputProps {
  initialTitle?: string
  initialSlug?: string
  onSlugChange?: (slug: string) => void
}

export default function SlugInput({ initialTitle = '', initialSlug = '', onSlugChange }: SlugInputProps) {
  const [title, setTitle] = useState(initialTitle)
  const [slug, setSlug] = useState(initialSlug)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!initialSlug)

  const generateSlug = (value: string) =>
    slugify(value, {
      lower: true,
      strict: true,
      locale: 'ru',
      trim: true,
    })

  useEffect(() => {
    if (!slugManuallyEdited && title) {
      const generated = generateSlug(title)
      setSlug(generated)
      onSlugChange?.(generated)
    }
  }, [title]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true)
    const clean = value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-')
    setSlug(clean)
    onSlugChange?.(clean)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Заголовок <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Название статьи"
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Slug (ЧПУ-ссылка) <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent">
          <span className="px-3 py-2.5 bg-gray-50 text-gray-500 text-sm border-r border-gray-300 shrink-0">
            /blog/
          </span>
          <input
            type="text"
            name="slug"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            required
            placeholder="moy-post-o-chem-to"
            className="flex-1 px-3 py-2.5 text-gray-900 outline-none text-sm"
          />
        </div>
        {!slugManuallyEdited && (
          <p className="text-xs text-gray-400 mt-1">Генерируется автоматически из заголовка</p>
        )}
      </div>
    </div>
  )
}
