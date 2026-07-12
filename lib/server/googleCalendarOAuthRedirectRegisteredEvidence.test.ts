import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const evidencePath = join(
  process.cwd(),
  'docs',
  'GOOGLE_CALENDAR_OAUTH_REDIRECT_REGISTERED_20260628.md'
)

describe('Google Calendar OAuth redirect registered evidence', () => {
  it('records the safe non-production OAuth client and exact redirect URI', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Status: `COMPLETED - SAFE NON-PRODUCTION OAUTH CLIENT UPDATED`',
      'Google Cloud project | `Vinea Platform`',
      'Project id observed in URL | `vinea-platform`',
      'OAuth client name | `Vinea OAuth Playground`',
      'OAuth client type | `Web application`',
      'https://khaki-falcons-jam.loca.lt/api/google/oauth/callback',
      'Registration result | `Verified present after save`',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('records that only redirect registration happened and no calendar or production side effects occurred', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Production accessed | `NO`',
      'Production Google OAuth client changed | `NO`',
      'Migrations applied | `NO`',
      'Operational RLS changed | `NO`',
      'Google OAuth redirect URI registered | `YES - safe non-production client only`',
      'Google OAuth reconnect started | `NO`',
      'Google credentials submitted by Codex | `NO`',
      'Google event create/update/delete attempted | `NO`',
      'Secrets printed into evidence | `NO`',
      'The new HTTPS callback was added without removing existing entries.',
    ]) {
      expect(evidence).toContain(expected)
    }
  })
})
