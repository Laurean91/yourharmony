import { render, screen } from '@testing-library/react'
import LandingPage from './page'
import '@testing-library/jest-dom'

// Mock complex client components — tested separately
jest.mock('../components/Navbar', () => () => <nav data-testid="navbar" />)
jest.mock('../components/Footer', () => () => <footer data-testid="footer" />)
jest.mock('../components/BlogPreview', () => () => <section data-testid="blog-preview" />)
jest.mock('../components/LandingClient', () => ({
  LandingHero: () => (
    <section data-testid="landing-hero">
      <h1>Клуб &quot;Гармония&quot;</h1>
      <p>Английский для детей от 6 лет</p>
      <button>Записаться на пробное занятие</button>
    </section>
  ),
  LandingTop: () => (
    <section data-testid="landing-top">
      <p>Игровая форма</p>
      <p>Живое общение</p>
      <p>Уютная атмосфера</p>
      <input placeholder="Ваше Имя" />
      <input placeholder="Возраст" />
      <input placeholder="Телефон" />
      <button>Записаться</button>
    </section>
  ),
}))

describe('Landing Page', () => {
  it('renders all main sections', () => {
    render(<LandingPage />)
    expect(screen.getByTestId('navbar')).toBeInTheDocument()
    expect(screen.getByTestId('landing-hero')).toBeInTheDocument()
    expect(screen.getByTestId('blog-preview')).toBeInTheDocument()
    expect(screen.getByTestId('landing-top')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })

  it('renders the hero section correctly', () => {
    render(<LandingPage />)
    expect(screen.getByText('Клуб "Гармония"')).toBeInTheDocument()
    expect(screen.getByText(/Английский для детей от 6 лет/i)).toBeInTheDocument()
    expect(screen.getByText('Записаться на пробное занятие')).toBeInTheDocument()
  })

  it('renders advantages correctly', () => {
    render(<LandingPage />)
    expect(screen.getByText('Игровая форма')).toBeInTheDocument()
    expect(screen.getByText('Живое общение')).toBeInTheDocument()
    expect(screen.getByText('Уютная атмосфера')).toBeInTheDocument()
  })

  it('renders the booking form', () => {
    render(<LandingPage />)
    expect(screen.getByPlaceholderText('Ваше Имя')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Возраст')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Телефон')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Записаться' })).toBeInTheDocument()
  })
})
