import { render, screen } from '@testing-library/react'
import Navbar from './Navbar'
import '@testing-library/jest-dom'

jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}))

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

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
