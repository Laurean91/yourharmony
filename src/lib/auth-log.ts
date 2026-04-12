import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

export type AuthAction =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAIL'
  | 'LOGOUT'
  | 'TOKEN_REFRESH'
  | 'MAGIC_LINK_SENT'
  | 'MAGIC_LINK_USED'
  | 'TOTP_VERIFIED'
  | 'TOTP_FAIL'

export async function logAuthEvent(
  action: AuthAction,
  userId?: string,
): Promise<void> {
  try {
    const hdrs = await headers()
    const ip =
      hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      hdrs.get('x-real-ip') ??
      undefined
    const userAgent = hdrs.get('user-agent') ?? undefined

    await prisma.authEvent.create({
      data: { action, userId, ip, userAgent },
    })
  } catch {
    // Логирование не должно ломать основной flow
  }
}
