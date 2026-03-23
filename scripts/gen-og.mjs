import sharp from 'sharp'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

await sharp(resolve(root, 'public/logo.png'))
  .resize(1200, 630, { fit: 'cover', position: 'centre' })
  .webp({ quality: 85 })
  .toFile(resolve(root, 'public/og-image.webp'))

console.log('✓ public/og-image.webp (1200×630) создан')
