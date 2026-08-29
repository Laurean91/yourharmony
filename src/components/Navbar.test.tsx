import { render, screen } from '@testing-library/react'
import Navbar from './Navbar'
import '@testing-library/jest-dom'

jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}))

// Navbar рендерит motion.div/svg/line и читает useReducedMotion.
// Отдаём любой запрошенный тег как обычный DOM-элемент, чтобы мок не отставал
// от разметки компонента.
jest.mock('framer-motion', () => {
  const React = require('react')
  const strip = ({ children, variants, initial, animate, exit, transition, whileHover, whileTap, ...props }: Record<string, unknown> & { children?: React.ReactNode }) => ({ children, props })
  const motion = new Proxy({}, {
    get: (_target, tag: string) => {
      const Component = (allProps: Record<string, unknown>) => {
        const { children, props } = strip(allProps)
        return React.createElement(tag, props, children)
      }
      Component.displayName = `motion.${tag}`
      return Component
    },
  })
  return {
    motion,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    useReducedMotion: () => false,
  }
})

jest.mock('../lib/utils', () => ({
  scrollToSection: jest.fn(),
}))

describe('Navbar', () => {
  it('renders the navbar', () => {
    render(<Navbar />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('renders logo link to homepage', () => {
    render(<Navbar />)
    const logoLink = screen.getAllByRole('link').find(
      (el) => el.getAttribute('href') === '/'
    )
    expect(logoLink).toBeInTheDocument()
  })

  it('renders "Статьи" link to /blog', () => {
    render(<Navbar />)
    const links = screen.getAllByRole('link')
    const articlesLink = links.find((el) => el.getAttribute('href') === '/blog')
    expect(articlesLink).toBeInTheDocument()
    expect(articlesLink).toHaveTextContent('Статьи')
  })

  it('"Статьи" appears before "О клубе" in desktop nav', () => {
    render(<Navbar />)
    const nav = screen.getByRole('navigation')
    const items = Array.from(nav.querySelectorAll('a'))
    const articlesIdx = items.findIndex((el) => el.textContent?.trim() === 'Статьи')
    const aboutIdx = items.findIndex((el) => el.textContent?.trim() === 'О клубе')
    expect(articlesIdx).toBeGreaterThan(-1)
    expect(aboutIdx).toBeGreaterThan(-1)
    expect(articlesIdx).toBeLessThan(aboutIdx)
  })

  it('"Статьи" appears right after "Главная" in desktop nav', () => {
    render(<Navbar />)
    const nav = screen.getByRole('navigation')
    const items = Array.from(nav.querySelectorAll('a'))
    const texts = items.map((el) => el.textContent?.trim())
    const glavnayaIdx = texts.indexOf('Главная')
    expect(texts[glavnayaIdx + 1]).toBe('Статьи')
  })

  it('does not show "Блог" anywhere', () => {
    render(<Navbar />)
    expect(screen.queryByText('Блог')).not.toBeInTheDocument()
  })

  it('renders anchor nav items', () => {
    render(<Navbar />)
    expect(screen.getByText('О клубе')).toBeInTheDocument()
    expect(screen.getByText('Контакты')).toBeInTheDocument()
  })
})
