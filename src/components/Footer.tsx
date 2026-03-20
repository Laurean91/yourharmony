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
            <Link href="/" className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent mb-6 inline-block">
              Гармония
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
          <p>© {currentYear} Клуб &quot;Гармония&quot;. Все права защищены.</p>
          <div className="flex gap-6">
            <p className="italic">Сделано с любовью к детям</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
