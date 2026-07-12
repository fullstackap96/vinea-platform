import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const evidencePath = join(
  process.cwd(),
  'docs',
  'GOOGLE_CALENDAR_HTTPS_CALLBACK_QA_EVIDENCE_20260628_BLOCKED.md'
)

describe('Google Calendar HTTPS callback QA blocked evidence', () => {
  it('records that the run stopped before production, migrations, OAuth, credentials, or calendar mutation', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Status: `BLOCKED - APPROVED HTTPS ORIGIN NOT AVAILABLE`',
      'Production accessed | `NO`',
      'Production Google OAuth client used | `NO`',
      'Migrations applied | `NO`',
      'Operational RLS changed | `NO`',
      'Google OAuth redirect URI registered | `NO`',
      'Google OAuth reconnect started | `NO`',
      'Google credentials submitted | `NO`',
      'Google event create/update/delete attempted | `NO`',
      'Secrets printed into evidence | `NO`',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('records the local HTTP origin blocker without exposing secret values', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Saved origin scheme | `http`',
      'Saved origin host | `localhost`',
      'Is HTTPS | `NO`',
      'Is localhost/private local origin | `YES`',
      'Approved for Google OAuth callback QA | `NO`',
      'No passwords, OAuth client secrets, session cookies, tokens, parish ids, request ids, or Google account passwords were printed.',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('lists the exact HTTPS callback requirement and next approved options', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      '${NEXT_PUBLIC_APP_URL}/api/google/oauth/callback',
      'https://<approved-non-production-origin>/api/google/oauth/callback',
      'A staging URL',
      'A Vercel preview URL',
      'A temporary HTTPS tunnel URL',
      'What Changed In Plain English',
    ]) {
      expect(evidence).toContain(expected)
    }
  })
})
