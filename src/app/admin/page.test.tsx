import { render, screen } from '@testing-library/react'
import AdminDashboard from './page'
import '@testing-library/jest-dom'

// Mock the actions
jest.mock('../actions', () => ({
  getBookings: jest.fn().mockResolvedValue([
    {
      id: '1',
      parentName: 'Test Parent',
      childAge: 7,
      phone: '1234567890',
      status: 'Новая',
      createdAt: new Date()
    }
  ]),
  getPhotos: jest.fn().mockResolvedValue([
    {
      id: '1',
      url: 'http://example.com/photo1.jpg',
      createdAt: new Date()
    }
  ]),
  updateBookingStatus: jest.fn(),
  uploadPhoto: jest.fn(),
  deletePhoto: jest.fn()
}))

// We need to support async Server Components testing in React 18+ by awaited rendering or minimal mocking.
// Since AdminDashboard is an async component, standard render() normally requires experimental approaches in RTL.
// We'll wrap it in a test helper to resolve it.
const renderAsyncComponent = async (Component: any, props: any = {}) => {
  const jsx = await Component(props)
  return render(jsx)
}

describe('Admin Dashboard', () => {
  it('renders the dashboard with bookings and photos', async () => {
    await renderAsyncComponent(AdminDashboard)

    expect(screen.getByText('Панель управления клуба')).toBeInTheDocument()
    expect(screen.getByText('Новые заявки')).toBeInTheDocument()
    expect(screen.getByText('Управление галереей')).toBeInTheDocument()

    // check if mocked booking data is present
    expect(screen.getByText('Test Parent')).toBeInTheDocument()
    expect(screen.getByText('1234567890')).toBeInTheDocument()
  })
})
