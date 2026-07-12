import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

describe('sacramental record continuity handoff source', () => {
  it('wires unlinked records to read-only search and review queue handoffs', () => {
    const helper = readRepoFile('lib/sacramentalRecordContinuityHandoff.ts')
    const listView = readRepoFile('app/dashboard/records/RecordsListView.tsx')
    const detailPage = readRepoFile('app/dashboard/records/[id]/RecordDetailPage.tsx')

    expect(helper).toContain('/dashboard/search')
    expect(helper).toContain('/dashboard/records')
    expect(helper).toContain('safeDashboardHrefOrFallback')
    expect(helper).toContain("continuity: 'needs_review'")
    expect(helper).toContain('This handoff is read-only')
    expect(listView).toContain('buildSacramentalRecordContinuityHandoff(record)')
    expect(listView).toContain('Search related requests')
    expect(detailPage).toContain('buildSacramentalRecordContinuityHandoff(record)')
    expect(detailPage).toContain('Review handoff')
    expect(detailPage).toContain('View review queue')
  })

  it('keeps the handoff helper free of mutation, certificate generation, public claims, and AI calls', () => {
    const helper = readRepoFile('lib/sacramentalRecordContinuityHandoff.ts')

    for (const forbidden of [
      '.from(',
      '.update(',
      '.insert(',
      '.upsert(',
      '.delete(',
      'generateCertificate(',
      'createCertificatePdf(',
      'renderCertificatePdf(',
      'createSignedUrl(',
      'OPENAI_API_KEY',
      'trust center',
      'public claim',
    ]) {
      expect(helper).not.toContain(forbidden)
    }
  })
})
