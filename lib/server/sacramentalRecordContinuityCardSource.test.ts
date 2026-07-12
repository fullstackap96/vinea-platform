import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

describe('sacramental record continuity card source', () => {
  it('renders the continuity card from the record detail page without adding mutations or generation behavior', () => {
    const page = readRepoFile('app/dashboard/records/[id]/RecordDetailPage.tsx')
    const helper = readRepoFile('lib/sacramentalRecordContinuity.ts')
    const card = readRepoFile('app/dashboard/records/[id]/_components/RecordContinuityCard.tsx')

    expect(page).toContain('buildSacramentalRecordContinuityView({ record, events })')
    expect(page).toContain('<RecordContinuityCard continuity={continuity} />')
    expect(card).toContain('Record continuity')
    expect(card).toContain('Staff review')
    expect(helper).toContain('safeDashboardHrefOrFallback')
    expect(helper).toContain('encodeURIComponent(requestId)')
    expect(helper).toContain('linked_request_verified')
    expect(helper).toContain('record_without_request_manual_review')

    for (const forbidden of [
      ".from('sacramental_records').update",
      '.from("sacramental_records").update',
      'insert(',
      'upsert(',
      'delete(',
      'generateCertificate(',
      'createCertificatePdf(',
      'renderCertificatePdf(',
      'createSignedUrl(',
      'OPENAI_API_KEY',
    ]) {
      expect(helper).not.toContain(forbidden)
      expect(card).not.toContain(forbidden)
    }
  })

  it('keeps staff language pastoral, plain-English, and non-decisional', () => {
    const helper = readRepoFile('lib/sacramentalRecordContinuity.ts')
    const card = readRepoFile('app/dashboard/records/[id]/_components/RecordContinuityCard.tsx')

    for (const expected of [
      'verify continuity manually',
      'staff still review the register and parish policy',
      'Use staff judgment',
      'does not decide eligibility',
      'canonical status',
      'pastoral readiness',
      'Manual continuity review is needed',
    ]) {
      expect(`${helper}\n${card}`).toContain(expected)
    }

    for (const forbidden of [
      'eligible for certificate',
      'canonically approved',
      'pastorally approved',
      'valid for issuance',
      'automatic approval',
    ]) {
      expect(`${helper}\n${card}`.toLowerCase()).not.toContain(forbidden)
    }
  })

  it('is documented in build status, roadmap, and source of truth as live read-only UX', () => {
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(buildStatus).toContain('Sacramental Record Continuity Card Implemented')
    expect(buildStatus).toContain('read-only Catholic records UX slice')
    expect(roadmap).toContain('Sacramental Record Continuity Card')
    expect(sourceOfTruth).toContain('Sacramental Record Continuity Card')
    expect(sourceOfTruth).toContain('live as a read-only staff UX aid')
  })
})
