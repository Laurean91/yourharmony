'use server'

import { PrismaClient } from '@prisma/client'
import { put, del } from '@vercel/blob'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

/** Возвращает true, если Vercel Blob настроен (есть токен) */
function isBlobEnabled() {
  return !!process.env.BLOB_READ_WRITE_TOKEN
}

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
  await del(url)
  revalidatePath('/')
  revalidatePath('/admin')
}

// ─── BLOG ────────────────────────────────────────────────────────────────────

const POST_PAGE_SIZE = 6

// 6. Список опубликованных постов (с пагинацией, для читателей)
export async function getPosts(page = 1) {
  const skip = (page - 1) * POST_PAGE_SIZE
  const [posts, total] = await Promise.all([
    getPrisma().post.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: POST_PAGE_SIZE,
      include: { category: true },
    }),
    getPrisma().post.count({ where: { isPublished: true } }),
  ])
  return { posts, total, totalPages: Math.ceil(total / POST_PAGE_SIZE) }
}

// 7. Пост по slug (для страницы статьи)
export async function getPostBySlug(slug: string) {
  return await getPrisma().post.findUnique({
    where: { slug },
    include: { category: true },
  })
}

// 8. Все посты для административной таблицы
export async function getAllPostsAdmin() {
  return await getPrisma().post.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: true },
  })
}

// 9. Создание поста
export async function createPost(formData: FormData) {
  const title = formData.get('title') as string
  const slug = formData.get('slug') as string
  const excerpt = formData.get('excerpt') as string
  const content = formData.get('content') as string
  const categoryId = formData.get('categoryId') as string | null
  const isPublished = formData.get('isPublished') === 'true'

  let coverImage: string | undefined
  const coverFile = formData.get('coverFile') as File | null
  if (coverFile && coverFile.size > 0 && isBlobEnabled()) {
    const blob = await put(`covers/${Date.now()}-${coverFile.name}`, coverFile, { access: 'public' })
    coverImage = blob.url
  }

  await getPrisma().post.create({
    data: {
      title,
      slug,
      excerpt: excerpt || null,
      content,
      coverImage,
      isPublished,
      categoryId: categoryId || null,
    },
  })

  revalidatePath('/blog')
  revalidatePath('/admin/blog')
}

// 10. Обновление поста
export async function updatePost(id: string, formData: FormData) {
  const title = formData.get('title') as string
  const slug = formData.get('slug') as string
  const excerpt = formData.get('excerpt') as string
  const content = formData.get('content') as string
  const categoryId = formData.get('categoryId') as string | null
  const isPublished = formData.get('isPublished') === 'true'
  const existingCoverImage = formData.get('existingCoverImage') as string | null

  let coverImage: string | null = existingCoverImage
  const coverFile = formData.get('coverFile') as File | null
  if (coverFile && coverFile.size > 0 && isBlobEnabled()) {
    const blob = await put(`covers/${Date.now()}-${coverFile.name}`, coverFile, { access: 'public' })
    coverImage = blob.url
  }

  const post = await getPrisma().post.update({
    where: { id },
    data: {
      title,
      slug,
      excerpt: excerpt || null,
      content,
      coverImage: coverImage || null,
      isPublished,
      categoryId: categoryId || null,
    },
  })

  revalidatePath('/blog')
  revalidatePath(`/blog/${post.slug}`)
  revalidatePath('/admin/blog')
}

// 11. Удаление поста
export async function deletePost(id: string) {
  await getPrisma().post.delete({ where: { id } })
  revalidatePath('/blog')
  revalidatePath('/admin/blog')
}

// 12. Переключение статуса публикации
export async function togglePostStatus(id: string, currentValue: boolean) {
  const post = await getPrisma().post.update({
    where: { id },
    data: { isPublished: !currentValue },
  })
  revalidatePath('/blog')
  revalidatePath(`/blog/${post.slug}`)
  revalidatePath('/admin/blog')
  redirect('/admin/blog')
}

// 13. Список категорий
export async function getCategories() {
  return await getPrisma().category.findMany({ orderBy: { name: 'asc' } })
}

// 14. Создание категории
export async function createCategory(name: string, slug: string) {
  return await getPrisma().category.create({ data: { name, slug } })
}
