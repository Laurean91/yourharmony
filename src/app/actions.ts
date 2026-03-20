'use server'

import { prisma } from '../lib/prisma'
import { put, del } from '@vercel/blob'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { Resend } from 'resend'

/** Возвращает true, если Vercel Blob настроен (есть токен) */
function isBlobEnabled() {
  return !!process.env.BLOB_READ_WRITE_TOKEN
}

// 1. Создание заявки с лендинга
export async function createBooking(formData: FormData) {
  const parentName = (formData.get('parentName') as string)?.trim()
  const childAge = Number(formData.get('childAge'))
  const phone = (formData.get('phone') as string)?.trim()

  if (!parentName || parentName.length > 100) throw new Error('Некорректное имя')
  if (isNaN(childAge) || childAge < 1 || childAge > 18) throw new Error('Некорректный возраст')
  if (!phone || phone.length > 30) throw new Error('Некорректный телефон')

  await prisma.booking.create({
    data: { parentName, childAge, phone }
  })

  // Отправляем email-уведомление если настроен Resend
  if (process.env.RESEND_API_KEY && process.env.NOTIFICATION_EMAIL) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: 'YourHarmony <onboarding@resend.dev>',
        to: process.env.NOTIFICATION_EMAIL,
        subject: '📩 Новая заявка на занятие',
        html: `
          <h2>Новая заявка на занятие</h2>
          <table style="border-collapse:collapse;width:100%;max-width:400px">
            <tr>
              <td style="padding:8px 12px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:600">Имя родителя</td>
              <td style="padding:8px 12px;border:1px solid #e5e7eb">${parentName}</td>
            </tr>
            <tr>
              <td style="padding:8px 12px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:600">Возраст ребёнка</td>
              <td style="padding:8px 12px;border:1px solid #e5e7eb">${childAge} лет</td>
            </tr>
            <tr>
              <td style="padding:8px 12px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:600">Телефон</td>
              <td style="padding:8px 12px;border:1px solid #e5e7eb">${phone}</td>
            </tr>
          </table>
          <p style="margin-top:16px;color:#6b7280;font-size:14px">
            Просмотреть все заявки: <a href="${process.env.NEXTAUTH_URL ?? ''}/bigbos">/bigbos</a>
          </p>
        `,
      })
    } catch (e) {
      // Не блокируем сохранение заявки из-за ошибки email
      console.error('Ошибка отправки email:', e)
    }
  }

  revalidatePath('/bigbos')
}

// 2. Получение списка заявок (для админки)
export async function getBookings() {
  return await prisma.booking.findMany({ orderBy: { createdAt: 'desc' } })
}

// 3. Обновление статуса заявки
export async function updateBookingStatus(id: string, newStatus: string) {
  await prisma.booking.update({
    where: { id },
    data: { status: newStatus }
  })
  revalidatePath('/bigbos')
}

// 4. Удаление заявки
export async function deleteBooking(id: string) {
  await prisma.booking.delete({ where: { id } })
  revalidatePath('/bigbos')
}

// 5. Загрузка фото в Vercel Blob и сохранение ссылки в БД
export async function uploadPhoto(formData: FormData) {
  const file = formData.get('file') as File
  if (!file) return

  const blob = await put(file.name, file, { access: 'public' })
  await prisma.photo.create({
    data: { url: blob.url }
  })
  
  revalidatePath('/')
  revalidatePath('/bigbos')
}

// 5. Получение и удаление фото (Галерея)
export async function getPhotos() {
  return await prisma.photo.findMany({ orderBy: { createdAt: 'desc' } })
}

export async function deletePhoto(id: string, url: string) {
  await prisma.photo.delete({ where: { id } })
  await del(url)
  revalidatePath('/')
  revalidatePath('/bigbos')
}

// ─── TEACHER PROFILE ─────────────────────────────────────────────────────────

const DEFAULT_TEACHER = {
  id: 'singleton',
  name: 'Анна Сергеевна',
  bio: 'Сертифицированный преподаватель английского языка с опытом 7 лет. Специализируется на обучении детей от 6 до 14 лет — в игровой форме, без скучной зубрёжки. Каждый ребёнок уходит с занятия с улыбкой и новыми знаниями.',
  photoUrl: null as string | null,
  badges: 'Сертификат CELTA,Опыт 7 лет,IELTS 8.0,Дети 6–14 лет',
}

export async function getTeacherProfile() {
  return await prisma.teacherProfile.upsert({
    where: { id: 'singleton' },
    update: {},
    create: DEFAULT_TEACHER,
  })
}

export async function updateTeacherProfile(formData: FormData) {
  const name = (formData.get('name') as string)?.trim()
  const bio = (formData.get('bio') as string)?.trim()
  const badges = (formData.get('badges') as string)?.trim()
  const existingPhotoUrl = formData.get('existingPhotoUrl') as string | null

  let photoUrl: string | null = existingPhotoUrl || null
  const photoFile = formData.get('photoFile') as File | null
  if (photoFile && photoFile.size > 0 && isBlobEnabled()) {
    if (photoUrl) await del(photoUrl).catch(() => null)
    const blob = await put(`teacher/${Date.now()}-${photoFile.name}`, photoFile, { access: 'public' })
    photoUrl = blob.url
  }

  await prisma.teacherProfile.upsert({
    where: { id: 'singleton' },
    update: { name, bio, badges, photoUrl },
    create: { id: 'singleton', name, bio, badges, photoUrl },
  })

  revalidatePath('/')
  revalidatePath('/bigbos')
}

// ─── BLOG ────────────────────────────────────────────────────────────────────

const POST_PAGE_SIZE = 6

