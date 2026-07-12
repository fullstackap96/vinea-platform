import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const evidencePath = join(
  process.cwd(),
  'docs',
  'REQUEST_DETAIL_ACTIVE_PARISH_COOKIE_SCOPE_FIX_20260627.md'
)

describe('request detail active-parish cookie scope fix evidence', () => {
  it('records the safety boundaries for the request detail cookie-scope fix', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Status: `FIXED - READY FOR BROWSER RECHECK`',
      'Production accessed | `NO`',
      'Migrations applied | `NO`',
      'Operational RLS changed | `NO`',
      'Google Calendar data mutated | `NO`',
      'Real parish Google Calendar data touched | `NO`',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('documents why HTTP non-production browser QA dropped the selected parish cookie', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'The cookie helper previously set `secure: true` whenever `NODE_ENV` was `production`.',
      'browsers do not send `Secure` cookies back to the app',
      'it fell back to the primary parish and denied the valid same-parish fixture',
      'HTTPS production origins still use `secure: true`',
      'HTTP non-production QA origins use `secure: false`',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('keeps the fix tied to active-parish scoped request detail authorization', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'vinea_active_parish_id',
      'validates it against the authenticated staff membership context',
      'does not broaden request visibility',
      'does not change operational RLS',
      'Rerun the selected-parish Google Calendar browser QA',
    ]) {
      expect(evidence).toContain(expected)
    }
  })
})
