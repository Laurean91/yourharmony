'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

export default function BentoDesignPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4 md:p-8 font-sans">
      <div className="max-w-7xl w-full">
        {/* Simple Header */}
        <div className="flex items-center gap-3 mb-8 px-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md">Г</div>
          <span className="text-xl font-bold tracking-tight text-gray-900">Гармония</span>
        </div>

        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.15 }
            }
          }}
          className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-3 lg:grid-rows-2 gap-6"
        >
          {/* Main Hero Card */}
          <motion.div 
            variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
            className="md:col-span-2 md:row-span-2 bg-white rounded-[2rem] p-8 md:p-12 lg:p-16 flex flex-col justify-center relative overflow-hidden shadow-sm border border-gray-100"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60"></div>
            
            <div className="relative z-10">
              <span className="inline-block py-2 px-5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-sm mb-8 border border-indigo-100 shadow-sm">
                📚 Набор в группы открыт
              </span>
              <h1 className="text-5xl lg:text-[4rem] font-extrabold text-gray-900 leading-[1.05] mb-8 tracking-tight">
                Английский, который дети <span className="text-indigo-600">полюбят</span>
              </h1>
              <p className="text-gray-500 text-lg md:text-xl max-w-lg mb-10 font-medium leading-relaxed">
                Погружаем в языковую среду через игры, песни и творчество. Для детей от 4 лет у метро Люблино.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-gray-900 hover:bg-gray-800 text-white rounded-2xl px-8 py-4 font-bold text-lg transition-transform hover:scale-105 active:scale-95 shadow-xl shadow-gray-900/20">
                  Записаться на урок
                </button>
                <button className="bg-white hover:bg-gray-50 text-gray-900 rounded-2xl px-8 py-4 font-bold text-lg border-2 border-gray-200 transition-transform hover:scale-105 active:scale-95">
                  Программа
                </button>
              </div>
            </div>
          </motion.div>

          {/* Image Card */}
          <motion.div 
            variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
            whileHover={{ scale: 1.02 }}
            className="bg-[#D9F0E6] rounded-[2rem] relative overflow-hidden min-h-[350px] lg:min-h-0 shadow-sm flex items-center justify-center p-6 group cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-full h-full relative"
            >
              <Image
                src="/kids_learning_bento.png"
                alt="Иллюстрация занятий"
                fill
                className="object-contain drop-shadow-xl transition-transform duration-500 group-hover:scale-110"
                priority
              />
            </motion.div>
          </motion.div>

          {/* Info Card 1 */}
          <motion.div 
            variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
            className="bg-indigo-600 text-white rounded-[2rem] p-8 flex flex-col justify-between shadow-lg shadow-indigo-600/30 relative overflow-hidden group cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-indigo-800 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute -right-10 -bottom-10 opacity-10 blur-2xl group-hover:blur-xl transition-all w-48 h-48 bg-white rounded-full"></div>
            
            <div className="relative z-10 w-full h-full flex flex-col">
              <div className="text-indigo-200 font-semibold mb-2 uppercase tracking-wider text-sm flex-grow">Методика</div>
              <div>
                <div className="text-3xl font-extrabold mb-6 leading-tight">Cambridge <br/>Learners</div>
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md group-hover:translate-x-2 transition-transform shadow-inner">
                  →
                </div>
              </div>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </div>
  )
}
