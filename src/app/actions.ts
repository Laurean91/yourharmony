'use server'

import { prisma } from '../lib/prisma'
import { put, del } from '@vercel/blob'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { Resend } from 'resend'
import sharp from 'sharp'

async function notifyIndexNow(slug: string) {
  const key = process.env.INDEXNOW_KEY
  if (!key) return
  await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      host: 'yourharmony-english.ru',
      key,
      urlList: [`https://yourharmony-english.ru/blog/${slug}`],
    }),
  }).catch(() => {})
}

/**
 * Сжимает изображение до WebP с заданными ограничениями.
 * @param file   исходный File
 * @param maxWidth  максимальная ширина в пикселях
 * @param quality   качество WebP (1–100)
 * @returns { buffer, filename } — сжатый буфер и новое имя файла
 */
async function compressImage(
  file: File,
  maxWidth: number,
  quality = 80
): Promise<{ buffer: Buffer; filename: string }> {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = await sharp(Buffer.from(arrayBuffer))
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality })
    .toBuffer()
  const basename = file.name.replace(/\.[^.]+$/, '')
  return { buffer, filename: `${basename}.webp` }
}

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

  // Отправляем уведомление в Telegram если настроен бот
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    try {
      const text =
        `📩 *Новая заявка на занятие*\n\n` +
        `👤 Имя: ${parentName}\n` +
        `🧒 Возраст ребёнка: ${childAge} лет\n` +
        `📞 Телефон: ${phone}`
      const res = await fetch(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: process.env.TELEGRAM_CHAT_ID,
            text,
            parse_mode: 'Markdown',
          }),
        }
      )
      if (!res.ok) {
        const err = await res.text()
        console.error('[Telegram] Ошибка отправки:', err)
      } else {
        console.log('[Telegram] Сообщение отправлено')
      }
    } catch (e) {
      console.error('[Telegram] Исключение при отправке:', e)
    }
  } else {
    console.warn('[Telegram] Пропуск — TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID не заданы')
  }

  // Отправляем email-уведомление если настроен Resend
  if (process.env.RESEND_API_KEY && process.env.NOTIFICATION_EMAIL) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      const fromAddress = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'
      const { data, error } = await resend.emails.send({
        from: `Клуб «Гармония» <${fromAddress}>`,
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
      if (error) {
        console.error('[Resend] Ошибка отправки:', JSON.stringify(error))
      } else {
        console.log('[Resend] Письмо отправлено, id:', data?.id)
      }
    } catch (e) {
      console.error('[Resend] Исключение при отправке email:', e)
    }
  } else {
    console.warn('[Resend] Пропуск отправки — RESEND_API_KEY или NOTIFICATION_EMAIL не заданы')
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

  const { buffer, filename } = await compressImage(file, 1200, 80)
  const blob = await put(filename, buffer, { access: 'public', contentType: 'image/webp' })
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
  name: 'Наталья Владимировна',
  bio: 'Сертифицированный преподаватель английского языка с опытом 7 лет. Специализируется на обучении детей от 4 до 14 лет — в игровой форме, без скучной зубрёжки. Каждый ребёнок уходит с занятия с улыбкой и новыми знаниями.',
  photoUrl: null as string | null,
  badges: 'Сертификат CELTA,Опыт 7 лет,IELTS 8.0,Дети 4–14 лет',
}

export async function getTeacherProfile() {
  try {
    return await prisma.teacherProfile.upsert({
      where: { id: 'singleton' },
      update: {},
      create: DEFAULT_TEACHER,
    })
  } catch {
    return DEFAULT_TEACHER
  }
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
    const { buffer, filename } = await compressImage(photoFile, 600, 85)
    const blob = await put(`teacher/${Date.now()}-${filename}`, buffer, { access: 'public', contentType: 'image/webp' })
    photoUrl = blob.url
  }

  await prisma.teacherProfile.upsert({
    where: { id: 'singleton' },
    update: { name, bio, badges, photoUrl },
    create: { id: 'singleton', name, bio, badges, photoUrl },
  })

  revalidatePath('/')
  revalidatePath('/teacher')
  revalidatePath('/bigbos')
}

// ─── TEACHER PAGE CONTENT ─────────────────────────────────────────────────────

export type TeacherCredential = { icon: string; title: string; description: string }
export type TeacherApproachItem = { title: string; text: string }

