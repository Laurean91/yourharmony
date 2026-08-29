// Тестируем authorize() у обоих Credentials-провайдеров напрямую.
// ВАЖНО: @/auth загружается через require() внутри beforeAll(), а не import,
// чтобы фабрика мока успела отработать после инициализации `captured`.
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

type Provider = { id: string; authorize: (creds: Record<string, unknown>) => Promise<unknown> }
const captured: { providers: Provider[] } = { providers: [] }

jest.mock('next-auth', () =>
  jest.fn((config: { providers: unknown[] }) => {
    captured.providers = config.providers as never
    return { handlers: {}, signIn: jest.fn(), signOut: jest.fn(), auth: jest.fn() }
  })
)

jest.mock('next-auth/providers/credentials', () =>
  jest.fn((config: Record<string, unknown>) => ({ ...config, type: 'credentials' }))
)

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: jest.fn(), findFirst: jest.fn() },
    magicToken: { findUnique: jest.fn() },
  },
}))

jest.mock('@/lib/auth-log', () => ({ logAuthEvent: jest.fn() }))
jest.mock('bcryptjs', () => ({ __esModule: true, default: { compare: jest.fn() } }))

beforeAll(() => {
  require('@/auth')
})

const db = prisma as unknown as {
  user: { findUnique: jest.Mock; findFirst: jest.Mock }
  magicToken: { findUnique: jest.Mock }
}
const compare = (bcrypt as unknown as { compare: jest.Mock }).compare
const credentialsAuthorize = () => captured.providers.find(p => p.id === 'credentials')!.authorize
const magicAuthorize = () => captured.providers.find(p => p.id === 'magic-link')!.authorize

const teacher = {
  id: 'u1',
  username: 'admin',
  passwordHash: 'hashed',
  role: 'TEACHER',
  parent: null,
}

beforeEach(() => jest.clearAllMocks())

describe('auth — credentials provider', () => {
  it('returns the user when the password matches', async () => {
    db.user.findUnique.mockResolvedValue(teacher)
    compare.mockResolvedValue(true)

    const result = await credentialsAuthorize()({ username: 'admin', password: 'supersecret' })

    expect(result).toEqual({ id: 'u1', name: 'admin', role: 'TEACHER' })
    expect(compare).toHaveBeenCalledWith('supersecret', 'hashed')
  })

  it('normalises the username before the lookup', async () => {
    db.user.findUnique.mockResolvedValue(teacher)
    compare.mockResolvedValue(true)

    await credentialsAuthorize()({ username: '  ADMIN  ', password: 'supersecret' })

    expect(db.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { username: 'admin' } })
    )
  })

  it('prefers the parent name when the account has one', async () => {
    db.user.findUnique.mockResolvedValue({ ...teacher, role: 'PARENT', parent: { name: 'Мария' } })
    compare.mockResolvedValue(true)

    const result = await credentialsAuthorize()({ username: 'maria', password: 'pass' })

    expect(result).toEqual({ id: 'u1', name: 'Мария', role: 'PARENT' })
  })

  it('returns null on a wrong password', async () => {
    db.user.findUnique.mockResolvedValue(teacher)
    compare.mockResolvedValue(false)

    expect(await credentialsAuthorize()({ username: 'admin', password: 'wrong' })).toBeNull()
  })

  it('returns null for an unknown user', async () => {
    db.user.findUnique.mockResolvedValue(null)

    expect(await credentialsAuthorize()({ username: 'ghost', password: 'pass' })).toBeNull()
    expect(compare).not.toHaveBeenCalled()
  })

  it('returns null when a credential is missing', async () => {
    expect(await credentialsAuthorize()({ username: 'admin' })).toBeNull()
    expect(await credentialsAuthorize()({ password: 'pass' })).toBeNull()
    expect(db.user.findUnique).not.toHaveBeenCalled()
  })
})

describe('auth — magic-link provider', () => {
  const validToken = {
    token: 't1',
    email: 'parent@example.com',
    usedAt: null,
    expiresAt: new Date(Date.now() + 60_000),
  }

  it('returns the user for a valid unused token', async () => {
    db.magicToken.findUnique.mockResolvedValue(validToken)
    db.user.findFirst.mockResolvedValue({ id: 'u2', role: 'PARENT', parent: { name: 'Мария' } })

    const result = await magicAuthorize()({ userId: 'u2', token: 't1' })

    expect(result).toMatchObject({ id: 'u2', role: 'PARENT' })
  })

  it('returns null for an already used token', async () => {
    db.magicToken.findUnique.mockResolvedValue({ ...validToken, usedAt: new Date() })

    expect(await magicAuthorize()({ userId: 'u2', token: 't1' })).toBeNull()
  })

  it('returns null for an expired token', async () => {
    db.magicToken.findUnique.mockResolvedValue({ ...validToken, expiresAt: new Date(Date.now() - 60_000) })

    expect(await magicAuthorize()({ userId: 'u2', token: 't1' })).toBeNull()
  })

  it('returns null when the token is unknown', async () => {
    db.magicToken.findUnique.mockResolvedValue(null)

    expect(await magicAuthorize()({ userId: 'u2', token: 'nope' })).toBeNull()
  })
})
