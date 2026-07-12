import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const evidencePath = join(
  process.cwd(),
  'docs',
  'OPERATIONAL_INTELLIGENCE_CONTINUITY_BROWSER_QA_EVIDENCE_20260705_BLOCKED.md'
)

describe('operational intelligence continuity browser QA blocked evidence', () => {
  it('records that the browser QA stopped before dashboard access or record-sensitive actions', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Status: `BLOCKED - SAFE BROWSER TARGET, STAFF SESSION, AND CONTINUITY FIXTURES NOT READY`',
      'OPERATIONAL_INTELLIGENCE_CONTINUITY_BROWSER_QA_BLOCKED_20260705_SAFE_PREFLIGHT_ONLY',
      'Production app accessed | `NO`',
      'Browser opened | `NO`',
      'Staff sign-in attempted | `NO`',
      '`/dashboard` opened | `NO`',
      'Records inserted, updated, linked, corrected, deleted, or automatically matched | `NO`',
      'Certificates or certificate PDFs generated | `NO`',
      'Secrets printed into evidence | `NO`',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('documents the specific safe blockers without claiming completed browser evidence', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'LOCAL_NON_PRODUCTION_CONFIGURED_NOT_RUNNING',
      'SHARED_QA_PROJECT_GNFOMGSUOTTCUUEASFVI',
      'PRESENT_BY_NAME_ONLY',
      'Staff allowlist env name | `MISSING_OR_NOT_IN_LOCAL_ENV`',
      'local app server was not running',
      'safe staff session was available',
      'active parish label was provided',
      'continuity-review fixture label was provided',
      '"browserQaExecuted": false',
    ]) {
      expect(evidence).toContain(expected)
    }

    expect(evidence).not.toContain('Status: Completed')
    expect(evidence).not.toContain('Current status: `COMPLETE')
  })

  it('lists the exact inputs required before the safe browser run can proceed', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'A running safe local, QA, or staging Vinea app target.',
      '`/api/health` returning HTTP 200 with `checks.schema: true`.',
      'A safe authenticated staff browser session.',
      'A label-only active parish fixture that is not production.',
      'A label-only unlinked sacramental record fixture that produces `unlinkedSacramentalRecordCount` greater than zero.',
      'An evidence storage owner label.',
      'What changed in plain English',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('does not record credentials, database URLs, tokens, fixture UUIDs, or signed URLs', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const forbidden of [
      'QA_STAFF_PASSWORD',
      'SUPABASE_SERVICE_ROLE_KEY',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=',
      'postgresql://',
      'access_token',
      'refresh_token',
      'X-Amz-Signature',
      'token=',
      'service_role_secret',
      'sk-',
    ]) {
      expect(evidence).not.toContain(forbidden)
    }
  })
})