const DEFAULT_CREDENTIALS: TeacherCredential[] = [
  { icon: '🎓', title: 'Сертификат CELTA', description: 'Certificate in English Language Teaching to Adults — международный сертификат Кембриджского университета, один из наиболее признанных в мире.' },
  { icon: '📊', title: 'IELTS 8.0', description: 'Высший балл в системе международного тестирования знания английского языка, подтверждающий уровень C2 (экспертный).' },
  { icon: '👦', title: 'Специализация: дети', description: 'Более 7 лет работы исключительно с детьми от 4 до 14 лет. Знает, как объяснить сложное просто и сделать урок интересным для каждого возраста.' },
  { icon: '🎮', title: 'Игровые методики', description: 'Коммуникативный подход в сочетании с ролевыми играми, песнями и творческими заданиями. Дети учатся говорить с первого занятия.' },
]

const DEFAULT_APPROACH: TeacherApproachItem[] = [
  { title: 'Коммуникативный метод', text: 'Дети общаются на английском с первого занятия. Никакой зубрёжки — только живое общение в контексте.' },
  { title: 'Погружение через игру', text: 'Язык осваивается в игровых ситуациях: ролевые игры, диалоги, задания. Ребёнок не переводит — он думает на английском.' },
  { title: 'Индивидуальный подход', text: 'Группы до 8 человек. Каждый ребёнок в поле зрения, получает обратную связь и двигается в комфортном темпе.' },
  { title: 'Позитивная атмосфера', text: 'Поощрение и поддержка — не критика. Ребёнок не боится ошибаться и говорит свободнее.' },
]

export async function getTeacherPageContent() {
  try {
    const [credRow, approachRow, showCredRow, showApproachRow] = await Promise.all([
      prisma.siteSettings.findUnique({ where: { key: 'teacher_credentials' } }),
      prisma.siteSettings.findUnique({ where: { key: 'teacher_approach' } }),
      prisma.siteSettings.findUnique({ where: { key: 'teacher_show_credentials' } }),
      prisma.siteSettings.findUnique({ where: { key: 'teacher_show_approach' } }),
    ])
    return {
      credentials: credRow ? JSON.parse(credRow.value) as TeacherCredential[] : DEFAULT_CREDENTIALS,
      approach: approachRow ? JSON.parse(approachRow.value) as TeacherApproachItem[] : DEFAULT_APPROACH,
      showCredentials: showCredRow ? showCredRow.value === 'true' : true,
      showApproach: showApproachRow ? showApproachRow.value === 'true' : true,
    }
  } catch {
    return { credentials: DEFAULT_CREDENTIALS, approach: DEFAULT_APPROACH, showCredentials: true, showApproach: true }
  }
}

export async function updateTeacherPageContent(formData: FormData) {
  const credentials = JSON.parse(formData.get('credentials') as string) as TeacherCredential[]
  const approach = JSON.parse(formData.get('approach') as string) as TeacherApproachItem[]
  const showCredentials = formData.get('showCredentials') === 'true'
  const showApproach = formData.get('showApproach') === 'true'

  await Promise.all([
    prisma.siteSettings.upsert({
      where: { key: 'teacher_credentials' },
      update: { value: JSON.stringify(credentials) },
      create: { key: 'teacher_credentials', value: JSON.stringify(credentials) },
    }),
    prisma.siteSettings.upsert({
      where: { key: 'teacher_approach' },
      update: { value: JSON.stringify(approach) },
      create: { key: 'teacher_approach', value: JSON.stringify(approach) },
    }),
    prisma.siteSettings.upsert({
      where: { key: 'teacher_show_credentials' },
      update: { value: String(showCredentials) },
      create: { key: 'teacher_show_credentials', value: String(showCredentials) },
    }),
    prisma.siteSettings.upsert({
      where: { key: 'teacher_show_approach' },
      update: { value: String(showApproach) },
      create: { key: 'teacher_show_approach', value: String(showApproach) },
    }),
  ])

  revalidatePath('/teacher')
  revalidatePath('/bigbos/teacher')
}

// ─── BLOG ────────────────────────────────────────────────────────────────────

const POST_PAGE_SIZE = 6

