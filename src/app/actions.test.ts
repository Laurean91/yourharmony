import {
  createBooking, getBookings, updateBookingStatus,
  uploadPhoto, getPhotos, deletePhoto,
  getPosts, getPostBySlug, getAllPostsAdmin,
  createPost, deletePost,
  getCategories, createCategory,
} from './actions'
import { put, del } from '@vercel/blob'
import { PrismaClient } from '@prisma/client'

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    booking: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    photo: {
      create: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
    post: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    category: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  }
  return { PrismaClient: jest.fn(() => mockPrisma) }
})

const db = () => new PrismaClient() as any

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))
jest.mock('next/navigation', () => ({ redirect: jest.fn() }))
jest.mock('@vercel/blob', () => ({
  put: jest.fn().mockResolvedValue({ url: 'https://blob.example.com/test.jpg' }),
  del: jest.fn().mockResolvedValue(undefined),
}))

const mockSendEmail = jest.fn().mockResolvedValue({ id: 'email-id-123' })
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: mockSendEmail },
  })),
}))
import { Resend } from 'resend'

beforeEach(() => jest.clearAllMocks())

// ─── createBooking ────────────────────────────────────────────────────────────

describe('createBooking', () => {
  it('saves a booking with valid data', async () => {
    const fd = new FormData()
    fd.append('parentName', 'Иван Иванов')
    fd.append('childAge', '8')
    fd.append('phone', '+7-999-123-45-67')
    await createBooking(fd)
    expect(db().booking.create).toHaveBeenCalledWith({
      data: { parentName: 'Иван Иванов', childAge: 8, phone: '+7-999-123-45-67' },
    })
  })

  it('throws on empty parentName', async () => {
    const fd = new FormData()
    fd.append('parentName', '')
    fd.append('childAge', '8')
    fd.append('phone', '555')
    await expect(createBooking(fd)).rejects.toThrow('Некорректное имя')
  })

  it('throws when parentName exceeds 100 chars', async () => {
    const fd = new FormData()
    fd.append('parentName', 'a'.repeat(101))
    fd.append('childAge', '8')
    fd.append('phone', '555')
    await expect(createBooking(fd)).rejects.toThrow('Некорректное имя')
  })

  it('throws when childAge is 0', async () => {
    const fd = new FormData()
    fd.append('parentName', 'John')
    fd.append('childAge', '0')
    fd.append('phone', '555')
    await expect(createBooking(fd)).rejects.toThrow('Некорректный возраст')
  })

  it('throws when childAge exceeds 18', async () => {
    const fd = new FormData()
    fd.append('parentName', 'John')
    fd.append('childAge', '19')
    fd.append('phone', '555')
    await expect(createBooking(fd)).rejects.toThrow('Некорректный возраст')
  })

  it('throws when childAge is not a number', async () => {
    const fd = new FormData()
    fd.append('parentName', 'John')
    fd.append('childAge', 'abc')
    fd.append('phone', '555')
    await expect(createBooking(fd)).rejects.toThrow('Некорректный возраст')
  })

  it('throws on empty phone', async () => {
    const fd = new FormData()
    fd.append('parentName', 'John')
    fd.append('childAge', '8')
    fd.append('phone', '')
    await expect(createBooking(fd)).rejects.toThrow('Некорректный телефон')
  })

  it('throws when phone exceeds 30 chars', async () => {
    const fd = new FormData()
    fd.append('parentName', 'John')
    fd.append('childAge', '8')
    fd.append('phone', '1'.repeat(31))
    await expect(createBooking(fd)).rejects.toThrow('Некорректный телефон')
  })

  it('sends email notification when RESEND_API_KEY and NOTIFICATION_EMAIL are set', async () => {
    process.env.RESEND_API_KEY = 're_test_key'
    process.env.NOTIFICATION_EMAIL = 'admin@test.com'
    const fd = new FormData()
    fd.append('parentName', 'Мария Петрова')
    fd.append('childAge', '7')
    fd.append('phone', '+7-900-000-00-00')
    await createBooking(fd)
    expect(Resend).toHaveBeenCalledWith('re_test_key')
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'admin@test.com',
        subject: '📩 Новая заявка на занятие',
      })
    )
    const html: string = mockSendEmail.mock.calls[0][0].html
    expect(html).toContain('Мария Петрова')
    expect(html).toContain('7')
    expect(html).toContain('+7-900-000-00-00')
    delete process.env.RESEND_API_KEY
    delete process.env.NOTIFICATION_EMAIL
  })

  it('does not send email when RESEND_API_KEY is missing', async () => {
    delete process.env.RESEND_API_KEY
    process.env.NOTIFICATION_EMAIL = 'admin@test.com'
    const fd = new FormData()
    fd.append('parentName', 'John')
    fd.append('childAge', '8')
    fd.append('phone', '555')
    await createBooking(fd)
    expect(mockSendEmail).not.toHaveBeenCalled()
    delete process.env.NOTIFICATION_EMAIL
  })

  it('does not send email when NOTIFICATION_EMAIL is missing', async () => {
    process.env.RESEND_API_KEY = 're_test_key'
    delete process.env.NOTIFICATION_EMAIL
    const fd = new FormData()
    fd.append('parentName', 'John')
    fd.append('childAge', '8')
    fd.append('phone', '555')
    await createBooking(fd)
    expect(mockSendEmail).not.toHaveBeenCalled()
    delete process.env.RESEND_API_KEY
  })

  it('still saves booking if email sending fails', async () => {
    process.env.RESEND_API_KEY = 're_test_key'
    process.env.NOTIFICATION_EMAIL = 'admin@test.com'
    mockSendEmail.mockRejectedValueOnce(new Error('SMTP error'))
    const fd = new FormData()
    fd.append('parentName', 'John')
    fd.append('childAge', '8')
    fd.append('phone', '555')
    await expect(createBooking(fd)).resolves.toBeUndefined()
    expect(db().booking.create).toHaveBeenCalled()
    delete process.env.RESEND_API_KEY
    delete process.env.NOTIFICATION_EMAIL
  })
})

