import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const packetPath = join(
  process.cwd(),
  'docs',
  'GOOGLE_CALENDAR_HTTPS_NONPRODUCTION_CALLBACK_QA_PACKET_20260628.md'
)

describe('Google Calendar HTTPS non-production callback QA packet', () => {
  it('records safety boundaries before any Google OAuth credential submission', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'Status: `PREPARED - AWAITING APPROVED HTTPS CALLBACK`',
      'Production access | `NO`',
      'Migrations | `NO`',
      'Operational RLS changes | `NO`',
      'Google credentials submitted | `NO` until callback URL is approved and registered',
      'Google event create/update/delete | `NO` until OAuth reconnect passes',
      'Secrets in evidence | `NO`',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('defines the exact redirect URI and environment requirements', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      '${NEXT_PUBLIC_APP_URL}/api/google/oauth/callback',
      'NEXT_PUBLIC_APP_URL=https://<approved-non-production-origin>',
      'GOOGLE_CLIENT_ID=<safe non-production Google OAuth client id>',
      'GOOGLE_CLIENT_SECRET=<safe non-production Google OAuth client secret>',
      'GOOGLE_OAUTH_STATE_SECRET=<non-production state signing secret>',
      'https://<approved-non-production-origin>/api/google/oauth/callback',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('blocks unsafe callback origins and production use for this QA gate', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'Do not use private IP, `http://`, `localhost`, `127.0.0.1`, or production domains',
      'App origin | `NEXT_PUBLIC_APP_URL` equals approved origin',
      'Callback is private IP, HTTP, localhost, production, or unregistered',
      'The app origin must not point at production',
      'Supabase values must not point at production',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('requires selected-parish preflight before reconnect and event mutation', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'Active parish selector can select Parish A.',
      'Same-parish request detail loads and does not show `Request not found`.',
      'Settings page shows the Google Calendar section for the selected parish context.',
      'Do not create, update, or delete Google Calendar events until:',
      'Cross-parish request remains denied.',
      'Mismatched-calendar fixture remains protected.',
    ]) {
      expect(packet).toContain(expected)
    }
  })
})
