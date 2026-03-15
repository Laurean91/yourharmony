import { createBooking, getBookings, uploadPhoto } from './actions'
import { put } from '@vercel/blob'

import { PrismaClient } from '@prisma/client'

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    booking: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    photo: {
      create: jest.fn(),
    }
  }
  return {
    PrismaClient: jest.fn(() => mockPrisma)
  }
})

// Helper to access the mocked singleton
const getPrismaMock = () => {
  return new PrismaClient() as any
}

// Mock revalidatePath
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn()
}))

// Mock Vercel Blob
jest.mock('@vercel/blob', () => ({
  put: jest.fn().mockResolvedValue({ url: 'http://example.com/test.jpg' }),
  del: jest.fn()
}))

describe('Server Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('createBooking should save a booking to database', async () => {
    const formData = new FormData()
    formData.append('parentName', 'John Doe')
    formData.append('childAge', '8')
    formData.append('phone', '555-1234')

    await createBooking(formData)

    const prisma = getPrismaMock()
    expect(prisma.booking.create).toHaveBeenCalledWith({
      data: {
        parentName: 'John Doe',
        childAge: 8,
        phone: '555-1234'
      }
    })
  })

  it('getBookings should return list of bookings', async () => {
    const mockData = [{ id: '1', parentName: 'Jane' }]
    
    const prisma = getPrismaMock()
    prisma.booking.findMany.mockResolvedValueOnce(mockData)

    const result = await getBookings()

    expect(prisma.booking.findMany).toHaveBeenCalledWith({ orderBy: { createdAt: 'desc' } })
    expect(result).toEqual(mockData)
  })

  it('uploadPhoto should return immediately if no file is provided', async () => {
    const formData = new FormData() // empty
    await uploadPhoto(formData)
    
    expect(put).not.toHaveBeenCalled()
  })
})