// 6. Список опубликованных постов (с пагинацией, для читателей)
export async function getPosts(page = 1) {
  const skip = (page - 1) * POST_PAGE_SIZE
  const posts = await prisma.post.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
    skip,
    take: POST_PAGE_SIZE,
    include: { category: true },
  })
  const total = await prisma.post.count({ where: { isPublished: true } })
  return { posts, total, totalPages: Math.ceil(total / POST_PAGE_SIZE) }
}

// 7. Пост по slug (для страницы статьи)
export async function getPostBySlug(slug: string) {
  return await prisma.post.findUnique({
    where: { slug },
    include: { category: true },
  })
}

// 8. Все посты для административной таблицы
export async function getAllPostsAdmin() {
  return await prisma.post.findMany({
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

  await prisma.post.create({
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
  revalidatePath('/bigbos/blog')
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
    // Удаляем старую обложку из Vercel Blob, если она была
    if (existingCoverImage) {
      await del(existingCoverImage).catch(() => null)
    }
    coverImage = blob.url
  }

  const post = await prisma.post.update({
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
  revalidatePath('/bigbos/blog')
}

// 11. Удаление поста
export async function deletePost(id: string) {
  const post = await prisma.post.findUnique({ where: { id }, select: { coverImage: true } })
  await prisma.post.delete({ where: { id } })
  if (post?.coverImage && isBlobEnabled()) {
    await del(post.coverImage).catch(() => null)
  }
  revalidatePath('/blog')
  revalidatePath('/bigbos/blog')
}

// 12. Переключение статуса публикации
export async function togglePostStatus(id: string, currentValue: boolean) {
  const post = await prisma.post.update({
    where: { id },
    data: { isPublished: !currentValue },
  })
  revalidatePath('/blog')
  revalidatePath(`/blog/${post.slug}`)
  revalidatePath('/bigbos/blog')
  redirect('/bigbos/blog')
}

// 13. Список категорий
export async function getCategories() {
  return await prisma.category.findMany({ orderBy: { name: 'asc' } })
}

// 14. Создание категории
export async function createCategory(name: string, slug: string) {
  return await prisma.category.create({ data: { name, slug } })
}

// ─── LANDING SETTINGS ────────────────────────────────────────────────────────

import type { SectionKey } from '../lib/landingTypes'
import { SECTION_DEFAULTS } from '../lib/landingTypes'

export async function getSectionSettings<K extends SectionKey>(key: K): Promise<typeof SECTION_DEFAULTS[K]> {
  const row = await prisma.siteSettings.findUnique({ where: { key } })
  if (!row) return SECTION_DEFAULTS[key]
  try {
    return JSON.parse(row.value) as typeof SECTION_DEFAULTS[K]
  } catch {
    return SECTION_DEFAULTS[key]
  }
}

export async function updateSectionSettings(key: SectionKey, data: unknown) {
  await prisma.siteSettings.upsert({
    where: { key },
    update: { value: JSON.stringify(data) },
    create: { key, value: JSON.stringify(data) },
  })
  revalidatePath('/')
  revalidatePath('/bigbos/landing')
}

// ─── STUDENTS ────────────────────────────────────────────────────────────────

export async function getStudents() {
  return await prisma.student.findMany({
    orderBy: { name: 'asc' },
    include: {
      lessons: {
        include: { lesson: true },
      },
    },
  })
}

export async function createStudent(formData: FormData) {
  const name = (formData.get('name') as string)?.trim()
  const age = formData.get('age') ? Number(formData.get('age')) : null
  const phone = (formData.get('phone') as string)?.trim() || null
  const tag = (formData.get('tag') as string) || 'Индивидуальное'
  const notes = (formData.get('notes') as string)?.trim() || null

  if (!name) throw new Error('Имя обязательно')
  await prisma.student.create({ data: { name, age, phone, tag, notes } })
  revalidatePath('/bigbos/students')
}

export async function updateStudent(id: string, formData: FormData) {
  const name = (formData.get('name') as string)?.trim()
  const age = formData.get('age') ? Number(formData.get('age')) : null
  const phone = (formData.get('phone') as string)?.trim() || null
  const tag = (formData.get('tag') as string) || 'Индивидуальное'
  const notes = (formData.get('notes') as string)?.trim() || null

  if (!name) throw new Error('Имя обязательно')
  await prisma.student.update({ where: { id }, data: { name, age, phone, tag, notes } })
  revalidatePath('/bigbos/students')
}

export async function deleteStudent(id: string) {
  await prisma.student.delete({ where: { id } })
  revalidatePath('/bigbos/students')
  revalidatePath('/bigbos')
}

// ─── LESSONS ─────────────────────────────────────────────────────────────────

export async function getLessons() {
  return await prisma.lesson.findMany({
    orderBy: { date: 'asc' },
    include: { students: { include: { student: true } } },
  })
}

export async function createLesson(formData: FormData) {
  const date = new Date(formData.get('date') as string)
  const title = (formData.get('title') as string)?.trim() || null
  const tag = (formData.get('tag') as string) || 'Индивидуальное'
  const notes = (formData.get('notes') as string)?.trim() || null
  const studentIds = formData.getAll('studentIds') as string[]

  const lesson = await prisma.lesson.create({
    data: {
      date,
      title,
      tag,
      notes,
      students: {
        create: studentIds.map(studentId => ({ studentId })),
      },
    },
  })
  revalidatePath('/bigbos')
  return lesson
}

export async function deleteLesson(id: string) {
  await prisma.lesson.delete({ where: { id } })
  revalidatePath('/bigbos')
}

export async function markAttendance(lessonId: string, studentId: string, attended: boolean) {
  await prisma.lessonStudent.update({
    where: { lessonId_studentId: { lessonId, studentId } },
    data: { attended },
  })
  revalidatePath('/bigbos')
  revalidatePath('/bigbos/students')
}
