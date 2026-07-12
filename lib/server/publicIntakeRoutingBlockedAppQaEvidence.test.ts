import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const evidencePath = join(
  process.cwd(),
  'docs',
  'PUBLIC_INTAKE_ROUTING_DISPOSABLE_APP_QA_EVIDENCE_20260624_BLOCKED.md'
)

describe('public intake routing blocked disposable app QA evidence', () => {
  it('records that app-level disposable QA did not run without disposable API keys', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Status: Blocked before starting a disposable app instance.',
      'Disposable Supabase URL available: `Yes`',
      'Disposable Supabase anon key available: `No`',
      'Disposable Supabase service role key available: `No`',
      'Placeholder credentials rejected: `Yes`',
      'Shared QA avoided: `Yes`',
      'Runtime public intake wiring changed: `No`',
      'Runtime `/api/health` changed: `No`',
      'Operational RLS changed: `No`',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('keeps public intake regression and promotion explicitly blocked', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Baptism public intake regression: `Not run`',
      'Wedding public intake regression: `Not run`',
      'Funeral public intake regression: `Not run`',
      'OCIA public intake regression: `Not run`',
      'Join Parish public intake regression: `Not run`',
      'Durable public intake 429 behavior: `Not run`',
      'Decision: `Do Not Promote`',
      'DISPOSABLE_SUPABASE_URL=https://kikqtorplsswepqitjys.supabase.co',
      'DISPOSABLE_SUPABASE_ANON_KEY=[paste anon key]',
      'DISPOSABLE_SUPABASE_SERVICE_ROLE_KEY=[paste service role key]',
    ]) {
      expect(evidence).toContain(expected)
    }
  })
})
