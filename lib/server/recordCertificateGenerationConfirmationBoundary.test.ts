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

  it('bounds browser confirmation and freezes retry after an ambiguous result', () => {
    expect(source).toContain('const generationInFlightRef = useRef(false)')
    expect(source).toContain(
      'if (generationInFlightRef.current || generationRequiresRefresh) return',
    )
    expect(source).toContain(
      'signal: AbortSignal.timeout(RECORD_CERTIFICATE_CONFIRMATION_TIMEOUT_MS)',
    )
    expect(source).toContain('setGenerationRequiresRefresh(true)')
    expect(source).toContain('setErrorMessage(RECORD_CERTIFICATE_REFRESH_REQUIRED_MESSAGE)')
    expect(source).toContain('disabled={isGenerating || generationRequiresRefresh}')
    expect(source).toContain("? 'Refresh required'")
    expect(source).not.toContain('setTimeout(generateCertificate')
  })

  it('keeps explicit server rejection retryable and validates the returned PDF', () => {
    const rejectionIndex = source.indexOf('if (!response.ok)')
    const contentTypeIndex = source.indexOf(
      "response.headers.get('content-type') !== 'application/pdf'",
    )
    const blobIndex = source.indexOf('const certificateBlob = await response.blob()')
    const emptyBlobIndex = source.indexOf('if (certificateBlob.size <= 0)')
    const objectUrlIndex = source.indexOf('URL.createObjectURL(certificateBlob)')

    expect(rejectionIndex).toBeGreaterThan(-1)
    expect(source.slice(rejectionIndex, contentTypeIndex)).toContain(
      'RECORD_CERTIFICATE_RETRYABLE_ERROR_MESSAGE',
    )
    expect(source.slice(rejectionIndex, contentTypeIndex)).not.toContain(
      'setGenerationRequiresRefresh(true)',
    )
    expect(contentTypeIndex).toBeGreaterThan(rejectionIndex)
    expect(blobIndex).toBeGreaterThan(contentTypeIndex)
    expect(emptyBlobIndex).toBeGreaterThan(blobIndex)
    expect(objectUrlIndex).toBeGreaterThan(emptyBlobIndex)
  })
})
