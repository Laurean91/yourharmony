import { render, screen, waitFor } from '@testing-library/react'
import LandingPage from './page'
import '@testing-library/jest-dom'

// Mock the Server Actions and Lucide icons
jest.mock('./actions', () => ({
  createBooking: jest.fn(),
  getPhotos: jest.fn().mockResolvedValue([]),
}))

jest.mock('lucide-react', () => ({
  Star: () => <div data-testid="icon-star" />,
  BookOpen: () => <div data-testid="icon-book" />,
  Smile: () => <div data-testid="icon-smile" />,
  Camera: () => <div data-testid="icon-camera" />,
  X: () => <div data-testid="icon-x" />,
}))

// We need to Mock Framer Motion to avoid animation issues in Jest JSDOM
jest.mock('framer-motion', () => {
  const React = require('react')
  // Simply render children for motion elements
  const Dummy = React.forwardRef(({ children, ...props }: any, ref: any) => {
    // Filter out typical framer-motion props
    const { initial, animate, variants, whileHover, whileTap, whileInView, viewport, transition, ...validProps } = props
    return <div ref={ref} {...validProps}>{children}</div>
  })
  Dummy.displayName = 'MotionDummy'

  return {
    motion: {
      div: Dummy,
      p: Dummy,
      h1: Dummy,
      a: Dummy,
      img: Dummy,
    },
  }
})

describe('Landing Page', () => {
  it('renders the hero section correctly', async () => {
    render(<LandingPage />)
    expect(screen.getByText('Клуб "Гармония"')).toBeInTheDocument()
    expect(screen.getByText(/Английский для детей от 6 лет/i)).toBeInTheDocument()
    expect(screen.getByText('Записаться на пробное занятие')).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByText('Клуб "Гармония"')).toBeInTheDocument())
  })

  it('renders advantages correctly', async () => {
    render(<LandingPage />)
    expect(screen.getByText('Игровая форма')).toBeInTheDocument()
    expect(screen.getByText('Живое общение')).toBeInTheDocument()
    expect(screen.getByText('Уютная атмосфера')).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByText('Игровая форма')).toBeInTheDocument())
  })

  it('renders the booking form', async () => {
    render(<LandingPage />)
    expect(screen.getByPlaceholderText('Ваше Имя')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Возраст')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Телефон')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Записаться' })).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByPlaceholderText('Ваше Имя')).toBeInTheDocument())
  })
})
