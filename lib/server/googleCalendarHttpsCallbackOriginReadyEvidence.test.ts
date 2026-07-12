import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const evidencePath = join(
  process.cwd(),
  'docs',
  'GOOGLE_CALENDAR_HTTPS_CALLBACK_ORIGIN_READY_20260628.md'
)

describe('Google Calendar HTTPS callback origin ready evidence', () => {
  it('records the approved temporary HTTPS origin and exact redirect URI', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Status: `READY - REDIRECT URI MUST BE REGISTERED IN SAFE GOOGLE OAUTH CLIENT`',
      'Origin | `https://khaki-falcons-jam.loca.lt`',
      'Scheme | `https`',
      'Approved for Google Calendar OAuth QA | `YES`',
      'https://khaki-falcons-jam.loca.lt/api/google/oauth/callback',
      '${NEXT_PUBLIC_APP_URL}/api/google/oauth/callback',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('records that no production, migration, RLS, credential, or calendar mutation occurred', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Temporary HTTPS tunnel explicitly approved | `YES`',
      'Production accessed | `NO`',
      'Production Google OAuth client used | `NO`',
      'Migrations applied | `NO`',
      'Operational RLS changed | `NO`',
      'Google OAuth redirect URI registered by Codex | `NO`',
      'Google OAuth reconnect started | `NO`',
      'Google credentials submitted | `NO`',
      'Google event create/update/delete attempted | `NO`',
      'Secrets printed into evidence | `NO`',
    ]) {
      expect(evidence).toContain(expected)
    }
  })
})
