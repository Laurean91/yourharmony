'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Camera, Trash2, Loader2 } from 'lucide-react'

interface Props {
  studentId: string
  photoUrl: string | null
  initials: string
}

export default function StudentPhotoUpload({ studentId, photoUrl, initials }: Props) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(photoUrl)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    setError(null)
    const fd = new FormData()
    fd.append('file', file)

    startTransition(async () => {
      try {
        const res = await fetch(`/api/parent/student/${studentId}/photo`, {
          method: 'POST',
          body: fd,
        })
        if (!res.ok) {
          const { error: msg } = await res.json()
          setError(msg ?? 'Ошибка загрузки')
          return
        }
        const { url } = await res.json()
        setPreview(url)
        router.refresh()
      } catch {
        setError('Ошибка соединения')
      }
    })
  }

  async function handleDelete() {
    setError(null)
    startTransition(async () => {
      try {
        const res = await fetch(`/api/parent/student/${studentId}/photo`, { method: 'DELETE' })
        if (!res.ok) { setError('Ошибка удаления'); return }
        setPreview(null)
        router.refresh()
      } catch {
        setError('Ошибка соединения')
      }
    })
  }

  return (
    <div className="relative flex-shrink-0" style={{ width: 100, height: 100 }}>
      {/* hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />

      {/* Avatar area — clickable */}
      <button
        type="button"
        disabled={isPending}
        onClick={() => inputRef.current?.click()}
        className="absolute inset-[12px] rounded-full overflow-hidden group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
        aria-label="Загрузить фото ребёнка"
        style={{ boxShadow: '0 4px 12px rgba(139,92,246,0.35)' }}
      >
        {preview ? (
          <Image
            src={preview}
            alt="Фото ребёнка"
            fill
            sizes="84px"
            className="object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #F97316 100%)' }}
          >
            <span className="text-2xl font-extrabold text-white select-none">{initials}</span>
          </div>
        )}

        {/* hover / loading overlay */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center gap-0.5 rounded-full transition-opacity duration-200 ${
            isPending ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
          style={{ background: 'rgba(0,0,0,0.45)' }}
        >
          {isPending ? (
            <Loader2 size={20} className="text-white animate-spin" />
          ) : (
            <>
              <Camera size={18} className="text-white" />
              <span className="text-[9px] text-white font-semibold leading-tight">
                {preview ? 'Изменить' : 'Добавить'}
              </span>
            </>
          )}
        </div>
      </button>

      {/* Delete button — shown only when photo exists */}
      {preview && !isPending && (
        <button
          type="button"
          onClick={handleDelete}
          className="absolute -top-1 -right-1 flex items-center justify-center w-6 h-6 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-red-50 hover:border-red-300 transition-colors cursor-pointer"
          aria-label="Удалить фото"
          title="Удалить фото"
        >
          <Trash2 size={11} className="text-gray-400 hover:text-red-500" />
        </button>
      )}

      {/* Error tooltip */}
      {error && (
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 whitespace-nowrap text-[10px] text-red-600 font-medium bg-red-50 border border-red-200 px-2 py-0.5 rounded-full z-10"
        >
          {error}
        </div>
      )}
    </div>
  )
}
