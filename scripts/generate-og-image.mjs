import sharp from 'sharp'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const width = 1200
const height = 630

const icon = await sharp(join(root, 'public/vinea-icon.png'))
  .resize(140, 140, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
  .toBuffer()

const iconLeft = Math.round((width - 140) / 2)
const iconTop = 56

const svg = Buffer.from(`
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <text x="${width / 2}" y="238" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="34" font-weight="700" fill="#5a4082" letter-spacing="0.04em">Vinea Platform</text>
  <text x="${width / 2}" y="318" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="38" font-weight="600" fill="#1f2937">
    <tspan x="${width / 2}" dy="0">Simplify parish operations.</tspan>
    <tspan x="${width / 2}" dy="50">Strengthen every connection.</tspan>
  </text>
  <text x="${width / 2}" y="448" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="28" fill="#4b5563">
    Serve your people. Grow your parish. Save time.
  </text>
</svg>
`)

await sharp(svg)
  .composite([{ input: icon, left: iconLeft, top: iconTop }])
  .png()
  .toFile(join(root, 'public/og-image.png'))

console.log('Wrote public/og-image.png (1200x630)')
