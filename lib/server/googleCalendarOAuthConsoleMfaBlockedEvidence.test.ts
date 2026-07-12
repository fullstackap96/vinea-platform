import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const evidencePath = join(
  process.cwd(),
  'docs',
  'GOOGLE_CALENDAR_OAUTH_CONSOLE_MFA_BLOCKED_20260628.md'
)

describe('Google Calendar OAuth console MFA blocked evidence', () => {
  it('records that redirect registration stopped before external side effects', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Status: `BLOCKED - GOOGLE CLOUD MFA REQUIRED`',
      'Production accessed | `NO`',
      'Production Google OAuth client changed | `NO`',
      'Migrations applied | `NO`',
      'Operational RLS changed | `NO`',
      'Google OAuth redirect URI registered | `NO`',
      'Google OAuth reconnect started | `NO`',
      'Google credentials submitted by Codex | `NO`',
      'Google event create/update/delete attempted | `NO`',
      'Secrets printed into evidence | `NO`',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('keeps the exact callback URI and human MFA step visible', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'https://khaki-falcons-jam.loca.lt/api/google/oauth/callback',
      '2-step verification is required',
      'Enable 2-step verification',
      'safe non-production OAuth 2.0 Client ID',
      'What Changed In Plain English',
    ]) {
      expect(evidence).toContain(expected)
    }
  })
})
