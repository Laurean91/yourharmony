// Capture the NextAuth config to test the authorize() callback directly.
// IMPORTANT: @/auth is loaded via require() inside beforeAll() — not via import —
// so the mock factory runs after `captured` is already initialized.
const captured: { providers: any[] } = { providers: [] }

jest.mock('next-auth', () =>
  jest.fn((config: any) => {
    // Called lazily when require('@/auth') runs in beforeAll — captured is ready
    captured.providers = config.providers
    return { handlers: {}, signIn: jest.fn(), signOut: jest.fn(), auth: jest.fn() }
  })
)

jest.mock('next-auth/providers/credentials', () =>
  jest.fn((config: any) => ({ ...config, type: 'credentials' }))
)

beforeAll(() => {
  // Use require() so the import doesn't get hoisted above `captured`
  require('@/auth')
})

const authorize = () => captured.providers[0].authorize

describe('auth — authorize()', () => {
  beforeEach(() => {
    process.env.ADMIN_USER = 'admin'
    process.env.ADMIN_PASSWORD = 'supersecret'
  })

  afterEach(() => {
    delete process.env.ADMIN_USER
    delete process.env.ADMIN_PASSWORD
  })

  it('returns user object on valid credentials', () => {
    const result = authorize()({ username: 'admin', password: 'supersecret' })
    expect(result).toEqual({ id: '1', name: 'Admin' })
  })

  it('returns null on wrong password', () => {
    const result = authorize()({ username: 'admin', password: 'wrongpass' })
    expect(result).toBeNull()
  })

  it('returns null on wrong username', () => {
    const result = authorize()({ username: 'hacker', password: 'supersecret' })
    expect(result).toBeNull()
  })

  it('returns null when both credentials are wrong', () => {
    const result = authorize()({ username: 'x', password: 'y' })
    expect(result).toBeNull()
  })

  it('returns null when ADMIN_USER env var is missing', () => {
    delete process.env.ADMIN_USER
    const result = authorize()({ username: 'admin', password: 'supersecret' })
    expect(result).toBeNull()
  })

  it('returns null when ADMIN_PASSWORD env var is missing', () => {
    delete process.env.ADMIN_PASSWORD
    const result = authorize()({ username: 'admin', password: 'supersecret' })
    expect(result).toBeNull()
  })

  it('returns null when both env vars are missing', () => {
    delete process.env.ADMIN_USER
    delete process.env.ADMIN_PASSWORD
    const result = authorize()({ username: 'admin', password: 'secret' })
    expect(result).toBeNull()
  })
})
