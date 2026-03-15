'use server'

import { PrismaClient } from '@prisma/client'
import { put, del } from '@vercel/blob'
import { revalidatePath } from 'next/cache'

let prisma: PrismaClient

function getPrisma() {
  if (!prisma) {
    prisma = new PrismaClient()
  }
  return prisma
}

// 1. Создание заявки с лендинга
export async function createBooking(formData: FormData) {
  const parentName = formData.get('parentName') as string
  const childAge = Number(formData.get('childAge'))
  const phone = formData.get('phone') as string

  await getPrisma().booking.create({
    data: { parentName, childAge, phone }
  })
  
  revalidatePath('/admin')
}

// 2. Получение списка заявок (для админки)
export async function getBookings() {
  return await getPrisma().booking.findMany({ orderBy: { createdAt: 'desc' } })
}

// 3. Обновление статуса заявки
export async function updateBookingStatus(id: string, newStatus: string) {
  await getPrisma().booking.update({
    where: { id },
    data: { status: newStatus }
  })
  revalidatePath('/admin')
}

// 4. Загрузка фото в Vercel Blob и сохранение ссылки в БД
export async function uploadPhoto(formData: FormData) {
  const file = formData.get('file') as File
  if (!file) return

  const blob = await put(file.name, file, { access: 'public' })
  await getPrisma().photo.create({
    data: { url: blob.url }
  })
  
  revalidatePath('/')
  revalidatePath('/admin')
}

// 5. Получение и удаление фото (Галерея)
export async function getPhotos() {
  return await getPrisma().photo.findMany({ orderBy: { createdAt: 'desc' } })
}

export async function deletePhoto(id: string, url: string) {
  await getPrisma().photo.delete({ where: { id } })
  await del(url) // удаляем из Blob
  revalidatePath('/')
  revalidatePath('/admin')
}
