import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  join(
    process.cwd(),
    'app',
    'dashboard',
    'records',
    '[id]',
    '_components',
    'RecordCertificateDownloadButton.tsx',
  ),
  'utf8',
)

describe('record certificate generation confirmation boundary', () => {
  it('opens the shared confirmation instead of generating directly', () => {
    expect(source).toContain("import { VineaConfirmDialog }")
    expect(source).toContain('onClick={() => setConfirmOpen(true)}')
    expect(source).not.toContain('onClick={generateCertificate}')
    expect(source).toContain('open={confirmOpen}')
    expect(source).toContain('title="Generate this Baptism certificate?"')
    expect(source).toContain('confirmLabel="Generate certificate"')
  })

  it('keeps cancellation side-effect free and generates only after confirmation', () => {
    expect(source).toContain('onCancel={() => setConfirmOpen(false)}')
    expect(source).toContain('void generateCertificate()')

    const dialogStart = source.indexOf('open={confirmOpen}')
    const dialogEnd = source.indexOf('/>', dialogStart)
    const dialog = source.slice(dialogStart, dialogEnd)
    expect(dialog.indexOf('setConfirmOpen(false)')).toBeGreaterThan(-1)
    expect(dialog.indexOf('void generateCertificate()')).toBeGreaterThan(
      dialog.indexOf('setConfirmOpen(false)'),
    )
  })

  it('keeps register review and canonical boundaries explicit', () => {
    expect(source).toContain('current sacramental record values')
    expect(source).toContain('log certificate activity for staff review')
    expect(source).toContain('does not determine sacramental eligibility')
    expect(source).toContain('make a canonical decision')
  })
})
