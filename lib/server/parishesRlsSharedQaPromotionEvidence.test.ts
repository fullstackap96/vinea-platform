import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const evidencePath = join(
  process.cwd(),
  'docs',
  'PARISHES_RLS_SHARED_QA_PROMOTION_EVIDENCE_20260630.md',
)

function readEvidence() {
  return readFileSync(evidencePath, 'utf8')
}

describe('parishes RLS shared QA promotion evidence', () => {
  it('documents shared-QA-only scope and migration verification', () => {
    const evidence = readEvidence()

    for (const expected of [
      'gnfomgsuottcuueasfvi',
      'supabase/migrations/20260630170000_enable_parishes_rls.sql',
      'Production touched: No.',
      'public.parishes',
      'parishes_select_authorized_staff',
      "auth.role() = 'service_role'",
      'remainingRlsDisabledTablesAfter',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('records the health and sign-in blocker without pretending it passed', () => {
    const evidence = readEvidence()

    for (const expected of [
      'checks.schema: true',
      '503',
      '401 Unauthorized',
      'cannot be honestly confirmed',
      'valid shared-QA app credentials',
      'selected parish switching cannot be honestly confirmed',
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
