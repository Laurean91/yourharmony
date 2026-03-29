'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { X, Check } from 'lucide-react'
import { createBooking } from '../app/actions'

function ConsentCheckbox() {
  const [checked, setChecked] = useState(false)
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <input type="checkbox" name="pdpaConsent" required checked={checked} onChange={(e) => setChecked(e.target.checked)} className="sr-only" />
      <span className={`mt-0.5 w-5 h-5 rounded-md border-2 shrink-0 flex items-center justify-center transition-all duration-200 ${
        checked
          ? 'bg-purple-600 border-purple-600 shadow-[0_0_0_3px_rgba(147,51,234,0.15)]'
          : 'bg-white/70 border-gray-300 group-hover:border-purple-400'
      }`}>
        {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
      </span>
      <span className="text-xs text-gray-500 leading-relaxed select-none">
        Я даю согласие на обработку персональных данных в соответствии с{' '}
        <a href="/documents#personal-data" target="_blank" onClick={e => e.stopPropagation()} className="text-purple-600 hover:text-purple-800 underline decoration-dotted">
          Политикой конфиденциальности
        </a>
      </span>
    </label>
  )
}

const modalBackdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

const modalContent = {
  hidden: { opacity: 0, scale: 0.92, y: 40 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
  exit: { opacity: 0, scale: 0.92, y: 40, transition: { duration: 0.2, ease: 'easeIn' as const } },
}

export default function BookingModal({ onClose }: { onClose: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    setIsSubmitting(true)
    setError(null)
    try {
      const formData = new FormData(form)
      await createBooking(formData)
      setSuccessMsg(true)
      form.reset()
      closeTimerRef.current = setTimeout(() => {
        setSuccessMsg(false)
        onClose()
      }, 2000)
    } catch {
      setError('Ошибка при отправке. Попробуйте ещё раз.')
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  useEffect(() => {
    return () => { if (closeTimerRef.current) clearTimeout(closeTimerRef.current) }
  }, [])

  return (
    <motion.div
      key="backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ background: 'rgba(0,0,0,0.55)' }}
      variants={modalBackdrop}
      initial="hidden"
      animate="visible"
      exit="exit"
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-md p-8 rounded-3xl bg-white/80 backdrop-blur-xl shadow-2xl border border-white"
        variants={modalContent}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-800"
          aria-label="Закрыть"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-3xl font-bold text-center mb-2">Ждём вас на уроке!</h2>
        <p className="text-center text-gray-500 mb-6 text-sm">Оставьте заявку и мы свяжемся с вами</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            name="parentName"
            required
            placeholder="Ваше Имя"
            className="p-4 rounded-xl bg-white/70 focus:bg-white transition-colors outline-none ring-2 ring-transparent focus:ring-purple-400 border border-white/50"
          />
          <div className="flex gap-4">
            <input
              name="childAge"
              type="number"
              min="1"
              required
              placeholder="Возраст"
              className="w-1/3 p-4 rounded-xl bg-white/70 focus:bg-white outline-none focus:ring-purple-400 border border-white/50"
            />
            <input
              name="phone"
              type="tel"
              required
              placeholder="Телефон"
              className="w-2/3 p-4 rounded-xl bg-white/70 focus:bg-white outline-none focus:ring-purple-400 border border-white/50"
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <ConsentCheckbox />
          <button
            disabled={isSubmitting}
            className="mt-2 p-4 rounded-xl bg-gradient-to-r from-purple-600 to-orange-500 text-white font-bold hover:brightness-110 active:scale-95 transition-all disabled:opacity-70"
          >
            {isSubmitting ? 'Отправляем...' : 'Записаться'}
          </button>
          {successMsg && (
            <p className="text-green-600 text-center font-medium mt-1">
              Заявка успешно отправлена!
            </p>
          )}
        </form>
      </motion.div>
    </motion.div>
  )
}
