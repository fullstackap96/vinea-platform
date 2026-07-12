import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('daily office handoff digest source and docs', () => {
  it('keeps the digest non-runtime, read-only, and staff-reviewed', () => {
    const source = readRepoFile('lib/dailyOfficeHandoffDigest.ts')

    for (const expected of [
      'Daily office handoff',
      'Opening the office',
      'Midday check-in',
      'Before closing',
      'This digest is read-only guidance',
      'Staff decide the next step',
      'does not send communications',
      'mutate records',
      'generate certificates',
      'run exports',
      'access storage',
      'call AI',
      'create signed URLs',
      'not sacramental, canonical, pastoral, or eligibility decisions',
    ]) {
      expect(source).toContain(expected)
    }

    for (const forbidden of [
      'createClient(',
      'insert(',
      'update(',
      'delete(',
      'fetch(',
      'createSignedUrl',
      'OpenAI',
      'resend',
      'certificate_generated',
    ]) {
      expect(source).not.toContain(forbidden)
    }
  })

  it('documents the implemented DTO and preserves no-go boundaries', () => {
    const doc = readRepoFile('docs/DAILY_OFFICE_HANDOFF_DIGEST_DTO_20260705.md')
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    for (const expected of [
      'DAILY_OFFICE_HANDOFF_DIGEST_DTO_IMPLEMENTED_20260705',
      'Opening the office',
      'Midday check-in',
      'Before closing',
      'Staff decide the next step',
      'does not send communications',
      'mutate records',
      'generate certificates',
      'call AI',
      'run exports',
      'create signed URLs',
      'not a sacramental, canonical, pastoral, or eligibility decision',
    ]) {
      expect(doc).toContain(expected)
    }

    expect(buildStatus).toContain('Daily Office Handoff Digest DTO Implemented')
    expect(roadmap).toContain('Daily Office Handoff Digest DTO')
    expect(sourceOfTruth).toContain('Daily Office Handoff Digest DTO')
  })
})
