import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const evidencePath = join(
  process.cwd(),
  'docs',
  'PUBLIC_INTAKE_ROUTING_DISPOSABLE_APP_QA_EVIDENCE_20260624_PARTIAL.md'
)

describe('public intake routing partial disposable app QA evidence', () => {
  it('records the disposable-only safety boundaries and non-promotion decision', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Status: Partially executed against disposable Supabase project `kikqtorplsswepqitjys`.',
      'Production avoided: `Yes`',
      'Shared QA avoided: `Yes`',
      'Runtime public intake wiring changed: `No`',
      'Runtime `/api/health` changed: `No`',
      'Operational RLS changed: `No`',
      'Migration candidate moved into `supabase/migrations`: `No`',
      'Decision: `Do Not Promote`',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('captures the page, health, intake, and rate-limit gate results', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      '/baptism-request`: `200`',
      '/wedding-request`: `200`',
      '/funeral-request`: `200`',
      '/ocia-request`: `200`',
      '/join-parish-request`: `200`',
      '/api/health`: `Failed`, status `503`',
      'Baptism public intake regression: `Failed`, status `503`',
      'Wedding public intake regression: `Failed`, status `503`',
      'Funeral public intake regression: `Failed`, status `503`',
      'OCIA public intake regression: `Failed`, status `503`',
      'Join Parish public intake regression: `Failed`, status `503`',
      'Normal public intake rate-limit behavior: `Not proven`',
      'Durable public intake 429 behavior: `Not proven`',
    ]) {
      expect(evidence).toContain(expected)
    }
  })
})
