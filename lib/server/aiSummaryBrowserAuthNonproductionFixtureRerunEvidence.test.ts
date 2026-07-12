import { readFileSync } from 'fs'
import { join } from 'path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const evidencePath = join(
  root,
  'docs',
  'AI_SUMMARY_BROWSER_AUTH_NONPRODUCTION_FIXTURE_RERUN_EVIDENCE_20260627.md'
)
const buildStatusPath = join(root, 'docs', 'VINEA_BUILD_STATUS.md')

describe('AI summary browser-authenticated fixture rerun evidence', () => {
  it('records confirmed cross-parish and valid family portal fixtures', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    expect(evidence).toContain('real cross-parish denied request')
    expect(evidence).toContain('valid family portal token tied to a required family document step')
    expect(evidence).toContain('3c11dd96-28bf-40d3-8a65-a5497d8c98d7')
    expect(evidence).toContain('983d76fe-6021-4be9-b437-3c027c8b018b')
  })

  it('keeps production and runtime safety boundaries explicit', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const boundary of [
      'Production was not accessed',
      'Production flags were not enabled',
      'No migrations were applied',
      '`/api/ai/reply` was not changed',
      'Operational RLS was not changed',
      'Production AI summary safety-chain enablement remains: `NO_GO`',
    ]) {
      expect(evidence).toContain(boundary)
    }
  })

  it('records family-facing AI wording remediation and token cleanup', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    expect(evidence).toContain('It was corrected to neutral family-facing language')
    expect(evidence).toContain('Token revoked after browser rerun')
    expect(evidence).toContain('The raw family portal token was not copied into this document.')
  })

  it('links the rerun evidence from build status', () => {
    const buildStatus = readFileSync(buildStatusPath, 'utf8')

    expect(buildStatus).toContain(
      'AI_SUMMARY_BROWSER_AUTH_NONPRODUCTION_FIXTURE_RERUN_EVIDENCE_20260627.md'
    )
  })
})
