import { render, screen } from '@testing-library/react'
import LandingPage from './page'
import '@testing-library/jest-dom'
import { DEFAULT_HERO, DEFAULT_FEATURES, DEFAULT_FORMATS, DEFAULT_CONTACTS, DEFAULT_HOW_IT_WORKS, DEFAULT_TESTIMONIALS, DEFAULT_CTA, DEFAULT_FAQ } from '../lib/landingTypes'

const mockTeacher = {
  name: 'Анна Сергеевна',
  bio: 'Сертифицированный преподаватель.',
  photoUrl: null,
  badges: 'CELTA, IELTS 8.0',
}

jest.mock('./actions', () => ({
  getSectionSettings: jest.fn((key: string) => {
    const defaults: Record<string, unknown> = {
      hero: DEFAULT_HERO, features: DEFAULT_FEATURES, formats: DEFAULT_FORMATS,
      contacts: DEFAULT_CONTACTS, howItWorks: DEFAULT_HOW_IT_WORKS,
      testimonials: DEFAULT_TESTIMONIALS, cta: DEFAULT_CTA, faq: DEFAULT_FAQ,
    }
    return Promise.resolve(defaults[key])
  }),
  getTeacherProfile: jest.fn(() => Promise.resolve(mockTeacher)),
}))

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
      <p>Армавирская ул., 1/20</p>
      <a href="https://t.me/harmonyEnglish">Telegram</a>
    </section>
  ),
  HowItWorksSection: () => <section data-testid="how-it-works" />,
  TestimonialsSection: () => <section data-testid="testimonials" />,
  CtaSection: () => <section data-testid="cta" />,
  FAQSection: () => <section data-testid="faq" />,
}))

const renderAsync = async (Component: React.FC) => {
  const jsx = await (Component as unknown as () => Promise<React.ReactElement>)()
  return render(jsx)
}

describe('Landing Page', () => {
  it('renders all main sections', async () => {
    await renderAsync(LandingPage)
    expect(screen.getByTestId('navbar')).toBeInTheDocument()
    expect(screen.getByTestId('landing-hero')).toBeInTheDocument()
    expect(screen.getByTestId('blog-preview')).toBeInTheDocument()
    expect(screen.getByTestId('teacher-section')).toBeInTheDocument()
    expect(screen.getByTestId('landing-top')).toBeInTheDocument()
    expect(screen.getByTestId('landing-contacts')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })

  it('renders hero with club name', async () => {
    await renderAsync(LandingPage)
    expect(screen.getByText('Языковой клуб "Гармония"')).toBeInTheDocument()
    expect(screen.getByText(/Английский для детей от 6 лет/i)).toBeInTheDocument()
    expect(screen.getByText('Записаться на пробное занятие')).toBeInTheDocument()
  })

  it('renders stats bar in hero', async () => {
    await renderAsync(LandingPage)
    expect(screen.getByText('50+ учеников')).toBeInTheDocument()
    expect(screen.getByText('3 года работаем')).toBeInTheDocument()
    expect(screen.getByText(/средняя оценка/i)).toBeInTheDocument()
  })

  it('renders advantages section', async () => {
    await renderAsync(LandingPage)
    expect(screen.getByText('Игровая форма')).toBeInTheDocument()
    expect(screen.getByText('Живое общение')).toBeInTheDocument()
    expect(screen.getByText('Уютная атмосфера')).toBeInTheDocument()
  })

  it('renders contacts with Telegram link', async () => {
    await renderAsync(LandingPage)
    expect(screen.getByRole('link', { name: 'Telegram' })).toBeInTheDocument()
  })

  it('injects at least one JSON-LD schema', async () => {
    await renderAsync(LandingPage)
    const scripts = document.querySelectorAll('script[type="application/ld+json"]')
    expect(scripts.length).toBeGreaterThan(0)
  })

  it('injects Course JSON-LD schema', async () => {
    await renderAsync(LandingPage)
    const scripts = document.querySelectorAll('script[type="application/ld+json"]')
    const schemas = Array.from(scripts).map((s) => JSON.parse(s.textContent ?? '{}'))
    const course = schemas.find((s) => s['@type'] === 'Course')
    expect(course).toBeDefined()
    expect(course.name).toMatch(/английск/i)
    expect(course.hasCourseInstance).toHaveLength(2)
  })

  it('injects FAQPage JSON-LD when faq items exist', async () => {
    await renderAsync(LandingPage)
    const scripts = document.querySelectorAll('script[type="application/ld+json"]')
    const schemas = Array.from(scripts).map((s) => JSON.parse(s.textContent ?? '{}'))
    const faqSchema = schemas.find((s) => s['@type'] === 'FAQPage')
    expect(faqSchema).toBeDefined()
    expect(faqSchema.mainEntity.length).toBeGreaterThan(0)
  })

  it('does not inject FAQPage when faq items are empty', async () => {
    const { getSectionSettings } = require('./actions')
    getSectionSettings.mockImplementation((key: string) => {
      if (key === 'faq') return Promise.resolve({ enabled: true, items: [] })
      const defaults: Record<string, unknown> = {
        hero: DEFAULT_HERO, features: DEFAULT_FEATURES, formats: DEFAULT_FORMATS,
        contacts: DEFAULT_CONTACTS, howItWorks: DEFAULT_HOW_IT_WORKS,
        testimonials: DEFAULT_TESTIMONIALS, cta: DEFAULT_CTA,
      }
      return Promise.resolve(defaults[key])
    })
    await renderAsync(LandingPage)
    const scripts = document.querySelectorAll('script[type="application/ld+json"]')
    const schemas = Array.from(scripts).map((s) => JSON.parse(s.textContent ?? '{}'))
    expect(schemas.find((s) => s['@type'] === 'FAQPage')).toBeUndefined()
    // restore
    getSectionSettings.mockImplementation((key: string) => {
      const defaults: Record<string, unknown> = {
        hero: DEFAULT_HERO, features: DEFAULT_FEATURES, formats: DEFAULT_FORMATS,
        contacts: DEFAULT_CONTACTS, howItWorks: DEFAULT_HOW_IT_WORKS,
        testimonials: DEFAULT_TESTIMONIALS, cta: DEFAULT_CTA, faq: DEFAULT_FAQ,
      }
      return Promise.resolve(defaults[key])
    })
  })

  it('injects Person JSON-LD with correct domain', async () => {
    await renderAsync(LandingPage)
    const scripts = document.querySelectorAll('script[type="application/ld+json"]')
    const schemas = Array.from(scripts).map((s) => JSON.parse(s.textContent ?? '{}'))
    const person = schemas.find((s) => s['@type'] === 'Person')
    expect(person).toBeDefined()
    expect(person.name).toBe('Анна Сергеевна')
    expect(person['@id']).toContain('yourharmony-english.ru')
  })

  it('renders sections in correct order', async () => {
    await renderAsync(LandingPage)
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