// 6. Список опубликованных постов (с пагинацией, для читателей)
export async function getPosts(page = 1) {
  try {
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
  } catch {
    return { posts: [], total: 0, totalPages: 0 }
  }
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
  try {
    return await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    })
  } catch {
    return []
  }
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
    const { buffer, filename } = await compressImage(coverFile, 1200, 80)
    const blob = await put(`covers/${Date.now()}-${filename}`, buffer, { access: 'public', contentType: 'image/webp' })
    coverImage = blob.url
  }

  try {
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
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('Unique constraint') || msg.includes('unique constraint')) {
      throw new Error(`Статья с таким slug уже существует: «${slug}»`)
    }
    throw new Error('Ошибка при сохранении статьи. Попробуйте ещё раз.')
  }

  revalidatePath('/')
  revalidatePath('/blog')
  revalidatePath('/bigbos/blog')
  if (isPublished) await notifyIndexNow(slug)
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
    const { buffer, filename } = await compressImage(coverFile, 1200, 80)
    const blob = await put(`covers/${Date.now()}-${filename}`, buffer, { access: 'public', contentType: 'image/webp' })
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

  revalidatePath('/')
  revalidatePath('/blog')
  revalidatePath(`/blog/${post.slug}`)
  revalidatePath('/bigbos/blog')
  if (isPublished) await notifyIndexNow(post.slug)
}

// 11. Удаление поста
export async function deletePost(id: string) {
  const post = await prisma.post.findUnique({ where: { id }, select: { coverImage: true } })
  await prisma.post.delete({ where: { id } })
  if (post?.coverImage && isBlobEnabled()) {
    await del(post.coverImage).catch(() => null)
  }
  revalidatePath('/')
  revalidatePath('/blog')
  revalidatePath('/bigbos/blog')
}

// 12. Переключение статуса публикации
export async function togglePostStatus(id: string, currentValue: boolean) {
  const post = await prisma.post.update({
    where: { id },
    data: { isPublished: !currentValue },
  })
  revalidatePath('/')
  revalidatePath('/blog')
  revalidatePath(`/blog/${post.slug}`)
  revalidatePath('/bigbos/blog')
  if (!currentValue) await notifyIndexNow(post.slug)
  redirect('/bigbos/blog')
}

// 13. Все опубликованные посты для sitemap (без пагинации)
export async function getAllPublishedPostSlugs() {
  try {
    return await prisma.post.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
      orderBy: { createdAt: 'desc' },
    })
  } catch {
    return []
  }
}

// 14. Список категорий
export async function getCategories() {
  try {
    return await prisma.category.findMany({ orderBy: { name: 'asc' } })
  } catch {
    return []
  }
}

// 14. Создание категории
export async function createCategory(name: string, slug: string) {
  return await prisma.category.create({ data: { name, slug } })
}

// ─── LANDING SETTINGS ────────────────────────────────────────────────────────

import type { SectionKey } from '../lib/landingTypes'
import { SECTION_DEFAULTS } from '../lib/landingTypes'

