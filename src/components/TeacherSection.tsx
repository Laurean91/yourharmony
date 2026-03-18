'use client'

import { motion } from 'framer-motion'

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }

const badges = ['Сертификат CELTA', 'Опыт 7 лет', 'IELTS 8.0', 'Дети 6–14 лет']

export default function TeacherSection() {
  return (
    <section id="teacher" className="py-20 px-4 max-w-6xl mx-auto">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        className="bg-white/50 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-xl border border-white flex flex-col md:flex-row gap-10 items-center"
      >
        {/* Аватар */}
        <div className="flex-shrink-0">
          <div className="w-40 h-40 rounded-full bg-gradient-to-br from-purple-400 to-orange-400 flex items-center justify-center shadow-lg">
            <span className="text-5xl font-extrabold text-white">АС</span>
          </div>
        </div>

        {/* Текст */}
        <div className="flex-1 text-center md:text-left">
          <p className="text-sm font-bold uppercase tracking-widest text-purple-500 mb-1">Ваш преподаватель</p>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Анна Сергеевна</h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-6">
            Сертифицированный преподаватель английского языка с опытом 7 лет. Специализируется на
            обучении детей от 6 до 14 лет — в игровой форме, без скучной зубрёжки. Каждый ребёнок
            уходит с занятия с улыбкой и новыми знаниями.
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-2">
            {badges.map((badge) => (
              <span
                key={badge}
                className="px-4 py-1.5 rounded-full text-sm font-semibold bg-purple-100 text-purple-700 border border-purple-200"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
