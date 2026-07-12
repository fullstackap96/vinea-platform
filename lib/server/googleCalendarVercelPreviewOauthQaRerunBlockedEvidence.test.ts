import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const evidencePath = join(
  process.cwd(),
  'docs',
  'GOOGLE_CALENDAR_VERCEL_PREVIEW_OAUTH_QA_RERUN_BLOCKED_20260628.md'
)

describe('Google Calendar Vercel preview OAuth QA rerun blocked evidence', () => {
  it('records health and preview identity without secrets', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    expect(evidence).toContain('https://vinea-platform-8jm7cy6ju-vinea.vercel.app')
    expect(evidence).toContain('checks.schema: true')
    expect(evidence).toContain('Safe non-production `Vinea OAuth Playground`')
    expect(evidence).toContain('gnfomgsuottcuueasfvi')
    expect(evidence).not.toMatch(/refresh_token|access_token/i)
  })

  it('documents the OAuth reconnect gates reached before the blocker', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Existing safe QA staff session loaded the preview settings page.',
      'Active parish A was selected.',
      'Parish A settings showed Google Calendar as disconnected',
      'OAuth start redirected to Google with the registered preview callback URI.',
      'Google accepted the safe QA email and advanced to password verification.',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('keeps the wrong-password blocker and no-mutation boundaries explicit', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'wrong-password message',
      'Google consent was not completed.',
      '/dashboard/settings?gcal=connected` was not reached.',
      'Parish B non-inheritance was not verified.',
      'No Google Calendar event data was created, updated, or deleted.',
      'Update `QA_GOOGLE_CALENDAR_PASSWORD`',
    ]) {
      expect(evidence).toContain(expected)
    }
  })
})
