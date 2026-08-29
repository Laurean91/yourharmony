import { render, screen } from '@testing-library/react'
import AdminDashboard from './page'
import '@testing-library/jest-dom'

jest.mock('../actions', () => ({
  getBookings: jest.fn().mockResolvedValue([
    { id: '1', parentName: 'Тест Иванов', childAge: 7, phone: '+7-999-000-00-00', status: 'Новая', createdAt: new Date() },
  ]),
  getPhotos: jest.fn().mockResolvedValue([
    { id: '1', url: 'https://blob.example.com/photo1.jpg', createdAt: new Date() },
  ]),
  getLessons: jest.fn().mockResolvedValue([]),
  getStudents: jest.fn().mockResolvedValue([]),
  getFinanceStats: jest.fn().mockResolvedValue({
    totalThisMonth: 0,
    monthlyRevenue: [{ individual: 0, group: 0 }, { individual: 0, group: 0 }],
  }),
  getAllPostsAdmin: jest.fn().mockResolvedValue([
    { id: '1', title: 'Статья 1', isPublished: true },
    { id: '2', title: 'Черновик', isPublished: false },
  ]),
  getTeacherProfile: jest.fn().mockResolvedValue({
    id: 'singleton', name: 'Анна Сергеевна', bio: 'Описание', photoUrl: null, badges: 'CELTA',
  }),
  updateBookingStatus: jest.fn(),
  uploadPhoto: jest.fn(),
  deletePhoto: jest.fn(),
}))

// SignOutButton is a client component with next-auth — mock it
jest.mock('@/components/SignOutButton', () => function MockSignOutButton() { return <button>Выйти</button> })
jest.mock('@/components/DeleteBookingButton', () => function MockDeleteBookingButton({ id }: { id: string }) {
  return <button title="Удалить заявку" data-id={id}>🗑</button>
})

type AsyncComponent = (props: Record<string, unknown>) => Promise<React.ReactElement>

const renderAsync = async (Component: AsyncComponent, props: Record<string, unknown> = {}) => {
  const jsx = await Component(props)
  return render(jsx)
}

describe('AdminDashboard', () => {
  it('renders main sections', async () => {
    await renderAsync(AdminDashboard)
    expect(screen.getByRole('heading', { name: 'Дашборд' })).toBeInTheDocument()
    expect(screen.getAllByText('Заявки').length).toBeGreaterThan(0)
    expect(screen.getByText('Мои ученики')).toBeInTheDocument()
  })

  it('shows booking data from mock', async () => {
    await renderAsync(AdminDashboard)
    expect(screen.getByText('Тест Иванов')).toBeInTheDocument()
    expect(screen.getByText('+7-999-000-00-00')).toBeInTheDocument()
    expect(screen.getByText('Новая')).toBeInTheDocument()
  })

  it('flags new bookings in the header', async () => {
    await renderAsync(AdminDashboard)
    expect(screen.getByText(/1 новых заявок/)).toBeInTheDocument()
  })

  it('renders link to the students page', async () => {
    await renderAsync(AdminDashboard)
    const links = screen.getAllByRole('link').map(l => l.getAttribute('href'))
    expect(links).toContain('/bigbos/students')
  })
})
