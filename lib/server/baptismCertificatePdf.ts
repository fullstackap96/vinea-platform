import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { formatSacramentDateDisplay } from '@/lib/sacramentalRecords'

export type BaptismCertificateInput = {
  personName: string
  sacramentDate: string | null
  place: string | null
  minister: string | null
  book: string | null
  page: string | null
  line: string | null
  parishName: string | null
}

function displayField(value: string | null | undefined): string {
  const s = String(value ?? '').trim()
  return s || 'Not recorded'
}

function sanitizeFilenamePart(value: string): string {
  return (
    value
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 60) || 'certificate'
  )
}

export function baptismCertificateFilename(personName: string): string {
  return `baptism-certificate-${sanitizeFilenamePart(personName)}.pdf`
}

/**
 * Single-page formal baptism certificate (US Letter, printable).
 */
export async function buildBaptismCertificatePdf(
  input: BaptismCertificateInput
): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const page = doc.addPage([612, 792])
  const { width, height } = page.getSize()

  const serif = await doc.embedFont(StandardFonts.TimesRoman)
  const serifBold = await doc.embedFont(StandardFonts.TimesRomanBold)
  const serifItalic = await doc.embedFont(StandardFonts.TimesRomanItalic)

  const margin = 54
  const contentWidth = width - margin * 2
  const ink = rgb(0.12, 0.12, 0.14)
  const muted = rgb(0.35, 0.35, 0.38)

  page.drawRectangle({
    x: margin - 8,
    y: margin - 8,
    width: contentWidth + 16,
    height: height - margin * 2 + 16,
    borderColor: rgb(0.75, 0.75, 0.78),
    borderWidth: 1,
  })

  page.drawRectangle({
    x: margin - 2,
    y: margin - 2,
    width: contentWidth + 4,
    height: height - margin * 2 + 4,
    borderColor: rgb(0.55, 0.55, 0.58),
    borderWidth: 0.5,
  })

  let y = height - margin - 24

  const title = 'Certificate of Baptism'
  const titleSize = 26
  const titleWidth = serifBold.widthOfTextAtSize(title, titleSize)
  page.drawText(title, {
    x: (width - titleWidth) / 2,
    y,
    size: titleSize,
    font: serifBold,
    color: ink,
  })

  y -= 44

  const parishName = displayField(input.parishName)
  if (parishName !== 'Not recorded') {
    const parishLine = parishName
    const parishSize = 13
    const parishWidth = serifItalic.widthOfTextAtSize(parishLine, parishSize)
    page.drawText(parishLine, {
      x: (width - parishWidth) / 2,
      y,
      size: parishSize,
      font: serifItalic,
      color: muted,
    })
    y -= 36
  } else {
    y -= 12
  }

  const intro = 'This is to certify that'
  const introSize = 14
  const introWidth = serif.widthOfTextAtSize(intro, introSize)
  page.drawText(intro, {
    x: (width - introWidth) / 2,
    y,
    size: introSize,
    font: serif,
    color: ink,
  })

  y -= 36

  const name = displayField(input.personName)
  const nameSize = 22
  const nameWidth = serifBold.widthOfTextAtSize(name, nameSize)
  page.drawText(name, {
    x: (width - nameWidth) / 2,
    y,
    size: nameSize,
    font: serifBold,
    color: ink,
  })

  y -= 40

  const received = 'received the Sacrament of Baptism'
  const receivedWidth = serif.widthOfTextAtSize(received, introSize)
  page.drawText(received, {
    x: (width - receivedWidth) / 2,
    y,
    size: introSize,
    font: serif,
    color: ink,
  })

  y -= 48

  const labelSize = 11
  const valueSize = 12
  const lineGap = 28
  const labelX = margin + 24
  const valueX = margin + 168

  const rows: [string, string][] = [
    ['Sacrament', 'Baptism'],
    ['Date', displayField(formatSacramentDateDisplay(input.sacramentDate) || input.sacramentDate)],
    ['Place', displayField(input.place)],
    ['Minister', displayField(input.minister)],
    ['Register book', displayField(input.book)],
    ['Page', displayField(input.page)],
    ['Line', displayField(input.line)],
  ]

  for (const [label, value] of rows) {
    page.drawText(`${label}:`, {
      x: labelX,
      y,
      size: labelSize,
      font: serifBold,
      color: muted,
    })
    page.drawText(value, {
      x: valueX,
      y,
      size: valueSize,
      font: serif,
      color: ink,
    })
    y -= lineGap
  }

  const footer = 'Issued from parish sacramental records.'
  const footerSize = 10
  const footerWidth = serifItalic.widthOfTextAtSize(footer, footerSize)
  page.drawText(footer, {
    x: (width - footerWidth) / 2,
    y: margin + 18,
    size: footerSize,
    font: serifItalic,
    color: muted,
  })

  return doc.save()
}
