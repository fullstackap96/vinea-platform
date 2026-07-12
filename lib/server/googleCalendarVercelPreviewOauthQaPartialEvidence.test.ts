import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const evidencePath = join(
  process.cwd(),
  'docs',
  'GOOGLE_CALENDAR_VERCEL_PREVIEW_OAUTH_QA_PARTIAL_20260628.md'
)

describe('Google Calendar Vercel preview OAuth QA partial evidence', () => {
  it('records the healthy preview and registered safe callback', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    expect(evidence).toContain('https://vinea-platform-8jm7cy6ju-vinea.vercel.app')
    expect(evidence).toContain(
      'https://vinea-platform-8jm7cy6ju-vinea.vercel.app/api/google/oauth/callback'
    )
    expect(evidence).toContain('checks.schema: true')
    expect(evidence).toContain('Safe non-production `Vinea OAuth Playground`')
  })

  it('documents the browser QA pass gates before Google authentication', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Safe QA staff sign-in succeeded',
      'Active parish A was selected by id',
      'Same-parish request detail loaded without `Request not found`',
      'Settings for parish A showed `Connect Google Calendar`',
      'OAuth start redirected to Google with the fresh preview callback URI',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('keeps the wrong-password blocker and no-mutation safety boundaries explicit', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'wrong-password',
      'Google consent was not completed.',
      'No `parish_google_integrations` reconnect success was verified.',
      'Google Calendar event create/update/delete was not attempted.',
      'No OAuth tokens, refresh tokens, passwords, or bypass secrets were recorded',
      'Revoke it after the OAuth reconnect QA run is complete.',
    ]) {
      expect(evidence).toContain(expected)
    }
  })
})
