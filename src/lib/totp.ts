import * as OTPAuth from 'otpauth'
import QRCode from 'qrcode'

const APP_NAME = 'Гармония'

/** Генерирует новый TOTP-секрет и QR-код для Google Authenticator */
export async function generateTotpSetup(username: string): Promise<{
  secret: string
  qrCodeDataUrl: string
  otpauthUrl: string
}> {
  const totp = new OTPAuth.TOTP({
    issuer: APP_NAME,
    label: username,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: new OTPAuth.Secret(),
  })

  const otpauthUrl = totp.toString()
  const secret = totp.secret.base32
  const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl)

  return { secret, qrCodeDataUrl, otpauthUrl }
}

/** Верифицирует TOTP-код по секрету. Окно ±1 период (30 сек) */
export function verifyTotpCode(secret: string, code: string): boolean {
  const totp = new OTPAuth.TOTP({
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret),
  })

  const delta = totp.validate({ token: code, window: 1 })
  return delta !== null
}
