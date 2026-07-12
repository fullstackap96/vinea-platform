import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

function read(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

describe('record certificate explicit mutation method safety', () => {
  it('uses a same-origin POST before params, authentication, reads, rendering, or audit writes', () => {
    const source = read('app/api/records/[id]/certificate/route.ts')
    const postIndex = source.indexOf('export async function POST(')
    const originIndex = source.indexOf('rejectCrossOriginMutation(request)')
    const paramsIndex = source.indexOf('await context.params')
    const authIndex = source.indexOf('requireStaffFromRequest(request)')
    const recordIndex = source.indexOf(".from('sacramental_records')")
    const pdfIndex = source.indexOf('buildBaptismCertificatePdf({')
    const eventIndex = source.indexOf(".from('sacramental_record_events')")
    const eventConfirmationIndex = source.indexOf('!certificateEvent?.id')
    const responseIndex = source.indexOf('return new NextResponse(Buffer.from(pdfBytes)')

    expect(postIndex).toBeGreaterThan(-1)
    expect(source).not.toContain('export async function GET(')
    expect(originIndex).toBeGreaterThan(postIndex)
    expect(paramsIndex).toBeGreaterThan(originIndex)
    expect(authIndex).toBeGreaterThan(paramsIndex)
    expect(recordIndex).toBeGreaterThan(authIndex)
    expect(pdfIndex).toBeGreaterThan(recordIndex)
    expect(eventIndex).toBeGreaterThan(pdfIndex)
    expect(source.slice(eventIndex, eventConfirmationIndex)).toMatch(
      /\.insert\([\s\S]*?\.select\('id'\)[\s\S]*?\.maybeSingle\(\)/,
    )
    expect(eventConfirmationIndex).toBeGreaterThan(eventIndex)
    expect(responseIndex).toBeGreaterThan(eventConfirmationIndex)
  })

  it('routes every staff certificate control through the POST client boundary', () => {
    const detail = read('app/dashboard/records/[id]/RecordDetailPage.tsx')
    const suggestion = read(
      'app/dashboard/records/[id]/_components/RecordCertificateSuggestion.tsx',
    )
    const button = read(
      'app/dashboard/records/[id]/_components/RecordCertificateDownloadButton.tsx',
    )

    expect(detail).toContain('<RecordCertificateDownloadButton recordId={record.id} showIcon />')
    expect(suggestion).toContain('<RecordCertificateDownloadButton recordId={recordId}')
    expect(detail).not.toContain('href={`/api/records/${record.id}/certificate`}')
    expect(suggestion).not.toContain('href={`/api/records/${recordId}/certificate`}')
    expect(button).toContain("method: 'POST'")
    expect(button).toContain("credentials: 'include'")
    expect(button).toContain("response.headers.get('content-type') !== 'application/pdf'")
    expect(button).toContain('Preparing certificate...')
    expect(button).toContain('Could not generate certificate. Please try again.')
    expect(button).not.toContain('response.json()')
  })

  it('documents the explicit method and production-safety boundary', () => {
    const evidence = read('docs/RECORD_CERTIFICATE_EXPLICIT_MUTATION_BOUNDARY_20260711.md')

    for (const phrase of [
      'RECORD_CERTIFICATE_EXPLICIT_MUTATION_BOUNDARY_IMPLEMENTED_20260711',
      'same-origin `POST`',
      'no longer exports a `GET` handler',
      'selected active-parish membership',
      '`certificate_generated`',
      'No production access',
      'No certificate was generated',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
