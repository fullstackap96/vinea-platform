import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const scriptPath = join(process.cwd(), 'scripts', 'run-nonproduction-restore-app-auth-smoke.mjs')

describe('non-production restore app/auth smoke runner', () => {
  it('is guarded to the approved reusable disposable Supabase target', () => {
    const source = readFileSync(scriptPath, 'utf8')

    for (const expected of [
      "const disposableRef = 'kikqtorplsswepqitjys'",
      "const sharedQaRef = 'gnfomgsuottcuueasfvi'",
      "const confirmationValue = 'NONPRODUCTION_RESTORE_APP_AUTH_SMOKE'",
      'Refusing shared QA project',
      'Refusing non-disposable app host',
      'DISPOSABLE_SUPABASE_URL',
      'DISPOSABLE_SUPABASE_ANON_KEY',
      'DISPOSABLE_SUPABASE_SERVICE_ROLE_KEY',
    ]) {
      expect(source).toContain(expected)
    }
  })

  it('covers health, auth, selected parish request detail, family portal safety, and cleanup', () => {
    const source = readFileSync(scriptPath, 'utf8')

    for (const expected of [
      '/api/health',
      'synthetic staff sign-in failed',
      'same-parish request detail access failed',
      'same-parish request detail page failed',
      'cross-parish selected parish denial failed',
      'family portal token creation failed or exposed token hash',
      'family portal safety failed',
      'cleanupFixtures',
      'authUserDeleted',
      'syntheticRowsDeleted',
    ]) {
      expect(source).toContain(expected)
    }
  })

  it('does not call storage, signed URL routes, Google, email, OpenAI, or raw export surfaces', () => {
    const source = readFileSync(scriptPath, 'utf8')

    for (const forbidden of [
      '.storage.',
      '.storage(',
      'createSignedUrl',
      '/documents/',
      '/api/google',
      '/api/email',
      '/api/exports',
      'raw_export',
      'rawMetadataBody',
    ]) {
      expect(source).not.toContain(forbidden)
    }
  })

  it('prints sanitized labels rather than raw object identifiers or token material', () => {
    const source = readFileSync(scriptPath, 'utf8')

    for (const expected of [
      "staff: 'temporary synthetic staff user'",
      "activeParish: 'temporary synthetic parish A'",
      "deniedParish: 'temporary synthetic parish B without membership'",
      "request: 'temporary synthetic baptism request'",
      "familyPortal: 'temporary family portal token used internally but not recorded'",
      'rawIdsPrinted: false',
      'secretsPrinted: false',
    ]) {
      expect(source).toContain(expected)
    }

    expect(source).not.toContain('console.log(fixture')
    expect(source).not.toContain('console.log(portalToken')
    expect(source).not.toContain('console.log(signIn')
  })
})
