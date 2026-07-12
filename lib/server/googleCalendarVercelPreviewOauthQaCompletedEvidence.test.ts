import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const evidencePath = join(
  process.cwd(),
  'docs',
  'GOOGLE_CALENDAR_VERCEL_PREVIEW_OAUTH_QA_COMPLETED_20260628.md'
)

describe('Google Calendar Vercel preview OAuth QA completed evidence', () => {
  it('records the healthy preview and safe OAuth callback', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    expect(evidence).toContain('https://vinea-platform-8jm7cy6ju-vinea.vercel.app')
    expect(evidence).toContain(
      'https://vinea-platform-8jm7cy6ju-vinea.vercel.app/api/google/oauth/callback'
    )
    expect(evidence).toContain('checks.schema: true')
    expect(evidence).toContain('Safe non-production `Vinea OAuth Playground`')
  })

  it('documents selected-parish reconnect and parish B non-inheritance', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'The browser returned to Vinea at `/dashboard/settings?gcal=connected`.',
      'Parish A settings showed Google Calendar connected.',
      'Parish B settings, after reloading without the success query parameter, showed Google Calendar disconnected.',
      'Parish B did not show the connected-account line from parish A.',
      'Parish B showed `Connect Google Calendar`, not `Reconnect Google Calendar`.',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('keeps no-mutation and no-secret boundaries explicit', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'No Google Calendar event was created, updated, or deleted.',
      'No OAuth tokens, refresh tokens, passwords, or Vercel bypass secrets were recorded.',
      'Production was not accessed.',
      'Operational RLS was not changed.',
      'Revoke it after any separately approved Google Calendar event lifecycle QA is complete.',
    ]) {
      expect(evidence).toContain(expected)
    }
  })
})
