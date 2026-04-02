'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, UserCircle } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import '../app/nav-footer.css'
import { scrollToSection } from '../lib/utils'

const navItems = [
  { name: 'Главная', href: '#home' },
  { name: 'О клубе', href: '#about' },
  { name: 'Как проходят наши занятия', href: '#lessons' },
  { name: 'Контакты', href: '#contacts' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    setIsOpen(false)

    if (pathname !== '/') {
      // На других страницах — переходим на главную с якорем
      window.location.href = `/${href}`
      return
    }

    // Небольшая задержка чтобы анимация закрытия меню не мешала скроллу
    setTimeout(() => scrollToSection(href), 50)
  }

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        scrolled ? 'nav-glass py-3 shadow-md' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <svg width="36" height="36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="navgA" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6"/>
                <stop offset="100%" stopColor="#7C3AED"/>
              </linearGradient>
              <linearGradient id="navgB" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F97316"/>
                <stop offset="100%" stopColor="#EC4899"/>
              </linearGradient>
            </defs>
            <rect x="4" y="4" width="64" height="48" rx="14" fill="url(#navgA)"/>
            <polygon points="52,52 65,52 61,64" fill="#7C3AED"/>
            <rect x="36" y="54" width="58" height="40" rx="12" fill="url(#navgB)"/>
            <polygon points="40,54 52,54 43,44" fill="#F97316"/>
            <path d="M22 28 L23.1 24.9 L26 23.8 L23.1 22.7 L22 19.6 L20.9 22.7 L18 23.8 L20.9 24.9Z" fill="white" opacity="0.95"/>
            <path d="M36 28 L37.1 24.9 L40 23.8 L37.1 22.7 L36 19.6 L34.9 22.7 L32 23.8 L34.9 24.9Z" fill="white" opacity="0.88"/>
            <path d="M50 28 L51.1 24.9 L54 23.8 L51.1 22.7 L50 19.6 L48.9 22.7 L46 23.8 L48.9 24.9Z" fill="white" opacity="0.75"/>
            <path d="M50 70 Q65 80 80 70" stroke="white" strokeWidth="2.8" fill="none" strokeLinecap="round" opacity="0.85"/>
          </svg>
          <div>
            <p className="text-xl font-extrabold bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent leading-tight"
               style={{ fontFamily: 'var(--font-nunito), sans-serif' }}>
              Гармония
            </p>
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-purple-400/80 leading-tight">
              Языковой клуб
            </p>
          </div>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex gap-8">
          <a
            href={navItems[0].href}
            onClick={(e) => handleScrollTo(e, navItems[0].href)}
            className="nav-link text-sm uppercase tracking-wider"
          >
            {navItems[0].name}
          </a>
          <Link href="/blog" className="nav-link text-sm uppercase tracking-wider">
            Статьи
          </Link>
          {navItems.slice(1).map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => handleScrollTo(e, item.href)}
              className="nav-link text-sm uppercase tracking-wider"
            >
              {item.name}
            </a>
          ))}
        </nav>

        {/* Parent Cabinet Button — desktop */}
        <Link
          href="/parent"
          className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white transition-all hover:scale-105 hover:shadow-lg"
          style={{ background: 'linear-gradient(90deg, #8B5CF6 0%, #F97316 100%)', boxShadow: '0 2px 12px rgba(139,92,246,0.35)' }}
        >
          <UserCircle size={16} />
          Кабинет родителя
        </Link>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 text-gray-600 focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100 overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              <a
                href={navItems[0].href}
                onClick={(e) => handleScrollTo(e, navItems[0].href)}
                className="text-lg font-medium text-gray-800 hover:text-purple-600 transition-colors"
              >
                {navItems[0].name}
              </a>
              <Link
                href="/blog"
                onClick={() => setIsOpen(false)}
                className="text-lg font-medium text-gray-800 hover:text-purple-600 transition-colors"
              >
                Статьи
              </Link>
              {navItems.slice(1).map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleScrollTo(e, item.href)}
                  className="text-lg font-medium text-gray-800 hover:text-purple-600 transition-colors"
                >
                  {item.name}
                </a>
              ))}
              <Link
                href="/parent"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 mt-2 px-4 py-3 rounded-xl text-base font-semibold text-white justify-center"
                style={{ background: 'linear-gradient(90deg, #8B5CF6 0%, #F97316 100%)' }}
              >
                <UserCircle size={18} />
                Кабинет родителя
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
