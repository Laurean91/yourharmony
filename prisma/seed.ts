/**
 * Seed: создаёт запись администратора (TEACHER) в таблице User.
 * Запускается один раз при первом деплое или после миграции с .env-подхода.
 *
 * Использование: npx tsx prisma/seed.ts
 * (или через: npx prisma db seed)
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const username = process.env.ADMIN_USER
  const password = process.env.ADMIN_PASSWORD

  if (!username || !password) {
    throw new Error('ADMIN_USER и ADMIN_PASSWORD должны быть заданы в .env')
  }

  const existing = await prisma.user.findUnique({ where: { username } })
  if (existing) {
    console.log(`Пользователь "${username}" уже существует, пропускаем.`)
    return
  }

  const passwordHash = await bcrypt.hash(password, 12)

  await prisma.user.create({
    data: {
      username,
      passwordHash,
      role: 'TEACHER',
    },
  })

  console.log(`✓ Администратор "${username}" создан в БД.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
