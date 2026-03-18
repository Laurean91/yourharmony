import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginPage from './page'

const mockSignIn = jest.fn()
const mockPush = jest.fn()
const mockRefresh = jest.fn()

jest.mock('next-auth/react', () => ({
  signIn: (...args: any[]) => mockSignIn(...args),
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}))

beforeEach(() => jest.clearAllMocks())

describe('LoginPage', () => {
  it('renders login form with all fields', () => {
    render(<LoginPage />)
    expect(screen.getByText('Вход в панель')).toBeInTheDocument()
    expect(screen.getByLabelText('Логин')).toBeInTheDocument()
    expect(screen.getByLabelText('Пароль')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Войти' })).toBeInTheDocument()
  })

  it('shows error message on failed login', async () => {
    mockSignIn.mockResolvedValueOnce({ error: 'CredentialsSignin' })
    render(<LoginPage />)

    fireEvent.change(screen.getByLabelText('Логин'), { target: { value: 'admin' } })
    fireEvent.change(screen.getByLabelText('Пароль'), { target: { value: 'wrongpass' } })
    fireEvent.submit(screen.getByRole('button').closest('form')!)

    await waitFor(() => {
      expect(screen.getByText('Неверный логин или пароль')).toBeInTheDocument()
    })
  })

  it('redirects to /admin on successful login', async () => {
    mockSignIn.mockResolvedValueOnce({ error: null })
    render(<LoginPage />)

    fireEvent.change(screen.getByLabelText('Логин'), { target: { value: 'admin' } })
    fireEvent.change(screen.getByLabelText('Пароль'), { target: { value: 'correctpass' } })
    fireEvent.submit(screen.getByRole('button').closest('form')!)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin')
    })
  })

  it('calls signIn with credentials provider', async () => {
    mockSignIn.mockResolvedValueOnce({ error: null })
    render(<LoginPage />)

    fireEvent.change(screen.getByLabelText('Логин'), { target: { value: 'admin' } })
    fireEvent.change(screen.getByLabelText('Пароль'), { target: { value: 'pass' } })
    fireEvent.submit(screen.getByRole('button').closest('form')!)

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('credentials', expect.objectContaining({
        username: 'admin',
        password: 'pass',
        redirect: false,
      }))
    })
  })

  it('shows loading state during sign-in', async () => {
    let resolveSignIn: (v: any) => void
    mockSignIn.mockImplementationOnce(
      () => new Promise(res => { resolveSignIn = res })
    )
    render(<LoginPage />)

    fireEvent.submit(screen.getByRole('button').closest('form')!)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Вход...' })).toBeDisabled()
    })

    resolveSignIn!({ error: null })
  })

  it('does not show error initially', () => {
    render(<LoginPage />)
    expect(screen.queryByText('Неверный логин или пароль')).not.toBeInTheDocument()
  })
})
