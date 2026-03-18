import { render, screen } from '@testing-library/react'
import LandingPage from './page'
import '@testing-library/jest-dom'

// Mock complex client components — tested separately
jest.mock('../components/Navbar', () => () => <nav data-testid="navbar" />)
jest.mock('../components/Footer', () => () => <footer data-testid="footer" />)
jest.mock('../components/BlogPreview', () => () => <section data-testid="blog-preview" />)
jest.mock('../components/TeacherSection', () => () => <section data-testid="teacher-section" />)
jest.mock('../components/LandingClient', () => ({
  LandingHero: () => (
    <section data-testid="landing-hero">
      <h1>Языковой клуб &quot;Гармония&quot;</h1>
      <p>Английский для детей от 6 лет</p>
      <button>Записаться на пробное занятие</button>
      <p>50+ учеников</p>
      <p>3 года работаем</p>
      <p>★ 5.0 средняя оценка</p>
    </section>
  ),
  LandingTop: () => (
    <section data-testid="landing-top">
      <p>Игровая форма</p>
      <p>Живое общение</p>
      <p>Уютная атмосфера</p>
    </section>
  ),
  LandingContacts: () => (
    <section data-testid="landing-contacts">
      <p>ул. Мира, д. 15, офис 302</p>
      <a href="https://t.me/yourharmony_club">Telegram</a>
      <a href="https://wa.me/79991234567">WhatsApp</a>
    </section>
  ),
}))

describe('Landing Page', () => {
  it('renders all main sections', () => {
    render(<LandingPage />)
    expect(screen.getByTestId('navbar')).toBeInTheDocument()
    expect(screen.getByTestId('landing-hero')).toBeInTheDocument()
    expect(screen.getByTestId('blog-preview')).toBeInTheDocument()
    expect(screen.getByTestId('teacher-section')).toBeInTheDocument()
    expect(screen.getByTestId('landing-top')).toBeInTheDocument()
    expect(screen.getByTestId('landing-contacts')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })

  it('renders hero with updated club name', () => {
    render(<LandingPage />)
    expect(screen.getByText('Языковой клуб "Гармония"')).toBeInTheDocument()
    expect(screen.getByText(/Английский для детей от 6 лет/i)).toBeInTheDocument()
    expect(screen.getByText('Записаться на пробное занятие')).toBeInTheDocument()
  })

  it('renders stats bar in hero', () => {
    render(<LandingPage />)
    expect(screen.getByText('50+ учеников')).toBeInTheDocument()
    expect(screen.getByText('3 года работаем')).toBeInTheDocument()
    expect(screen.getByText(/средняя оценка/i)).toBeInTheDocument()
  })

  it('renders advantages section', () => {
    render(<LandingPage />)
    expect(screen.getByText('Игровая форма')).toBeInTheDocument()
    expect(screen.getByText('Живое общение')).toBeInTheDocument()
    expect(screen.getByText('Уютная атмосфера')).toBeInTheDocument()
  })

  it('renders contacts with messengers', () => {
    render(<LandingPage />)
    expect(screen.getByText('ул. Мира, д. 15, офис 302')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Telegram' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'WhatsApp' })).toBeInTheDocument()
  })

  it('renders sections in correct order', () => {
    render(<LandingPage />)
    const sections = [
      screen.getByTestId('landing-hero'),
      screen.getByTestId('blog-preview'),
      screen.getByTestId('landing-top'),
      screen.getByTestId('teacher-section'),
      screen.getByTestId('landing-contacts'),
    ]
    for (let i = 0; i < sections.length - 1; i++) {
      expect(sections[i].compareDocumentPosition(sections[i + 1])).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING
      )
    }
  })
})
