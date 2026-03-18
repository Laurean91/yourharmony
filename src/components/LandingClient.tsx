'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Star, BookOpen, Smile, Camera, X, MessageCircle, Send } from 'lucide-react'
import { getPhotos } from '../app/actions'
import BookingModal from './BookingModal'

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }

const modalBackdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

/* ───────── Hero ───────── */
export function LandingHero() {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <section id="home" className="relative overflow-hidden pt-24 pb-32 flex flex-col items-center text-center px-4">
        <div className="absolute top-[-10rem] left-[-10rem] w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute top-[-10rem] right-[-10rem] w-96 h-96 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />

        <motion.h1 initial="hidden" animate="visible" variants={fadeUp}
          className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-orange-500 mb-6">
          Языковой клуб &quot;Гармония&quot;
        </motion.h1>
        <motion.p initial="hidden" animate="visible" variants={fadeUp}
          className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl">
          Английский для детей от 6 лет. Учим язык играючи, свободно и в радость!
        </motion.p>
        <motion.button
          onClick={() => setShowModal(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-4 bg-gradient-to-r from-purple-500 to-orange-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-shadow ring-2 ring-white/30"
        >
          Записаться на пробное занятие
        </motion.button>

        <motion.div initial="hidden" animate="visible" variants={fadeUp}
          className="flex flex-wrap justify-center gap-8 mt-10">
          {[
            { value: '50+', label: 'учеников', color: 'text-purple-600' },
            { value: '3 года', label: 'работаем', color: 'text-orange-500' },
            { value: '★ 5.0', label: 'средняя оценка', color: 'text-yellow-500' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      <AnimatePresence>
        {showModal && <BookingModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </>
  )
}

/* ───────── Features + Gallery ───────── */
export function LandingTop() {
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
          <p className="text-gray-500 text-lg leading-relaxed">
            «Гармония» — это языковой клуб для детей от 6 лет, где английский изучают через игру, диалог и творчество.
            Маленькие группы до 8 человек, занятия 2 раза в неделю, прогресс уже после первого месяца.
          </p>
        </motion.div>

        {/* Карточки */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: <Smile className="w-10 h-10 text-purple-500" />, title: 'Игровая форма', text: 'Уроки построены на играх, песнях и сценках. Дети учатся незаметно для себя — без стресса и зубрёжки.' },
            { icon: <BookOpen className="w-10 h-10 text-orange-500" />, title: 'Живое общение', text: 'Разговорная практика с первого занятия. Дети говорят, слушают и понимают — не только читают тексты.' },
            { icon: <Star className="w-10 h-10 text-yellow-500" />, title: 'Уютная атмосфера', text: 'Маленькие группы, внимательный преподаватель, поддержка на каждом шагу. Каждый ребёнок чувствует себя уверенно.' },
          ].map((item, idx) => (
            <motion.div key={idx} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="p-8 pb-10 rounded-3xl bg-white/40 backdrop-blur-lg border border-white/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] hover:-translate-y-2 transition-transform">
              <div className="mb-4">{item.icon}</div>
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ГАЛЕРЕЯ */}
      <section id="lessons" className="py-20 px-4 bg-white/30 backdrop-blur-sm">
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

/* ───────── Contacts ───────── */
export function LandingContacts() {
  return (
    <section id="contacts" className="py-20 px-4 max-w-6xl mx-auto">
      <div className="bg-white/50 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-xl border border-white flex flex-col md:flex-row gap-12 items-center">
        <div className="flex-1">
          <h2 className="text-4xl font-bold mb-6">Ждем вас в гости!</h2>
          <p className="text-gray-600 mb-8 text-lg">
            Мы находимся в самом центре города. Приходите на пробное занятие, познакомьтесь с преподавателями и атмосферой нашего клуба.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-gray-700">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="font-bold">Адрес</p>
                <p>ул. Мира, д. 15, офис 302</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-gray-700">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p className="font-bold">Телефон</p>
                <p>+7 (999) 123-45-67</p>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <a href="https://t.me/yourharmony_club" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500 text-white text-sm font-semibold hover:bg-sky-600 transition-colors">
                <Send className="w-4 h-4" />Telegram
              </a>
              <a href="https://wa.me/79991234567" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition-colors">
                <MessageCircle className="w-4 h-4" />WhatsApp
              </a>
            </div>
          </div>
        </div>
        <div className="w-full md:w-1/2 h-80 rounded-2xl overflow-hidden shadow-inner">
          <iframe
            src="https://yandex.ru/map-widget/v1/?text=%D1%83%D0%BB.%20%D0%9C%D0%B8%D1%80%D0%B0%2C%20%D0%B4.%2015&z=16&l=map"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            title="Карта"
          />
        </div>
      </div>
    </section>
  )
}

/* ───────── LandingBottom (kept for backward-compat but now empty) ───────── */
export function LandingBottom() {
  return null
}
