import { prisma } from '@/lib/prisma'
import { createHash, randomUUID } from 'crypto'

const REFRESH_TOKEN_TTL_DAYS = 7

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

function expiresAt(): Date {
  const d = new Date()
  d.setDate(d.getDate() + REFRESH_TOKEN_TTL_DAYS)
  return d
}

/** Создаёт новый refresh-токен для пользователя. Возвращает plaintext-токен (отправляется в cookie). */
export async function createRefreshToken(
  userId: string,
  family?: string,
): Promise<string> {
  const token = randomUUID()
  const tokenFamily = family ?? randomUUID()

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      family: tokenFamily,
      expiresAt: expiresAt(),
    },
  })

  return token
}

/** Ротирует refresh-токен:
 *  - Если токен уже использован (revoked) → отзываем всю цепочку (family) — признак кражи.
 *  - Если токен валиден → создаём новый, старый помечаем как revoked.
 *  Возвращает новый plaintext-токен или null при ошибке.
 */
export async function rotateRefreshToken(
  plaintext: string,
): Promise<{ newToken: string; userId: string } | null> {
  const tokenHash = hashToken(plaintext)

  const existing = await prisma.refreshToken.findUnique({ where: { tokenHash } })

  if (!existing) return null

  // Токен уже отозван — признак повторного использования (кража)
  if (existing.revokedAt) {
    await prisma.refreshToken.updateMany({
      where: { family: existing.family },
      data: { revokedAt: new Date() },
    })
    return null
  }

  // Токен истёк
  if (existing.expiresAt < new Date()) return null

  // Отзываем использованный токен
  await prisma.refreshToken.update({
    where: { id: existing.id },
    data: { revokedAt: new Date() },
  })

  // Выдаём новый токен той же цепочки
  const newToken = await createRefreshToken(existing.userId, existing.family)

  return { newToken, userId: existing.userId }
}

/** Отзывает все refresh-токены пользователя (при logout). */
export async function revokeAllUserTokens(userId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  })
}
