import { render, screen } from '@testing-library/react'
import Footer from './Footer'
import '@testing-library/jest-dom'

jest.mock('../lib/utils', () => ({
  scrollToSection: jest.fn(),
}))

describe('Footer', () => {
  it('renders the footer', () => {
    render(<Footer />)
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('renders "Статьи" link to /blog', () => {
    render(<Footer />)
    const links = screen.getAllByRole('link')
    const articlesLink = links.find((el) => el.getAttribute('href') === '/blog')
    expect(articlesLink).toBeInTheDocument()
    expect(articlesLink).toHaveTextContent('Статьи')
  })

  it('does not show "Блог" anywhere', () => {
    render(<Footer />)
    expect(screen.queryByText('Блог')).not.toBeInTheDocument()
  })

  it('renders navigation section heading', () => {
    render(<Footer />)
    expect(screen.getByText('Навигация')).toBeInTheDocument()
  })

  it('renders legal documents link', () => {
    render(<Footer />)
    const docsLink = screen.getByRole('link', { name: 'Правовые документы' })
    expect(docsLink).toHaveAttribute('href', '/documents')
  })

  it('renders copyright with current year', () => {
    render(<Footer />)
    const year = new Date().getFullYear().toString()
    expect(screen.getByText(new RegExp(year))).toBeInTheDocument()
  })

  it('renders logo link to homepage', () => {
    render(<Footer />)
    const homeLinks = screen.getAllByRole('link').filter(
      (el) => el.getAttribute('href') === '/'
    )
    expect(homeLinks.length).toBeGreaterThan(0)
  })
})
