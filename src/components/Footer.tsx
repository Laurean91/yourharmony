'use client'

import Link from 'next/link'
import '../app/nav-footer.css'
import { scrollToSection } from '../lib/utils'

const navItems = [
  { name: 'Главная', href: '#home' },
  { name: 'О клубе', href: '#about' },
  { name: 'Как проходят наши занятия', href: '#lessons' },
  { name: 'Контакты', href: '#contacts' },
]

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    scrollToSection(href)
  }

  return (
    <footer className="footer-dark py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6 w-fit">
              <svg width="44" height="44" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="ftgA" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#A78BFA"/>
                    <stop offset="100%" stopColor="#8B5CF6"/>
                  </linearGradient>
                  <linearGradient id="ftgB" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FB923C"/>
                    <stop offset="100%" stopColor="#F97316"/>
                  </linearGradient>
                </defs>
                <rect x="4" y="4" width="64" height="48" rx="14" fill="url(#ftgA)"/>
                <polygon points="52,52 65,52 61,64" fill="#8B5CF6"/>
                <rect x="36" y="54" width="58" height="40" rx="12" fill="url(#ftgB)"/>
                <polygon points="40,54 52,54 43,44" fill="#FB923C"/>
                <path d="M22 28 L23.1 24.9 L26 23.8 L23.1 22.7 L22 19.6 L20.9 22.7 L18 23.8 L20.9 24.9Z" fill="white" opacity="0.95"/>
                <path d="M36 28 L37.1 24.9 L40 23.8 L37.1 22.7 L36 19.6 L34.9 22.7 L32 23.8 L34.9 24.9Z" fill="white" opacity="0.88"/>
                <path d="M50 28 L51.1 24.9 L54 23.8 L51.1 22.7 L50 19.6 L48.9 22.7 L46 23.8 L48.9 24.9Z" fill="white" opacity="0.75"/>
                <path d="M50 70 Q65 80 80 70" stroke="white" strokeWidth="2.8" fill="none" strokeLinecap="round" opacity="0.85"/>
              </svg>
              <div>
                <p className="text-2xl font-extrabold bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent leading-tight"
                   style={{ fontFamily: 'var(--font-nunito), sans-serif' }}>
                  Гармония
                </p>
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-purple-300/60 leading-tight mt-0.5">Языковой клуб</p>
              </div>
            </Link>
            <p className="text-gray-400 max-w-sm mb-6">
              Мы создаем пространство, где каждый ребенок может раскрыть свой потенциал, играя и общаясь на английском языке.
            </p>
          </div>

          {/* Sitemap */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Навигация</h4>
            <ul className="flex flex-col gap-4">
              {navItems.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={(e) => handleScrollTo(e, item.href)}
                    className="footer-link"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
              <li>
                <Link href="/blog" className="footer-link">
                  Статьи
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Документы</h4>
            <ul className="flex flex-col gap-4">
              <li>
                <Link href="/documents" className="footer-link">
                  Правовые документы
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-sm">
          <p>© {currentYear} Клуб «Гармония». Все права защищены.</p>
          <div className="flex gap-6">
            <p className="italic">Сделано с любовью к детям</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
