import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const evidencePath = join(
  process.cwd(),
  'docs',
  'GOOGLE_CALENDAR_VERCEL_PREVIEW_DEPLOYED_HEALTH_BLOCKED_20260628.md'
)

describe('Google Calendar Vercel preview deployed health-blocked evidence', () => {
  it('records the fresh preview and callback candidate without claiming OAuth registration', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    expect(evidence).toContain('https://vinea-platform-bc4zrrpb4-vinea.vercel.app')
    expect(evidence).toContain(
      'https://vinea-platform-bc4zrrpb4-vinea.vercel.app/api/google/oauth/callback'
    )
    expect(evidence).toContain('The Google OAuth redirect URI was not registered.')
    expect(evidence).toContain('Google OAuth reconnect was not started.')
  })

  it('documents both health blockers and the non-production safety boundaries', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Login – Vercel',
      'net::ERR_BLOCKED_BY_CLIENT',
      'Vercel Deployment Protection was not changed.',
      'No Vercel protection bypass secret was created or used.',
      'Production was not accessed.',
      'Operational RLS was not changed.',
      'Google Calendar event create/update/delete was not attempted.',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('requires a successful schema health gate before redirect registration', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    expect(evidence).toContain('After `/api/health` returns JSON with `checks.schema: true`')
    expect(evidence).toContain('register the preview callback URI')
  })
})
