import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const evidencePath = join(
  root,
  'docs',
  'GOOGLE_CALENDAR_OAUTH_RECONNECT_TUNNEL_BLOCKED_20260628.md'
)
const buildStatusPath = join(root, 'docs', 'VINEA_BUILD_STATUS.md')

describe('Google Calendar OAuth reconnect tunnel blocked evidence', () => {
  it('records the browser-level tunnel blocker and local health result', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Status: `BLOCKED - TEMPORARY HTTPS TUNNELS BLOCKED BY BROWSER`',
      'Local app health | `PASS - ok true, checks.schema true`',
      'https://khaki-falcons-jam.loca.lt/api/google/oauth/callback',
      'https://expansion-dealer-receptors-mortgage.trycloudflare.com/api/google/oauth/callback',
      'Chrome result | `BLOCKED - ERR_BLOCKED_BY_CLIENT`',
      'In-app browser result | `BLOCKED - ERR_BLOCKED_BY_CLIENT`',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('records that OAuth and calendar mutation did not run', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Production accessed | `NO`',
      'Migrations applied | `NO`',
      'Operational RLS changed | `NO`',
      'Google OAuth reconnect started | `NO`',
      'Google credentials submitted | `NO`',
      'Google Calendar event create/update/delete attempted | `NO`',
      'Runtime behavior changed | `NO`',
      'Safe staff sign-in through HTTPS tunnel',
      'NOT RUN - tunnel blocked before Vinea loaded',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('updates build status with the current blocker and next safe path', () => {
    const buildStatus = readFileSync(buildStatusPath, 'utf8')

    for (const expected of [
      'Google Calendar OAuth Reconnect Tunnel QA Blocked',
      'docs/GOOGLE_CALENDAR_OAUTH_RECONNECT_TUNNEL_BLOCKED_20260628.md',
      'browser/client layer before the request reaches Vinea',
      'Vercel preview or staging URL',
      'Google Calendar event create/update/delete remains blocked',
    ]) {
      expect(buildStatus).toContain(expected)
    }
  })
})
