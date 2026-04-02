'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

export default function DesignDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-orange-50 overflow-hidden relative font-sans text-gray-800">
      {/* Background blobs for premium feel */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse" style={{ animationDuration: '6s' }}></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse" style={{ animationDuration: '10s' }}></div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-20 pb-32 flex flex-col lg:flex-row items-center justify-between min-h-screen border-none">
        
        {/* Text Content */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="lg:w-1/2 text-center lg:text-left pt-12 lg:pt-0"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-block bg-white px-5 py-2 rounded-full shadow-sm text-indigo-600 font-bold text-sm mb-6 border border-indigo-100 tracking-wide"
          >
            ✨ Английский язык для детей от 4 лет
          </motion.div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 tracking-tight mb-8 leading-[1.15]">
            Откройте мир <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-orange-500">
              английского
            </span> <br/>
            для вашего ребенка
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
            В клубе «Гармония» дети учатся говорить на английском легко и с удовольствием. Игровая форма, заботливые преподаватели и полное погружение в языковую среду!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(79, 70, 229, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-600/30 transition-all"
            >
              Записаться на пробное
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05, backgroundColor: "#f8fafc" }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-gray-800 px-8 py-4 rounded-2xl font-bold text-lg shadow-sm border-2 border-gray-200 transition-all flex items-center justify-center gap-2"
            >
              Узнать тарифы
            </motion.button>
          </div>
          
          <div className="mt-12 flex items-center justify-center lg:justify-start gap-4 text-sm text-gray-500 font-medium">
            <div className="flex -space-x-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-lg z-30 shadow-sm">👶</div>
              <div className="w-10 h-10 rounded-full bg-orange-100 border-2 border-white flex items-center justify-center text-lg z-20 shadow-sm">🧒</div>
              <div className="w-10 h-10 rounded-full bg-pink-100 border-2 border-white flex items-center justify-center text-lg z-10 shadow-sm">👧</div>
            </div>
            <span className="text-base text-gray-600">Уже <strong className="text-gray-900">150+</strong> счастливых учеников</span>
          </div>
        </motion.div>

        {/* Animated Image Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="lg:w-1/2 mt-20 lg:mt-0 relative"
        >
          {/* Decorative background glow behind image */}
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-400 to-orange-300 rounded-[3rem] blur-3xl opacity-40 mix-blend-multiply"></div>
          
          <motion.div
             animate={{ 
               y: [0, -20, 0],
               rotate: [0, 1.5, -1.5, 0]
             }}
             transition={{ 
               duration: 6, 
               repeat: Infinity,
               ease: "easeInOut" 
             }}
             className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] border-8 border-white bg-white w-full max-w-[500px] aspect-square mx-auto lg:mx-0 lg:ml-auto"
          >
            <Image 
              src="/kids_learning_hero.png" 
              alt="Счастливый ребенок изучает английский" 
              fill
              className="object-cover"
              priority
            />
          </motion.div>
          
          {/* Floating decorative elements */}
          <motion.div 
            animate={{ y: [0, -15, 0] }} 
            transition={{ duration: 4, repeat: Infinity, delay: 1 }}
            className="absolute -top-6 lg:-top-10 right-0 lg:-right-4 bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-xl flex items-center gap-4 z-20 border border-white/50"
          >
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl shadow-inner">✨</div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Оценка</p>
              <p className="text-base font-black text-gray-800">5.0 на Яндексе</p>
            </div>
          </motion.div>
          
          <motion.div 
             animate={{ y: [0, 15, 0] }} 
             transition={{ duration: 5, repeat: Infinity, delay: 2 }}
             className="absolute -bottom-6 lg:-bottom-10 left-0 lg:-left-8 bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-xl flex items-center gap-4 z-20 border border-white/50"
          >
             <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-2xl shadow-inner">🇬🇧</div>
             <div>
               <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Методика</p>
               <p className="text-base font-black text-gray-800">Cambridge</p>
             </div>
          </motion.div>

        </motion.div>
      </main>
    </div>
  )
}
