import { describe, expect, it } from 'vitest'
import { buildBaptismCertificatePdf, baptismCertificateFilename } from './baptismCertificatePdf'

describe('buildBaptismCertificatePdf', () => {
  it('returns PDF bytes starting with PDF header', async () => {
    const bytes = await buildBaptismCertificatePdf({
      personName: 'Lucia Smith',
      sacramentDate: '2026-06-15',
      place: 'St. Mary Church',
      minister: 'Fr. John Doe',
      book: 'Baptism Register I',
      page: '42',
      line: '7',
      parishName: 'St. Mary Parish',
    })
    expect(bytes.length).toBeGreaterThan(500)
    expect(String.fromCharCode(...bytes.slice(0, 4))).toBe('%PDF')
  })

  it('builds a safe filename from person name', () => {
    expect(baptismCertificateFilename('Lucia Smith')).toBe('baptism-certificate-Lucia-Smith.pdf')
  })
})
