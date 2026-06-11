import { describe, expect, it } from 'vitest'
import { normalizeSacramentalRecordWrite } from './sacramentalRecords'

describe('normalizeSacramentalRecordWrite', () => {
  it('requires person name', () => {
    const result = normalizeSacramentalRecordWrite({
      recordType: 'baptism',
      personName: '  ',
      sacramentDate: '',
      place: '',
      minister: '',
      book: '',
      page: '',
      line: '',
      notes: '',
    })
    expect(result.ok).toBe(false)
  })

  it('normalizes date and optional fields', () => {
    const result = normalizeSacramentalRecordWrite({
      recordType: 'marriage',
      personName: 'Ann & Bob',
      sacramentDate: '2026-06-15',
      place: 'St. Mary',
      minister: 'Fr. John',
      book: 'B1',
      page: '12',
      line: '3',
      notes: 'Witnesses on file',
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.payload.record_type).toBe('marriage')
      expect(result.payload.sacrament_date).toBe('2026-06-15')
      expect(result.payload.book).toBe('B1')
    }
  })
})
