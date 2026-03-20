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
jest.mock('@/components/SignOutButton', () => () => <button>Выйти</button>)
jest.mock('@/components/DeleteBookingButton', () => ({ id }: { id: string }) => (
  <button title="Удалить заявку" data-id={id}>🗑</button>
))

const renderAsync = async (Component: any, props: any = {}) => {
  const jsx = await Component(props)
  return render(jsx)
}

describe('AdminDashboard', () => {
  it('renders main sections', async () => {
    await renderAsync(AdminDashboard)
    expect(screen.getByText('Панель управления клуба')).toBeInTheDocument()
    expect(screen.getByText('Новые заявки')).toBeInTheDocument()
    expect(screen.getByText('Управление галереей')).toBeInTheDocument()
  })

  it('shows booking data from mock', async () => {
    await renderAsync(AdminDashboard)
    expect(screen.getByText('Тест Иванов')).toBeInTheDocument()
    expect(screen.getByText('+7-999-000-00-00')).toBeInTheDocument()
    expect(screen.getByText('Новая')).toBeInTheDocument()
  })

  it('shows blog post count', async () => {
    await renderAsync(AdminDashboard)
    // 2 posts total, 1 published
    expect(screen.getByText(/2.*статей|статей.*2/i)).toBeInTheDocument()
  })

  it('renders sign out button', async () => {
    await renderAsync(AdminDashboard)
    expect(screen.getByRole('button', { name: 'Выйти' })).toBeInTheDocument()
  })

  it('renders link to blog management', async () => {
    await renderAsync(AdminDashboard)
    expect(screen.getByRole('link', { name: /управление/i, hidden: false })).toBeInTheDocument()
  })
})
