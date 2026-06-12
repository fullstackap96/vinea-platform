import sharp from 'sharp'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const width = 1200
const height = 630
const dividerX = 518
const leftCenterX = Math.round(dividerX / 2)
const rightTextX = 560
const rightTextWidth = width - rightTextX - 56

const iconTargetWidth = 280

async function loadTransparentIcon() {
  const { data, info } = await sharp(join(root, 'public/vinea-icon.png'))
    .resize(iconTargetWidth, null, { fit: 'inside' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    if (r < 28 && g < 28 && b < 28) {
      data[i + 3] = 0
    }
  }

  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer()
}

const icon = await loadTransparentIcon()
const iconMeta = await sharp(icon).metadata()
const iconWidth = iconMeta.width ?? iconTargetWidth
const iconHeight = iconMeta.height ?? iconTargetWidth

const brandTextHeight = 44
const iconBrandGap = 28
const leftBlockHeight = iconHeight + iconBrandGap + brandTextHeight
const leftBlockTop = Math.round((height - leftBlockHeight) / 2)
const iconLeft = leftCenterX - Math.round(iconWidth / 2)
const iconTop = leftBlockTop
const brandTextY = iconTop + iconHeight + iconBrandGap + 30

const svg = Buffer.from(`
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <line x1="${dividerX}" y1="88" x2="${dividerX}" y2="${height - 88}" stroke="#6B4E9B" stroke-width="3" stroke-linecap="round" opacity="0.45"/>
  <text x="${leftCenterX}" y="${brandTextY}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="36" font-weight="700" fill="#5a4082" letter-spacing="0.03em">Vinea Platform</text>
  <text x="${rightTextX + rightTextWidth / 2}" y="248" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="48" font-weight="700" fill="#111827">
    <tspan x="${rightTextX + rightTextWidth / 2}" dy="0">All your parish operations</tspan>
    <tspan x="${rightTextX + rightTextWidth / 2}" dy="60">in one platform.</tspan>
  </text>
  <text x="${rightTextX + rightTextWidth / 2}" y="418" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="31" font-weight="500" fill="#4b5563">
    <tspan x="${rightTextX + rightTextWidth / 2}" dy="0">Serve your people. Grow your parish.</tspan>
    <tspan x="${rightTextX + rightTextWidth / 2}" dy="44">Save time.</tspan>
  </text>
</svg>
`)

await sharp(svg)
  .composite([{ input: icon, left: iconLeft, top: iconTop }])
  .png()
  .toFile(join(root, 'public/og-image.png'))

console.log('Wrote public/og-image.png (1200x630)')
