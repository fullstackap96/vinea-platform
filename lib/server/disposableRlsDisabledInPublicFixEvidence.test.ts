import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const evidencePath = join(
  process.cwd(),
  'docs',
  'DISPOSABLE_RLS_DISABLED_IN_PUBLIC_FIX_EVIDENCE_20260630.md',
)

function readEvidence() {
  return readFileSync(evidencePath, 'utf8')
}

describe('disposable rls_disabled_in_public fix evidence', () => {
  it('documents the disposable-only scope and affected table', () => {
    const evidence = readEvidence()

    for (const expected of [
      'rls_disabled_in_public',
      'vinea-disposable-public-intake-routing-qa',
      'kikqtorplsswepqitjys',
      'public.parishes',
      'Production touched: No.',
      'Shared QA touched: No.',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('links the prevention migration and safe policy boundary', () => {
    const evidence = readEvidence()

    for (const expected of [
      'supabase/migrations/20260630170000_enable_parishes_rls.sql',
      'public.is_authorized_for_parish(id)',
      'Does not grant anonymous access.',
      'Does not grant broad write access.',
      'Preserves service-role server access',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('does not contain obvious credential material', () => {
    const evidence = readEvidence()

    for (const forbidden of [
      'postgresql://',
      'SUPABASE_SERVICE_ROLE_KEY=',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=',
      'GOOGLE_CLIENT_SECRET=',
      'OPENAI_API_KEY=',
      'access_token=',
      'refresh_token=',
      'eyJ',
    ]) {
      expect(evidence).not.toContain(forbidden)
    }
  })
})