// ─── getBookings ─────────────────────────────────────────────────────────────

describe('getBookings', () => {
  it('returns bookings ordered by createdAt desc', async () => {
    const mock = [{ id: '1', parentName: 'Jane' }]
    db().booking.findMany.mockResolvedValueOnce(mock)
    const result = await getBookings()
    expect(result).toEqual(mock)
    expect(db().booking.findMany).toHaveBeenCalledWith({ orderBy: { createdAt: 'desc' } })
  })
})

// ─── updateBookingStatus ──────────────────────────────────────────────────────

describe('updateBookingStatus', () => {
  it('updates booking status in db', async () => {
    await updateBookingStatus('id-1', 'Обработана')
    expect(db().booking.update).toHaveBeenCalledWith({
      where: { id: 'id-1' },
      data: { status: 'Обработана' },
    })
  })
})

// ─── uploadPhoto ──────────────────────────────────────────────────────────────

describe('uploadPhoto', () => {
  it('does nothing when no file in formData', async () => {
    await uploadPhoto(new FormData())
    expect(put).not.toHaveBeenCalled()
  })

  it('uploads file to blob and saves url to db', async () => {
    const fd = new FormData()
    const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' })
    fd.append('file', file)
    await uploadPhoto(fd)
    expect(put).toHaveBeenCalledWith('photo.jpg', file, { access: 'public' })
    expect(db().photo.create).toHaveBeenCalledWith({
      data: { url: 'https://blob.example.com/test.jpg' },
    })
  })
})

// ─── getPhotos ────────────────────────────────────────────────────────────────

describe('getPhotos', () => {
  it('returns photos ordered by createdAt desc', async () => {
    const mock = [{ id: '1', url: 'https://blob.example.com/photo.jpg' }]
    db().photo.findMany.mockResolvedValueOnce(mock)
    const result = await getPhotos()
    expect(result).toEqual(mock)
    expect(db().photo.findMany).toHaveBeenCalledWith({ orderBy: { createdAt: 'desc' } })
  })
})

// ─── deletePhoto ──────────────────────────────────────────────────────────────

describe('deletePhoto', () => {
  it('deletes photo from db and removes blob', async () => {
    await deletePhoto('id-1', 'https://blob.example.com/photo.jpg')
    expect(db().photo.delete).toHaveBeenCalledWith({ where: { id: 'id-1' } })
    expect(del).toHaveBeenCalledWith('https://blob.example.com/photo.jpg')
  })
})

// ─── getPosts ─────────────────────────────────────────────────────────────────

describe('getPosts', () => {
  it('returns page 1 with default pagination', async () => {
    const mockPosts = [{ id: '1', title: 'Hello' }]
    db().post.findMany.mockResolvedValueOnce(mockPosts)
    db().post.count.mockResolvedValueOnce(6)
    const result = await getPosts(1)
    expect(result.posts).toEqual(mockPosts)
    expect(result.total).toBe(6)
    expect(result.totalPages).toBe(1)
    expect(db().post.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { isPublished: true }, skip: 0, take: 6 })
    )
  })

  it('calculates correct skip for page 2', async () => {
    db().post.findMany.mockResolvedValueOnce([])
    db().post.count.mockResolvedValueOnce(10)
    const result = await getPosts(2)
    expect(result.totalPages).toBe(2)
    expect(db().post.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 6, take: 6 })
    )
  })
})

