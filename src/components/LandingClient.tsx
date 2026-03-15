'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Star, BookOpen, Smile, Camera, X } from 'lucide-react'
import { getPhotos } from '../app/actions'

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }

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

/* ───────── Booking Modal ───────── */
function BookingModal({ onClose }: { onClose: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget  // capture BEFORE any await
    setIsSubmitting(true)
    const formData = new FormData(form)
    const { createBooking } = await import('../app/actions')
    await createBooking(formData)
    setIsSubmitting(false)
    setSuccessMsg(true)
    form.reset()
    setTimeout(() => {
      setSuccessMsg(false)
      onClose()
    }, 2000)
  }

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

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
        {/* Close button */}
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
              min="6"
              max="18"
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
          <button
            disabled={isSubmitting}
            className="mt-2 p-4 rounded-xl bg-gradient-to-r from-purple-600 to-orange-500 text-white font-bold hover:brightness-110 active:scale-95 transition-all disabled:opacity-70"
          >
            {isSubmitting ? 'Отправляем...' : 'Записаться'}
          </button>
          {successMsg && (
            <p className="text-green-600 text-center font-medium mt-1">
              ✅ Заявка успешно отправлена!
            </p>
          )}
        </form>
      </motion.div>
    </motion.div>
  )
}

/* ───────── Hero ───────── */
export function LandingHero() {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <section className="relative overflow-hidden pt-24 pb-32 flex flex-col items-center text-center px-4">
        <div className="absolute top-[-10rem] left-[-10rem] w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute top-[-10rem] right-[-10rem] w-96 h-96 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />

        <motion.h1 initial="hidden" animate="visible" variants={fadeUp}
          className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-orange-500 mb-6">
          Клуб &quot;Гармония&quot;
        </motion.h1>
        <motion.p initial="hidden" animate="visible" variants={fadeUp}
          className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl">
          Английский для детей от 6 лет. Учим язык играючи, свободно и в радость!
        </motion.p>
        <motion.button
          onClick={() => setShowModal(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-4 bg-gradient-to-r from-purple-500 to-orange-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-shadow relative"
        >
          <span className="relative z-10">Записаться на пробное занятие</span>
          <div className="absolute inset-0 bg-white rounded-full opacity-20 animate-ping" />
        </motion.button>
      </section>

      <AnimatePresence>
        {showModal && <BookingModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </>
  )
}

/* ───────── Features + Gallery ───────── */
export function LandingTop() {
  const [photos, setPhotos] = useState<any[]>([])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    getPhotos().then(setPhotos)
  }, [])

  return (
    <>
      {/* ПРЕИМУЩЕСТВА */}
      <section className="py-20 px-4 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: <Smile className="w-10 h-10 text-purple-500" />, title: 'Игровая форма', text: 'Никакой скучной зубрежки.' },
          { icon: <BookOpen className="w-10 h-10 text-orange-500" />, title: 'Живое общение', text: 'Разговорная практика с первого урока.' },
          { icon: <Star className="w-10 h-10 text-yellow-500" />, title: 'Уютная атмосфера', text: 'Комфорт и поддержка преподавателей.' },
        ].map((item, idx) => (
          <motion.div key={idx} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="p-8 pb-10 rounded-3xl bg-white/40 backdrop-blur-lg border border-white/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] hover:-translate-y-2 transition-transform">
            <div className="mb-4">{item.icon}</div>
            <h3 className="text-xl font-bold mb-2">{item.title}</h3>
            <p className="text-gray-600">{item.text}</p>
          </motion.div>
        ))}
      </section>

      {/* ГАЛЕРЕЯ */}
      <section className="py-20 px-4 bg-white/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">
            <Camera className="inline mr-3" />Как проходят занятия
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {photos.map((photo, idx) => (
              <motion.div key={photo.id} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="overflow-hidden rounded-2xl cursor-pointer aspect-square bg-gray-200"
                onClick={() => setSelectedImage(photo.url)}>
                <motion.img whileHover={{ scale: 1.1 }} src={photo.url} alt="Занятие"
                  className="w-full h-full object-cover transition-transform" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Модальное окно галереи */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
            variants={modalBackdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setSelectedImage(null)}
          >
            <button className="absolute top-6 right-6 text-white"><X className="w-8 h-8" /></button>
            <img src={selectedImage} className="max-w-full max-h-[90vh] rounded-xl" alt="Увеличенное фото" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/* ───────── LandingBottom (kept for backward-compat but now empty) ───────── */
export function LandingBottom() {
  return null
}
