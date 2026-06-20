import { describe, expect, it } from 'vitest'
import {
  applyColumnMapping,
  buildImportPreview,
  guessColumnMapping,
  parseCsv,
} from '@/lib/parishDataImport'

describe('parishDataImport', () => {
  it('parses quoted CSV cells and guesses people columns', () => {
    const parsed = parseCsv(
      'First name,Last name,Email,Notes\n"Maria, Jr.",Santos,maria@example.com,"Prefers ""Maria"""\n'
    )

    expect(parsed.headers).toEqual(['First name', 'Last name', 'Email', 'Notes'])
    expect(parsed.rows[0]).toMatchObject({
      'First name': 'Maria, Jr.',
      'Last name': 'Santos',
      Email: 'maria@example.com',
      Notes: 'Prefers "Maria"',
    })

    const mapping = guessColumnMapping('people', parsed.headers)
    expect(mapping.firstName).toBe('First name')
    expect(mapping.lastName).toBe('Last name')
    expect(mapping.email).toBe('Email')
  })

  it('validates required people fields and duplicate warnings', () => {
    const parsed = parseCsv(
      'First name,Last name,Email\nMaria,Santos,maria@example.com\nMaria,Santos,maria@example.com\n,NoFirst,broken\n'
    )
    const rows = applyColumnMapping(parsed, guessColumnMapping('people', parsed.headers))
    const preview = buildImportPreview('people', rows, [
      {
        first_name: 'Maria',
        last_name: 'Santos',
        email: 'maria@example.com',
        phone: null,
      },
    ])

    expect(preview.totalRows).toBe(3)
    expect(preview.importableRows).toBe(2)
    expect(preview.errorCount).toBe(2)
    expect(preview.warningCount).toBe(3)
    expect(preview.preparedRows[2].issues.map((issue) => issue.message)).toContain(
      'First name is required.'
    )
    expect(preview.preparedRows[2].issues.map((issue) => issue.message)).toContain(
      'Email does not look valid.'
    )
  })

  it('rejects unknown sacramental record types instead of defaulting them', () => {
    const parsed = parseCsv('Record type,Person name,Sacrament date\nUnknown,Maria Santos,2024-04-01\n')
    const rows = applyColumnMapping(
      parsed,
      guessColumnMapping('sacramental_records', parsed.headers)
    )
    const preview = buildImportPreview('sacramental_records', rows)

    expect(preview.importableRows).toBe(0)
    expect(preview.errorCount).toBe(1)
    expect(preview.preparedRows[0].issues[0].message).toBe('Record type was not recognized.')
  })
})
