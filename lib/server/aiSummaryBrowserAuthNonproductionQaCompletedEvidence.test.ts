import { readFileSync } from 'fs'
import { join } from 'path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const evidencePath = join(
  root,
  'docs',
  'AI_SUMMARY_BROWSER_AUTH_NONPRODUCTION_QA_EVIDENCE_20260627_COMPLETED.md'
)
const buildStatusPath = join(root, 'docs', 'VINEA_BUILD_STATUS.md')

describe('AI summary browser-authenticated non-production QA completed evidence', () => {
  it('records completed browser-authenticated gate execution without approving production', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    expect(evidence).toContain('Status: Completed against an explicitly approved local non-production app session')
    expect(evidence).toContain('Production AI summary safety-chain enablement: `NO_GO`')
    expect(evidence).toContain('Production flags were not enabled')
    expect(evidence).toContain('no migrations were applied')
    expect(evidence).toContain('`/api/ai/reply` was not changed')
    expect(evidence).toContain('operational RLS was not changed')
  })

  it('covers each required runtime gate and rollback', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const required of [
      'Gate 0: flag-off legacy regression',
      'Gate 1: base safety runtime',
      'Gate 2: audit-write approval',
      'Gate 3: safe-response exposure',
      'Gate 4: generation approval',
      'Rollback: flags cleared',
    ]) {
      expect(evidence).toContain(required)
    }
  })

  it('records denial and family-safety coverage with remaining fixture risks', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    expect(evidence).toContain('Denied/cross-parish request route')
    expect(evidence).toContain('Family portal fixture')
    expect(evidence).toContain('repeat the denial case with a confirmed safe request from another parish')
    expect(evidence).toContain('repeat the family portal safety case with a valid safe token fixture')
  })

  it('links the completed evidence from build status', () => {
    const buildStatus = readFileSync(buildStatusPath, 'utf8')

    expect(buildStatus).toContain(
      'AI_SUMMARY_BROWSER_AUTH_NONPRODUCTION_QA_EVIDENCE_20260627_COMPLETED.md'
    )
  })
})
