import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const setterPath = join(root, 'scripts', 'set-google-calendar-https-callback-origin.ps1')
const checkerPath = join(root, 'scripts', 'check-google-calendar-https-callback-origin.ps1')

describe('Google Calendar HTTPS callback origin scripts', () => {
  it('guards setting the OAuth callback origin behind an exact non-production approval phrase', () => {
    const source = readFileSync(setterPath, 'utf8')

    for (const expected of [
      'APPROVED_GOOGLE_CALENDAR_HTTPS_CALLBACK_QA',
      'Refusing to set Google Calendar callback origin without the exact approval phrase.',
      '[Environment]::SetEnvironmentVariable("NON_PRODUCTION_APP_URL", $approvedOrigin, "User")',
      '[Environment]::SetEnvironmentVariable("NEXT_PUBLIC_APP_URL", $approvedOrigin, "User")',
      '[Environment]::SetEnvironmentVariable("NON_PRODUCTION_APP_URL", $approvedOrigin, "Process")',
      '[Environment]::SetEnvironmentVariable("NEXT_PUBLIC_APP_URL", $approvedOrigin, "Process")',
    ]) {
      expect(source).toContain(expected)
    }
  })

  it('rejects unsafe callback origins and accepts only origin-only HTTPS non-production URLs', () => {
    const source = readFileSync(setterPath, 'utf8')

    for (const expected of [
      '$originUri.Scheme -ne "https"',
      'Refusing localhost as a Google Calendar OAuth callback origin.',
      'Refusing private IP as a Google Calendar OAuth callback origin.',
      'Refusing a production-looking Vinea app host.',
      'Provide only the origin, not a path.',
      'Provide only the origin, not a query string.',
    ]) {
      expect(source).toContain(expected)
    }
  })

  it('prints the exact Google OAuth redirect URI without submitting credentials or mutating calendars', () => {
    const source = readFileSync(setterPath, 'utf8')

    for (const expected of [
      '$callbackUri = "$approvedOrigin/api/google/oauth/callback"',
      'Google OAuth redirect URI to add:',
      'Calendar event mutation remains blocked until OAuth reconnect and selected-parish guards pass.',
    ]) {
      expect(source).toContain(expected)
    }
  })

  it('checks the saved origin by scheme and host only before OAuth QA can continue', () => {
    const source = readFileSync(checkerPath, 'utf8')

    for (const expected of [
      'NEXT_PUBLIC_APP_URL is missing',
      'ApprovedForGoogleCalendarOauthQa',
      'RedirectUriToRegister',
      '$callbackUri = "$origin/api/google/oauth/callback"',
      'NEXT_PUBLIC_APP_URL is not an approved HTTPS non-production callback origin for Google Calendar OAuth QA.',
    ]) {
      expect(source).toContain(expected)
    }
  })
})
