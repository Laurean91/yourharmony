'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'

const slideLeft  = { hidden: { opacity: 0, x: -50 }, visible: { opacity: 1, x: 0, transition: { duration: 0.6 } } }
const slideRight = { hidden: { opacity: 0, x: 50  }, visible: { opacity: 1, x: 0, transition: { duration: 0.6 } } }

const badgeContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
}
const badgeItem = { hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } } }

interface TeacherSectionProps {
  name?: string
  bio?: string
  photoUrl?: string | null
  badges?: string[]
}

const DEFAULT_NAME = 'Анна Сергеевна'
const DEFAULT_BIO = 'Сертифицированный преподаватель английского языка с опытом 7 лет. Специализируется на обучении детей от 4 до 14 лет — в игровой форме, без скучной зубрёжки. Каждый ребёнок уходит с занятия с улыбкой и новыми знаниями.'
const DEFAULT_BADGES = ['Сертификат CELTA', 'Опыт 7 лет', 'IELTS 8.0', 'Дети 4–14 лет']

export default function TeacherSection({ name = DEFAULT_NAME, bio = DEFAULT_BIO, photoUrl, badges = DEFAULT_BADGES }: TeacherSectionProps) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <section id="teacher" className="py-20 px-4 max-w-6xl mx-auto">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="bg-white/50 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-xl border border-white flex flex-col md:flex-row gap-10 items-center overflow-hidden"
      >
        {/* Аватар — slide-in слева */}
        <motion.div variants={slideLeft} className="flex-shrink-0">
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={name}
              width={160}
              height={160}
              className="w-40 h-40 rounded-full object-cover shadow-lg"
            />
          ) : (
            <div className="w-40 h-40 rounded-full bg-gradient-to-br from-purple-400 to-orange-400 flex items-center justify-center shadow-lg">
              <span className="text-5xl font-extrabold text-white">{initials}</span>
            </div>
          )}
        </motion.div>

        {/* Текст — slide-in справа */}
        <motion.div variants={slideRight} className="flex-1 text-center md:text-left">
          <p className="text-sm font-bold uppercase tracking-widest text-purple-500 mb-1">Ваш преподаватель</p>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">{name}</h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-6">{bio}</p>
          <motion.div
            className="flex flex-wrap justify-center md:justify-start gap-2"
            variants={badgeContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {badges.map((badge) => (
              <motion.span
                key={badge}
                variants={badgeItem}
                className="px-4 py-1.5 rounded-full text-sm font-semibold bg-purple-100 text-purple-700 border border-purple-200"
              >
                {badge}
              </motion.span>
            ))}
          </motion.div>
          <motion.div variants={slideRight} className="mt-6 flex justify-center md:justify-start">
            <Link
              href="/teacher"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-purple-600 hover:text-purple-800 transition-colors"
            >
              Подробнее →
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}