// ─── getPostBySlug ────────────────────────────────────────────────────────────

describe('getPostBySlug', () => {
  it('returns post matching the slug', async () => {
    const mockPost = { id: '1', slug: 'my-post', title: 'My Post' }
    db().post.findUnique.mockResolvedValueOnce(mockPost)
    const result = await getPostBySlug('my-post')
    expect(result).toEqual(mockPost)
    expect(db().post.findUnique).toHaveBeenCalledWith({
      where: { slug: 'my-post' },
      include: { category: true },
    })
  })

  it('returns null when post not found', async () => {
    db().post.findUnique.mockResolvedValueOnce(null)
    const result = await getPostBySlug('missing')
    expect(result).toBeNull()
  })
})

// ─── getAllPostsAdmin ──────────────────────────────────────────────────────────

describe('getAllPostsAdmin', () => {
  it('returns all posts including drafts', async () => {
    const mockPosts = [
      { id: '1', isPublished: true },
      { id: '2', isPublished: false },
    ]
    db().post.findMany.mockResolvedValueOnce(mockPosts)
    const result = await getAllPostsAdmin()
    expect(result).toEqual(mockPosts)
    expect(db().post.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { createdAt: 'desc' } })
    )
  })
})

// ─── createPost ───────────────────────────────────────────────────────────────

describe('createPost', () => {
  it('creates post without cover when blob disabled', async () => {
    delete process.env.BLOB_READ_WRITE_TOKEN
    const fd = new FormData()
    fd.append('title', 'My Post')
    fd.append('slug', 'my-post')
    fd.append('content', '<p>Hello</p>')
    fd.append('isPublished', 'false')
    await createPost(fd)
    expect(put).not.toHaveBeenCalled()
    expect(db().post.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ title: 'My Post', slug: 'my-post', isPublished: false }),
      })
    )
  })

  it('uploads cover and saves url when blob enabled', async () => {
    process.env.BLOB_READ_WRITE_TOKEN = 'test-token'
    const fd = new FormData()
    fd.append('title', 'With Cover')
    fd.append('slug', 'with-cover')
    fd.append('content', '<p>text</p>')
    fd.append('isPublished', 'true')
    const coverFile = new File(['img'], 'cover.jpg', { type: 'image/jpeg' })
    fd.append('coverFile', coverFile)
    await createPost(fd)
    expect(put).toHaveBeenCalled()
    expect(db().post.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ coverImage: 'https://blob.example.com/test.jpg' }),
      })
    )
    delete process.env.BLOB_READ_WRITE_TOKEN
  })
})

// ─── deletePost ───────────────────────────────────────────────────────────────

describe('deletePost', () => {
  it('deletes post without removing blob when no cover', async () => {
    db().post.findUnique.mockResolvedValueOnce({ coverImage: null })
    await deletePost('id-1')
    expect(db().post.delete).toHaveBeenCalledWith({ where: { id: 'id-1' } })
    expect(del).not.toHaveBeenCalled()
  })

  it('removes cover from blob when blob enabled and cover exists', async () => {
    process.env.BLOB_READ_WRITE_TOKEN = 'test-token'
    db().post.findUnique.mockResolvedValueOnce({ coverImage: 'https://blob.example.com/cover.jpg' })
    await deletePost('id-1')
    expect(del).toHaveBeenCalledWith('https://blob.example.com/cover.jpg')
    delete process.env.BLOB_READ_WRITE_TOKEN
  })
})

// ─── getCategories ────────────────────────────────────────────────────────────

describe('getCategories', () => {
  it('returns categories ordered by name asc', async () => {
    const mock = [{ id: '1', name: 'Английский' }]
    db().category.findMany.mockResolvedValueOnce(mock)
    const result = await getCategories()
    expect(result).toEqual(mock)
    expect(db().category.findMany).toHaveBeenCalledWith({ orderBy: { name: 'asc' } })
  })
})

// ─── createCategory ───────────────────────────────────────────────────────────

describe('createCategory', () => {
  it('creates a category with name and slug', async () => {
    const mock = { id: '1', name: 'Грамматика', slug: 'grammatika' }
    db().category.create.mockResolvedValueOnce(mock)
    const result = await createCategory('Грамматика', 'grammatika')
    expect(result).toEqual(mock)
    expect(db().category.create).toHaveBeenCalledWith({
      data: { name: 'Грамматика', slug: 'grammatika' },
    })
  })
})
