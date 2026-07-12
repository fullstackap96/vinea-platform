import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const evidencePath = join(
  process.cwd(),
  'docs',
  'PUBLIC_INTAKE_ROUTING_DISPOSABLE_APP_QA_EVIDENCE_20260625_COMPLETED.md',
)

function readEvidence() {
  return readFileSync(evidencePath, 'utf8')
}

describe('public intake routing disposable completed app QA evidence', () => {
  it('records completed app QA against only the disposable project', () => {
    const evidence = readEvidence()

    for (const expected of [
      'Status: Completed against disposable Supabase project `kikqtorplsswepqitjys`.',
      'Disposable Supabase project only: `Yes`.',
      'Project ref: `kikqtorplsswepqitjys`.',
      'Production avoided: `Yes`.',
      'Shared QA avoided: `Yes`.',
      'Runtime public intake wiring changed: `No`.',
      'Runtime `/api/health` changed: `No`.',
      'Operational RLS changed: `No`.',
      'Migration candidate moved into `supabase/migrations`: `No`.',
      'Secrets stored in repo files: `No`.',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('captures health, intake, normal rate-limit, and 429 pass results', () => {
    const evidence = readEvidence()

    for (const expected of [
      'Local disposable app `/api/health` returned HTTP `200`.',
      '"schema": true',
      '/baptism-request`: `200`',
      '/wedding-request`: `200`',
      '/funeral-request`: `200`',
      '/ocia-request`: `200`',
      '/join-parish-request`: `200`',
      'Baptism: `201`',
      'Wedding: `201`',
      'Funeral: `201`',
      'OCIA: `201`',
      'Join Parish: `201`',
      'Rate-limit attempt `1`: `201`',
      'Rate-limit attempt `2`: `201`',
      'Rate-limit attempt `3`: `201`',
      'The next same-window submission returned HTTP `429`.',
      'Observed `Retry-After` header: present.',
      'Decision: `Disposable App QA Passed`',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('documents remaining non-promotion boundaries and does not store secrets', () => {
    const evidence = readEvidence()

    for (const expected of [
      'Public intake routing remains a future runtime feature.',
      'The public intake routing migration candidate is still outside `supabase/migrations`.',
      'Runtime public intake still uses the current single-parish destination logic.',
      'Operational RLS was intentionally not changed.',
    ]) {
      expect(evidence).toContain(expected)
    }

    expect(evidence).not.toContain('SUPABASE_SERVICE_ROLE_KEY=')
    expect(evidence).not.toContain('NEXT_PUBLIC_SUPABASE_ANON_KEY=')
    expect(evidence).not.toContain('postgresql://postgres:')
    expect(evidence).not.toContain('eyJhbGci')
  })
})
