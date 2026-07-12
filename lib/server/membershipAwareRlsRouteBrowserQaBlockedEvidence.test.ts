import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const evidencePath = join(
  process.cwd(),
  'docs',
  'MEMBERSHIP_AWARE_RLS_ROUTE_BROWSER_QA_EVIDENCE_20260626_BLOCKED.md'
)

describe('membership-aware RLS route/browser QA blocked evidence', () => {
  it('records that the final gate did not touch shared QA, production, or migrations', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Status: Blocked before route/browser execution.',
      'Production touched: `No`',
      'Shared QA project `gnfomgsuottcuueasfvi` touched by this gate: `No`',
      'Approved reusable disposable project `kikqtorplsswepqitjys` modified by this gate: `No`',
      '`supabase/migrations` changed: `No`',
      'Operational RLS applied to shared QA or production: `No`',
      'Secret printed or committed: `No`',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('captures the exact missing disposable app credential blocker', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'DISPOSABLE_SUPABASE_DB_URL: present for db.kikqtorplsswepqitjys.supabase.co',
      'DISPOSABLE_SUPABASE_URL: missing',
      'DISPOSABLE_SUPABASE_ANON_KEY: missing',
      'DISPOSABLE_SUPABASE_SERVICE_ROLE_KEY: missing',
      'gnfomgsuottcuueasfvi.supabase.co',
      'the only local app environment points at shared QA',
      '## Second Attempt',
      '## Final Pre-Summary Environment Check',
      '## Third Attempt',
      '## Fourth Attempt',
      'Matching disposable/Supabase/Vinea variable names found: DISPOSABLE_SUPABASE_DB_URL only',
      'not executed on the second attempt',
      'not executed on the third attempt',
      'not executed on the fourth attempt',
      'User DISPOSABLE_SUPABASE_DB_URL: present for db.kikqtorplsswepqitjys.supabase.co',
      'Machine DISPOSABLE_SUPABASE_SERVICE_ROLE_KEY: missing',
      'HKCU:\\Volatile Environment: no matching Supabase/disposable/Vinea names',
      'The route/browser QA gate remains blocked.',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('keeps promotion blocked and documents the variables needed to unblock', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'DISPOSABLE_SUPABASE_URL=https://kikqtorplsswepqitjys.supabase.co',
      'DISPOSABLE_SUPABASE_ANON_KEY=<disposable anon key>',
      'DISPOSABLE_SUPABASE_SERVICE_ROLE_KEY=<disposable service role key>',
      'NEXT_PUBLIC_SUPABASE_URL=$env:DISPOSABLE_SUPABASE_URL',
      'Decision: `Do Not Promote`',
    ]) {
      expect(evidence).toContain(expected)
    }
  })
})
