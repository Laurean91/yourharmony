'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { UserCircle } from 'lucide-react'
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

/* ── Framer Motion variants ── */
const popupMenu = {
  hidden: { opacity: 0, scale: 0.92, y: -8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 380, damping: 28, when: 'beforeChildren', staggerChildren: 0.055, delayChildren: 0.05 },
  },
  exit: { opacity: 0, scale: 0.94, y: -6, transition: { duration: 0.18 } },
}

const menuItem = {
  hidden: { opacity: 0, y: 8, filter: 'blur(3px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring' as const, stiffness: 350, damping: 26 },
  },
}

const menuItemReduced = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.12 } },
}

const menuCta = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 400, damping: 22, delay: 0.02 },
  },
}

const menuCtaReduced = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.15 } },
}

let _starId = 0
/* ── Decorative star (matches logo) ── */
function StarDecor({ className }: { className?: string }) {
  const id = useRef(`sg-${++_starId}`).current
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className={className}>
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>
      </defs>
      <path
        d="M10 2 L11.1 7.9 L17 9 L11.1 10.1 L10 16 L8.9 10.1 L3 9 L8.9 7.9Z"
        fill={`url(#${id})`}
        opacity="0.65"
      />
    </svg>
  )
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const shouldReduceMotion = useReducedMotion()
  const firstLinkRef = useRef<HTMLAnchorElement>(null)
  const burgerRef = useRef<HTMLButtonElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen])

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return
    const handleClick = (e: MouseEvent) => {
      if (
        popupRef.current && !popupRef.current.contains(e.target as Node) &&
        burgerRef.current && !burgerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen])

  // Focus first link on open
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => firstLinkRef.current?.focus(), 200)
      return () => clearTimeout(timer)
    } else {
      burgerRef.current?.focus()
    }
  }, [isOpen])

  const handleScrollTo = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      e.preventDefault()
      setIsOpen(false)

      if (pathname !== '/') {
        window.location.href = `/${href}`
        return
      }

      setTimeout(() => scrollToSection(href), 50)
    },
    [pathname],
  )

  const close = useCallback(() => setIsOpen(false), [])

  // Spring config for burger lines
  const spring = shouldReduceMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 260, damping: 20 }

  // Build all menu links
  const allLinks = [
    { name: navItems[0].name, href: navItems[0].href, isLink: false },
    { name: 'Статьи', href: '/blog', isLink: true },
    ...navItems.slice(1).map((item) => ({ name: item.name, href: item.href, isLink: false })),
  ]

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
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#7C3AED" />
              </linearGradient>
              <linearGradient id="navgB" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F97316" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
            </defs>
            <rect x="4" y="4" width="64" height="48" rx="14" fill="url(#navgA)" />
            <polygon points="52,52 65,52 61,64" fill="#7C3AED" />
            <rect x="36" y="54" width="58" height="40" rx="12" fill="url(#navgB)" />
            <polygon points="40,54 52,54 43,44" fill="#F97316" />
            <path d="M22 28 L23.1 24.9 L26 23.8 L23.1 22.7 L22 19.6 L20.9 22.7 L18 23.8 L20.9 24.9Z" fill="white" opacity="0.95" />
            <path d="M36 28 L37.1 24.9 L40 23.8 L37.1 22.7 L36 19.6 L34.9 22.7 L32 23.8 L34.9 24.9Z" fill="white" opacity="0.88" />
            <path d="M50 28 L51.1 24.9 L54 23.8 L51.1 22.7 L50 19.6 L48.9 22.7 L46 23.8 L48.9 24.9Z" fill="white" opacity="0.75" />
            <path d="M50 70 Q65 80 80 70" stroke="white" strokeWidth="2.8" fill="none" strokeLinecap="round" opacity="0.85" />
          </svg>
          <div>
            <p
              className="text-xl font-extrabold bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent leading-tight"
              style={{ fontFamily: 'var(--font-nunito), sans-serif' }}
            >
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
          className="hidden md:flex items-center justify-center w-9 h-9 rounded-full text-white transition-all hover:scale-110 hover:shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #8B5CF6 0%, #F97316 100%)',
            boxShadow: '0 2px 12px rgba(139,92,246,0.35)',
          }}
          aria-label="Кабинет родителя"
        >
          <UserCircle size={18} />
        </Link>

        {/* ── Burger Button ── */}
        <div className="md:hidden relative">
          <button
            ref={burgerRef}
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Закрыть меню' : 'Открыть меню'}
            aria-expanded={isOpen}
            style={{
              outline: 'none',
              WebkitTapHighlightColor: 'transparent',
              width: 36,
              height: 36,
              borderRadius: 10,
              border: isOpen ? '1px solid rgba(139,92,246,0.5)' : '1px solid rgba(139,92,246,0.25)',
              background: isOpen
                ? 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(249,115,22,0.07) 100%)'
                : 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              cursor: 'pointer',
              position: 'relative',
              flexShrink: 0,
            }}
          >
            <motion.svg
              width="36"
              height="36"
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ position: 'absolute', inset: 0 }}
            >
              {/* Верхняя линия */}
              <motion.line
                x1="10" y1="13" x2="26" y2="13"
                stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round"
                animate={isOpen ? { x1: 11, y1: 11, x2: 25, y2: 25 } : { x1: 10, y1: 13, x2: 26, y2: 13 }}
                transition={spring}
              />
              {/* Средняя линия */}
              <motion.line
                x1="10" y1="18" x2="26" y2="18"
                stroke="#A855F7" strokeWidth="2" strokeLinecap="round"
                animate={isOpen ? { opacity: 0, x1: 18, x2: 18 } : { opacity: 1, x1: 10, x2: 26 }}
                transition={spring}
              />
              {/* Нижняя линия */}
              <motion.line
                x1="10" y1="23" x2="26" y2="23"
                stroke="#F97316" strokeWidth="2" strokeLinecap="round"
                animate={isOpen ? { x1: 11, y1: 25, x2: 25, y2: 11 } : { x1: 10, y1: 23, x2: 26, y2: 23 }}
                transition={spring}
              />
            </motion.svg>
          </button>

          {/* ── Popup Menu ── */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                ref={popupRef}
                className="absolute right-0 top-[calc(100%+10px)] w-64 rounded-2xl overflow-hidden shadow-xl"
                style={{
                  background: 'linear-gradient(160deg, rgba(245,243,255,0.98) 0%, rgba(255,255,255,0.97) 60%, rgba(255,247,237,0.98) 100%)',
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  border: '1px solid rgba(139,92,246,0.12)',
                  boxShadow: '0 8px 32px rgba(139,92,246,0.15), 0 2px 8px rgba(0,0,0,0.06)',
                }}
                variants={popupMenu}
                initial="hidden"
                animate="visible"
                exit="exit"
                role="dialog"
                aria-modal="true"
                aria-label="Меню навигации"
              >
                {/* Декоративная звёздочка */}
                <motion.div
                  className="absolute top-3 right-3 pointer-events-none"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                >
                  <StarDecor />
                </motion.div>

                <div className="flex flex-col p-3 gap-0.5">
                  {allLinks.map((item, i) =>
                    item.isLink ? (
                      <motion.div key={item.href} variants={shouldReduceMotion ? menuItemReduced : menuItem}>
                        <Link
                          ref={i === 0 ? firstLinkRef : undefined}
                          href={item.href}
                          onClick={close}
                          className="mobile-nav-link block text-[15px] font-medium text-gray-700 py-2.5 px-4 rounded-xl"
                        >
                          {item.name}
                        </Link>
                      </motion.div>
                    ) : (
                      <motion.div key={item.href} variants={shouldReduceMotion ? menuItemReduced : menuItem}>
                        <a
                          ref={i === 0 ? (firstLinkRef as React.Ref<HTMLAnchorElement>) : undefined}
                          href={item.href}
                          onClick={(e) => handleScrollTo(e, item.href)}
                          className="mobile-nav-link block text-[15px] font-medium text-gray-700 py-2.5 px-4 rounded-xl"
                        >
                          {item.name}
                        </a>
                      </motion.div>
                    ),
                  )}

                  {/* Divider */}
                  <div className="mx-4 my-1.5 h-px bg-gradient-to-r from-purple-200/60 via-orange-200/40 to-transparent" />

                  {/* CTA */}
                  <motion.div variants={shouldReduceMotion ? menuCtaReduced : menuCta}>
                    <Link
                      href="/parent"
                      onClick={close}
                      className="flex items-center gap-2 justify-center w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                      style={{
                        background: 'linear-gradient(135deg, #8B5CF6 0%, #F97316 100%)',
                        boxShadow: '0 2px 12px rgba(139,92,246,0.3)',
                      }}
                    >
                      <UserCircle size={16} />
                      Кабинет родителя
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