export async function getSectionSettings<K extends SectionKey>(key: K): Promise<typeof SECTION_DEFAULTS[K]> {
  try {
    const row = await prisma.siteSettings.findUnique({ where: { key } })
    if (!row) return SECTION_DEFAULTS[key]
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

export async function updateLesson(id: string, formData: FormData) {
  const date = new Date(formData.get('date') as string)
  const title = (formData.get('title') as string)?.trim() || null
  const tag = (formData.get('tag') as string) || 'Индивидуальное'
  const notes = (formData.get('notes') as string)?.trim() || null
  const studentIds = formData.getAll('studentIds') as string[]

  await prisma.lesson.update({ where: { id }, data: { date, title, tag, notes } })

  const existing = await prisma.lessonStudent.findMany({ where: { lessonId: id } })
  const existingIds = existing.map(e => e.studentId)

  const toRemove = existingIds.filter(sid => !studentIds.includes(sid))
  if (toRemove.length > 0) {
    await prisma.lessonStudent.deleteMany({ where: { lessonId: id, studentId: { in: toRemove } } })
  }

  const toAdd = studentIds.filter(sid => !existingIds.includes(sid))
  if (toAdd.length > 0) {
    await prisma.lessonStudent.createMany({ data: toAdd.map(studentId => ({ lessonId: id, studentId })) })
  }

  revalidatePath('/bigbos')
}

export async function moveLessonDate(id: string, isoDate: string) {
  await prisma.lesson.update({ where: { id }, data: { date: new Date(isoDate) } })
  revalidatePath('/bigbos')
}

export async function markAttendance(lessonId: string, studentId: string, attended: boolean) {
  await prisma.lessonStudent.update({
    where: { lessonId_studentId: { lessonId, studentId } },
    data: { attended },
  })
  revalidatePath('/bigbos')
  revalidatePath('/bigbos/finance')
  revalidatePath('/bigbos/students')
}

// ─── Finance ──────────────────────────────────────────────────────────────────

const DEFAULT_PRICE_INDIVIDUAL = 1500
const DEFAULT_PRICE_GROUP = 800

export async function getFinancePrices(): Promise<{ individual: number; group: number }> {
  const rows = await prisma.siteSettings.findMany({
    where: { key: { in: ['price_individual', 'price_group'] } },
  })
  const map = Object.fromEntries(rows.map(r => [r.key, r.value]))
  return {
    individual: map['price_individual'] ? Number(map['price_individual']) : DEFAULT_PRICE_INDIVIDUAL,
    group: map['price_group'] ? Number(map['price_group']) : DEFAULT_PRICE_GROUP,
  }
}

export async function updateFinancePrices(individual: number, group: number) {
  await prisma.siteSettings.upsert({
    where: { key: 'price_individual' },
    create: { key: 'price_individual', value: String(individual) },
    update: { value: String(individual) },
  })
  await prisma.siteSettings.upsert({
    where: { key: 'price_group' },
    create: { key: 'price_group', value: String(group) },
    update: { value: String(group) },
  })
  revalidatePath('/bigbos/finance')
  revalidatePath('/bigbos')
}

export type MonthlyRevenue = { month: string; individual: number; group: number }
export type StudentRevenue = { studentId: string; name: string; tag: string; attended: number; total: number }
export type FinanceStats = {
  monthlyRevenue: MonthlyRevenue[]
  studentRevenue: StudentRevenue[]
  totalThisMonth: number
  totalIndividual: number
  totalGroup: number
}

const MONTH_NAMES = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']

function isGroupLesson(tag: string) {
  return tag === 'Группа' || tag === 'Групповое'
}

export async function getFinanceStats(): Promise<FinanceStats> {
  const prices = await getFinancePrices()

  const lessonStudents = await prisma.lessonStudent.findMany({
    where: { attended: true },
    include: { lesson: true, student: true },
  })

  // Monthly revenue (last 12 months) — build with numeric keys for reliable matching
  const now = new Date()
  const months: MonthlyRevenue[] = []
  const monthKeys: Array<{ year: number; month: number }> = []

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    monthKeys.push({ year: d.getFullYear(), month: d.getMonth() })
    months.push({
      month: `${MONTH_NAMES[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`,
      individual: 0,
      group: 0,
    })
  }

  const thisYear = now.getFullYear()
  const thisMonthNum = now.getMonth()
  let totalThisMonth = 0
  let totalIndividual = 0
  let totalGroup = 0

  const studentMap = new Map<string, StudentRevenue>()

  for (const ls of lessonStudents) {
    const lessonDate = new Date(ls.lesson.date)
    const tag = ls.lesson.tag
    const group = isGroupLesson(tag)
    const price = ls.lesson.price ?? (group ? prices.group : prices.individual)

    // Monthly bucket — match by year+month number (no locale dependency)
    const mIdx = monthKeys.findIndex(
      mk => mk.year === lessonDate.getFullYear() && mk.month === lessonDate.getMonth()
    )
    if (mIdx !== -1) {
      if (group) months[mIdx].group += price
      else months[mIdx].individual += price
    }

    // This month totals
    if (lessonDate.getFullYear() === thisYear && lessonDate.getMonth() === thisMonthNum) {
      totalThisMonth += price
      if (group) totalGroup += price
      else totalIndividual += price
    }

    // Student revenue
    const existing = studentMap.get(ls.studentId)
    if (existing) {
      existing.attended += 1
      existing.total += price
    } else {
      studentMap.set(ls.studentId, {
        studentId: ls.studentId,
        name: ls.student.name,
        tag: ls.student.tag,
        attended: 1,
        total: price,
      })
    }
  }

  const studentRevenue = Array.from(studentMap.values()).sort((a, b) => b.total - a.total)

  return { monthlyRevenue: months, studentRevenue, totalThisMonth, totalIndividual, totalGroup }
}
