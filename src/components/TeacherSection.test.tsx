import { render, screen } from '@testing-library/react'
import TeacherSection from './TeacherSection'
import '@testing-library/jest-dom'

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
  },
}))

describe('TeacherSection', () => {
  it('renders the section', () => {
    render(<TeacherSection />)
    expect(document.querySelector('#teacher')).toBeInTheDocument()
  })

  it('renders teacher name', () => {
    render(<TeacherSection />)
    expect(screen.getByText('Анна Сергеевна')).toBeInTheDocument()
  })

  it('renders "Ваш преподаватель" label', () => {
    render(<TeacherSection />)
    expect(screen.getByText('Ваш преподаватель')).toBeInTheDocument()
  })

  it('renders avatar initials', () => {
    render(<TeacherSection />)
    expect(screen.getByText('АС')).toBeInTheDocument()
  })

  it('renders all qualification badges', () => {
    render(<TeacherSection />)
    expect(screen.getByText('Сертификат CELTA')).toBeInTheDocument()
    expect(screen.getByText('Опыт 7 лет')).toBeInTheDocument()
    expect(screen.getByText('IELTS 8.0')).toBeInTheDocument()
    expect(screen.getByText('Дети 6–14 лет')).toBeInTheDocument()
  })

  it('renders teacher description mentioning experience', () => {
    render(<TeacherSection />)
    expect(screen.getAllByText(/7 лет/i).length).toBeGreaterThanOrEqual(1)
  })
})
