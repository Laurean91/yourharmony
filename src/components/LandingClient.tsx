'use client'

import { motion, AnimatePresence, useMotionValue, useTransform, useInView } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { Star, BookOpen, Smile, Camera, X, Send, Users, Monitor, Check } from 'lucide-react'
import { getPhotos } from '../app/actions'
import BookingModal from './BookingModal'
import type {
  HeroSettings, FeaturesSettings, FormatsSettings, ContactsSettings,
  HowItWorksSettings, TestimonialsSettings, CtaSettings, FaqSettings,
} from '../lib/landingTypes'
import {
  DEFAULT_HERO, DEFAULT_FEATURES, DEFAULT_FORMATS, DEFAULT_CONTACTS,
  DEFAULT_HOW_IT_WORKS, DEFAULT_TESTIMONIALS, DEFAULT_CTA, DEFAULT_FAQ,
} from '../lib/landingTypes'

/* ───────── Variants ───────── */
const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}

const staggerContainerFast = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const modalBackdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

/* ───────── useCounter ───────── */
function useCounter(target: number, duration = 1.5) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = target / (duration * 60)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 1000 / 60)
    return () => clearInterval(timer)
  }, [inView, target, duration])

  return { count, ref }
}

/* ───────── Hero ───────── */
export function LandingHero({ data = DEFAULT_HERO }: { data?: HeroSettings }) {
  const [showModal, setShowModal] = useState(false)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const blobLeftX  = useTransform(mouseX, [-600, 600], [-20, 20])
  const blobLeftY  = useTransform(mouseY, [-400, 400], [-15, 15])
  const blobRightX = useTransform(mouseX, [-600, 600], [20, -20])
  const blobRightY = useTransform(mouseY, [-400, 400], [15, -15])

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set(e.clientX - rect.left - rect.width / 2)
    mouseY.set(e.clientY - rect.top - rect.height / 2)
  }

  const students = useCounter(data.studentsCount)
  const years    = useCounter(data.yearsCount)
  const rating   = useCounter(Math.round(data.rating * 10), 1.2)

  return (
    <>
      <section
        id="home"
        className="relative overflow-hidden pt-24 pb-32 flex flex-col items-center text-center px-4"
        onMouseMove={handleMouseMove}
      >
        <motion.div
          className="absolute top-[-10rem] left-[-10rem] w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"
          style={{ x: blobLeftX, y: blobLeftY }}
        />
        <motion.div
          className="absolute top-[-10rem] right-[-10rem] w-96 h-96 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"
          style={{ x: blobRightX, y: blobRightY }}
        />

        <motion.h1 initial="hidden" animate="visible" variants={fadeUp}
          className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-orange-500 mb-6">
          {data.title}
        </motion.h1>
        <motion.p initial="hidden" animate="visible" variants={fadeUp}
          className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl">
          {data.subtitle}
        </motion.p>
        <motion.button
          onClick={() => setShowModal(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-4 bg-gradient-to-r from-purple-500 to-orange-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-shadow ring-2 ring-white/30 animate-glow-pulse"
        >
          Записаться на пробное занятие
        </motion.button>

        {/* Stats bar with counter */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp}
          className="flex flex-wrap justify-center gap-8 mt-10">
          <div className="text-center" ref={students.ref}>
            <p className="text-2xl font-extrabold text-purple-600">{students.count}+</p>
            <p className="text-sm text-gray-500">учеников</p>
          </div>
          <div className="text-center" ref={years.ref}>
            <p className="text-2xl font-extrabold text-orange-500">{years.count} года</p>
            <p className="text-sm text-gray-500">работаем</p>
          </div>
          <div className="text-center" ref={rating.ref}>
            <p className="text-2xl font-extrabold text-yellow-500">★ {(rating.count / 10).toFixed(1)}</p>
            <p className="text-sm text-gray-500">средняя оценка</p>
          </div>
        </motion.div>
      </section>

      <AnimatePresence>
        {showModal && <BookingModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </>
  )
}

/* ───────── Features + Gallery ───────── */
const FEATURE_ICONS = [
  <Smile className="w-10 h-10 text-purple-500" key="smile" />,
  <BookOpen className="w-10 h-10 text-orange-500" key="book" />,
  <Star className="w-10 h-10 text-yellow-500" key="star" />,
]

export function LandingTop({
  features = DEFAULT_FEATURES,
  formats = DEFAULT_FORMATS,
}: {
  features?: FeaturesSettings
  formats?: FormatsSettings
}) {
  const [photos, setPhotos] = useState<{ id: string; url: string }[]>([])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    getPhotos().then(setPhotos).catch(() => null)
  }, [])

  return (
    <>
      {/* ПРЕИМУЩЕСТВА */}
      <section id="about" className="py-20 px-4 max-w-6xl mx-auto">
        {/* Описание клуба */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          className="mb-12 text-center max-w-3xl mx-auto">
          <p className="text-sm font-bold uppercase tracking-widest text-purple-500 mb-3">О клубе</p>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Почему выбирают нас</h2>
          <p className="text-gray-500 text-lg leading-relaxed">{features.description}</p>
        </motion.div>

        {/* Карточки со stagger */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.items.map((item, idx) => (
            <motion.div key={idx} variants={fadeUp}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="p-8 pb-10 rounded-3xl bg-white/40 backdrop-blur-lg border border-white/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] transition-shadow hover:shadow-xl">
              <div className="mb-4">{FEATURE_ICONS[idx % FEATURE_ICONS.length]}</div>
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed">{item.text}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ФОРМАТЫ ОБУЧЕНИЯ */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          className="mb-14 text-center max-w-3xl mx-auto">
          <p className="text-sm font-bold uppercase tracking-widest text-orange-500 mb-3">Форматы</p>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Выберите свой формат обучения</h2>
          <p className="text-gray-500 text-lg leading-relaxed">{formats.subtitle}</p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Групповые занятия */}
          <motion.div
            variants={fadeUp}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className="relative overflow-hidden rounded-3xl bg-white/40 backdrop-blur-lg border border-white/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] p-8 hover:shadow-xl transition-shadow"
          >
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-purple-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20 pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-indigo-300 rounded-full mix-blend-multiply filter blur-2xl opacity-20 pointer-events-none" />
            <div className="absolute top-6 right-6 w-16 h-16 border-4 border-purple-200 rounded-full opacity-50 pointer-events-none" />
            <div className="absolute bottom-12 right-10 w-8 h-8 bg-purple-300 rounded-full opacity-30 pointer-events-none" />

            <div className="relative">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 shadow-lg mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="inline-block ml-3 mb-6 align-middle px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wider">
                Офлайн
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 mb-2">{formats.groupTitle}</h3>
              <p className="text-gray-500 mb-6 leading-relaxed">{formats.groupDescription}</p>
              <ul className="space-y-3">
                {formats.groupBullets.map((item, i) => (
                  <motion.li key={i} variants={fadeUp} className="flex items-start gap-3 text-gray-700">
                    <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
                      <Check className="w-3 h-3 text-purple-600" />
                    </span>
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Индивидуальные онлайн занятия */}
          <motion.div
            variants={fadeUp}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className="relative overflow-hidden rounded-3xl bg-white/40 backdrop-blur-lg border border-white/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] p-8 hover:shadow-xl transition-shadow"
          >
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-orange-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20 pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-yellow-300 rounded-full mix-blend-multiply filter blur-2xl opacity-20 pointer-events-none" />
            <div className="absolute top-6 right-6 w-10 h-10 border-4 border-orange-200 rounded-lg opacity-50 rotate-12 pointer-events-none" />
            <div className="absolute bottom-10 right-8 w-6 h-6 bg-orange-300 rounded-sm opacity-30 rotate-45 pointer-events-none" />
            <div className="absolute bottom-20 right-14 w-10 h-10 border-2 border-orange-200 rounded-full opacity-40 pointer-events-none" />

            <div className="relative">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-400 shadow-lg mb-6">
                <Monitor className="w-8 h-8 text-white" />
              </div>
              <div className="inline-block ml-3 mb-6 align-middle px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider">
                Онлайн
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 mb-2">{formats.individualTitle}</h3>
              <p className="text-gray-500 mb-6 leading-relaxed">{formats.individualDescription}</p>
              <ul className="space-y-3">
                {formats.individualBullets.map((item, i) => (
                  <motion.li key={i} variants={fadeUp} className="flex items-start gap-3 text-gray-700">
                    <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center">
                      <Check className="w-3 h-3 text-orange-600" />
                    </span>
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ГАЛЕРЕЯ */}
      <section id="lessons" className="py-20 px-4 bg-white/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="text-4xl font-bold text-center mb-12">
            <Camera className="inline mr-3" />Как проходят занятия
          </motion.h2>
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

/* ───────── Contacts ───────── */
export function LandingContacts({ data = DEFAULT_CONTACTS }: { data?: ContactsSettings }) {
  return (
    <motion.section
      id="contacts"
      className="py-20 px-4 max-w-6xl mx-auto"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeUp}
    >
      <div className="bg-white/50 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-xl border border-white flex flex-col md:flex-row gap-12 items-center">
        <div className="flex-1">
          <h2 className="text-4xl font-bold mb-6">Как нас найти</h2>
          <p className="text-gray-600 mb-8 text-lg">{data.description}</p>
          <motion.div
            className="space-y-4"
            variants={staggerContainerFast}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeUp} className="flex items-center gap-4 text-gray-700">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="font-bold">Адрес</p>
                <p>{data.address}</p>
              </div>
            </motion.div>
            <motion.div variants={fadeUp} className="flex items-center gap-4 text-gray-700">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p className="font-bold">Телефон</p>
                <p>{data.phone}</p>
              </div>
            </motion.div>
            <motion.div variants={fadeUp} className="flex gap-3 pt-2">
              <a href={data.telegramUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500 text-white text-sm font-semibold hover:bg-sky-600 transition-colors">
                <Send className="w-4 h-4" />Telegram
              </a>
            </motion.div>
          </motion.div>
        </div>
        <div className="w-full md:w-1/2 h-80 rounded-2xl overflow-hidden shadow-inner">
          <iframe
            src="https://yandex.ru/map-widget/v1/?text=%D0%90%D1%80%D0%BC%D0%B0%D0%B2%D0%B8%D1%80%D1%81%D0%BA%D0%B0%D1%8F+%D1%83%D0%BB%D0%B8%D1%86%D0%B0+1%2F20%2C+%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D0%B0&z=16&l=map"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            title="Языковой клуб Гармония на карте"
          />
        </div>
      </div>
    </motion.section>
  )
}

/* ───────── HowItWorks ───────── */
const STEP_STYLES = [
  { num: '01', color: 'text-purple-500', bg: 'bg-purple-100' },
  { num: '02', color: 'text-orange-500', bg: 'bg-orange-100' },
  { num: '03', color: 'text-yellow-500', bg: 'bg-yellow-100' },
]

export function HowItWorksSection({ data = DEFAULT_HOW_IT_WORKS }: { data?: HowItWorksSettings }) {
  const [showModal, setShowModal] = useState(false)

  const steps = data.items.map((item, i) => ({
    ...STEP_STYLES[i % STEP_STYLES.length],
    title: item.title,
    text: item.text,
  }))

  return (
    <>
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          className="mb-14 text-center max-w-3xl mx-auto">
          <p className="text-sm font-bold uppercase tracking-widest text-purple-500 mb-3">Начало</p>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Как начать заниматься</h2>
          <p className="text-gray-500 text-lg leading-relaxed">
            Всего три шага отделяют вашего ребёнка от первого занятия в клубе «Гармония».
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {steps.map((step, idx) => (
            <motion.div key={idx} variants={fadeUp}
              className="relative p-8 rounded-3xl bg-white/40 backdrop-blur-lg border border-white/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]">
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${step.bg} mb-5`}>
                <span className={`text-2xl font-extrabold ${step.color}`}>{step.num}</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">{step.title}</h3>
              <p className="text-gray-600 leading-relaxed">{step.text}</p>
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 text-gray-300 text-2xl font-bold z-10">→</div>
              )}
            </motion.div>
          ))}
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          className="mt-10 text-center">
          <motion.button
            onClick={() => setShowModal(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-orange-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-shadow">
            Записаться на пробное занятие
          </motion.button>
        </motion.div>
      </section>

      <AnimatePresence>
        {showModal && <BookingModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </>
  )
}

/* ───────── Testimonials ───────── */
const VISIBLE = 3
const GAP = 24 // px, соответствует gap-6

export function TestimonialsSection({ data = DEFAULT_TESTIMONIALS }: { data?: TestimonialsSettings }) {
  const reviews = data.items
  const trackRef = useRef<HTMLDivElement>(null)
  const [cardWidth, setCardWidth] = useState(0)
  const [current, setCurrent] = useState(0)
  const [dragging, setDragging] = useState(false)
  const total = reviews.length
  const x = useMotionValue(0)

  // Вычисляем ширину одной карточки по ширине трека
  useEffect(() => {
    const calc = () => {
      if (trackRef.current) {
        const w = trackRef.current.offsetWidth
        setCardWidth((w - GAP * (VISIBLE - 1)) / VISIBLE)
      }
    }
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [])

  const stepPx = cardWidth + GAP

  const goTo = (idx: number) => {
    const clamped = Math.max(0, Math.min(idx, total - VISIBLE))
    setCurrent(clamped)
    x.set(-(clamped * stepPx))
  }

  const prev = () => goTo(current - 1)
  const next = () => goTo(current + 1)

  // Автопрокрутка
  useEffect(() => {
    if (!stepPx) return
    const id = setInterval(() => {
      setCurrent(c => {
        const next = c >= total - VISIBLE ? 0 : c + 1
        x.set(-(next * stepPx))
        return next
      })
    }, 4000)
    return () => clearInterval(id)
  }, [stepPx, total, x])

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    setDragging(false)
    const threshold = stepPx * 0.25
    if (info.offset.x < -threshold) goTo(current + 1)
    else if (info.offset.x > threshold) goTo(current - 1)
    else x.set(-(current * stepPx))
  }

  const maxIdx = total - VISIBLE

  return (
    <section className="py-20 px-4 bg-white/30 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          className="mb-14 text-center max-w-3xl mx-auto">
          <p className="text-sm font-bold uppercase tracking-widest text-orange-500 mb-3">Отзывы</p>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Что говорят родители</h2>
          <div className="flex items-center justify-center gap-2 text-yellow-500 text-2xl font-bold mb-2">
            {'★★★★★'}
            <span className="text-gray-700 text-lg font-semibold ml-1">5.0</span>
            <span className="text-gray-400 text-base font-normal">(40+ отзывов)</span>
          </div>
        </motion.div>

        {/* Трек карусели */}
        <div ref={trackRef} className="overflow-hidden">
          <motion.div
            className="flex"
            style={{ x, gap: GAP, cursor: dragging ? 'grabbing' : 'grab' }}
            drag="x"
            dragConstraints={{ left: -(maxIdx * stepPx), right: 0 }}
            dragElastic={0.08}
            animate={{ x: -(current * stepPx) }}
            transition={{ type: 'spring', stiffness: 300, damping: 35 }}
            onDragStart={() => setDragging(true)}
            onDragEnd={handleDragEnd}
          >
            {reviews.map((r, idx) => (
              <motion.div
                key={idx}
                style={{ minWidth: cardWidth || `calc((100% - ${GAP * (VISIBLE - 1)}px) / ${VISIBLE})` }}
                whileHover={dragging ? {} : { y: -4, transition: { duration: 0.2 } }}
                className="p-6 rounded-3xl bg-white/60 backdrop-blur-lg border border-white/60 shadow-[0_4px_24px_0_rgba(31,38,135,0.06)] select-none"
              >
                <div className="text-yellow-400 text-sm mb-3">★★★★★</div>
                <p className="text-gray-700 leading-relaxed mb-5 italic">&ldquo;{r.text}&rdquo;</p>
                <div className="border-t border-gray-100 pt-4">
                  <p className="font-bold text-gray-900">{r.name}</p>
                  <p className="text-sm text-gray-500">{r.child} · {r.duration}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Навигация */}
        <div className="flex items-center justify-center gap-4 mt-10">
          <button
            onClick={prev}
            disabled={current === 0}
            className="w-10 h-10 rounded-full bg-white/70 border border-white/60 shadow flex items-center justify-center text-gray-600 hover:bg-white transition-colors disabled:opacity-30"
            aria-label="Назад"
          >←</button>

          <div className="flex gap-2">
            {reviews.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`rounded-full transition-all duration-300 ${i === current ? 'w-5 h-2.5 bg-purple-500' : 'w-2.5 h-2.5 bg-gray-300'}`}
                aria-label={`Отзыв ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={next}
            disabled={current >= maxIdx}
            className="w-10 h-10 rounded-full bg-white/70 border border-white/60 shadow flex items-center justify-center text-gray-600 hover:bg-white transition-colors disabled:opacity-30"
            aria-label="Вперёд"
          >→</button>
        </div>
      </div>
    </section>
  )
}

/* ───────── CTA mid-page ───────── */
export function CtaSection({ data = DEFAULT_CTA }: { data?: CtaSettings }) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <section className="py-20 px-4">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-r from-purple-500 to-orange-500 p-10 md:p-14 text-center shadow-2xl relative overflow-hidden"
        >
          <div className="absolute -top-16 -left-16 w-64 h-64 bg-white rounded-full opacity-5 pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-white rounded-full opacity-5 pointer-events-none" />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">{data.headline}</h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">{data.subtext}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                onClick={() => setShowModal(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-purple-600 font-bold rounded-full shadow-lg hover:shadow-xl transition-shadow">
                Записаться сейчас
              </motion.button>
              <a href={data.telegramUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-8 py-4 rounded-full border-2 border-white/50 text-white font-semibold hover:bg-white/10 transition-colors">
                <Send className="w-4 h-4" />
                Написать в Telegram
              </a>
            </div>
            <p className="text-white/60 text-sm mt-5">{data.footer}</p>
          </div>
        </motion.div>
      </section>

      <AnimatePresence>
        {showModal && <BookingModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </>
  )
}

/* ───────── FAQ ───────── */
export function FAQSection({ data = DEFAULT_FAQ }: { data?: FaqSettings }) {
  const [open, setOpen] = useState<number | null>(null)
  const faqs = data.items

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <section className="py-20 px-4 max-w-4xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
        className="mb-14 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-purple-500 mb-3">FAQ</p>
        <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Частые вопросы</h2>
        <p className="text-gray-500 text-lg">Всё, что родители спрашивают чаще всего.</p>
      </motion.div>

      <motion.div
        className="space-y-3"
        variants={staggerContainerFast}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {faqs.map((faq, idx) => (
          <motion.div key={idx} variants={fadeUp}
            className="rounded-2xl bg-white/50 backdrop-blur-lg border border-white/60 shadow-sm overflow-hidden">
            <button
              onClick={() => setOpen(open === idx ? null : idx)}
              className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left font-semibold text-gray-900 hover:bg-white/40 transition-colors">
              <span>{faq.q}</span>
              <motion.span
                animate={{ rotate: open === idx ? 45 : 0 }}
                transition={{ duration: 0.2 }}
                className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-lg leading-none">
                +
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {open === idx && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <p className="px-6 pb-5 text-gray-600 leading-relaxed">{faq.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}

/* ───────── LandingBottom (kept for backward-compat but now empty) ───────── */
export function LandingBottom() {
  return null
}
