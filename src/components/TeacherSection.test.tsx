import { render, screen } from '@testing-library/react'
import TeacherSection from './TeacherSection'
import '@testing-library/jest-dom'

jest.mock('framer-motion', () => ({
  motion: {
    div:  ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => <span {...props}>{children}</span>,
  },
}))

const defaultProps = {
  name: 'Анна Сергеевна',
  bio: 'Сертифицированный преподаватель английского языка с опытом 7 лет. Специализируется на обучении детей от 6 до 14 лет — в игровой форме, без скучной зубрёжки. Каждый ребёнок уходит с занятия с улыбкой и новыми знаниями.',
  badges: ['Сертификат CELTA', 'Опыт 7 лет', 'IELTS 8.0', 'Дети 6–14 лет'],
}

describe('TeacherSection', () => {
  it('renders the section', () => {
    render(<TeacherSection {...defaultProps} />)
    expect(document.querySelector('#teacher')).toBeInTheDocument()
  })

  it('renders teacher name', () => {
    render(<TeacherSection {...defaultProps} />)
    expect(screen.getByText('Анна Сергеевна')).toBeInTheDocument()
  })

  it('renders "Ваш преподаватель" label', () => {
    render(<TeacherSection {...defaultProps} />)
    expect(screen.getByText('Ваш преподаватель')).toBeInTheDocument()
  })

  it('renders avatar initials when no photo', () => {
    render(<TeacherSection {...defaultProps} />)
    expect(screen.getByText('АС')).toBeInTheDocument()
  })

  it('renders photo when photoUrl is provided', () => {
    render(<TeacherSection {...defaultProps} photoUrl="https://example.com/photo.jpg" />)
    const img = screen.getByRole('img', { name: 'Анна Сергеевна' })
    expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg')
  })

  it('renders all qualification badges', () => {
    render(<TeacherSection {...defaultProps} />)
    expect(screen.getByText('Сертификат CELTA')).toBeInTheDocument()
    expect(screen.getByText('Опыт 7 лет')).toBeInTheDocument()
    expect(screen.getByText('IELTS 8.0')).toBeInTheDocument()
    expect(screen.getByText('Дети 6–14 лет')).toBeInTheDocument()
  })

  it('renders teacher description mentioning experience', () => {
    render(<TeacherSection {...defaultProps} />)
    expect(screen.getAllByText(/7 лет/i).length).toBeGreaterThanOrEqual(1)
  })

  it('renders custom name and bio', () => {
    render(<TeacherSection name="Мария Ивановна" bio="Опытный педагог." badges={['10 лет опыта']} />)
    expect(screen.getByText('Мария Ивановна')).toBeInTheDocument()
    expect(screen.getByText('Опытный педагог.')).toBeInTheDocument()
    expect(screen.getByText('10 лет опыта')).toBeInTheDocument()
  })
})
