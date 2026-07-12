import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const scriptPath = join(
  process.cwd(),
  'scripts',
  'run-synthetic-storage-document-restore-smoke.mjs'
)

describe('synthetic storage/document restore smoke runner', () => {
  it('is guarded to the approved reusable disposable Supabase target and exact approval phrase', () => {
    const source = readFileSync(scriptPath, 'utf8')

    for (const expected of [
      "const disposableRef = 'kikqtorplsswepqitjys'",
      "const sharedQaRef = 'gnfomgsuottcuueasfvi'",
      "const confirmationValue = 'APPROVED_SYNTHETIC_STORAGE_DOCUMENT_RESTORE_SMOKE'",
      'Refusing shared QA project',
      'Refusing non-disposable app host',
      'VINEA_SYNTHETIC_STORAGE_RESTORE_SMOKE_CONFIRM',
      'DISPOSABLE_SUPABASE_URL',
      'DISPOSABLE_SUPABASE_ANON_KEY',
      'DISPOSABLE_SUPABASE_SERVICE_ROLE_KEY',
    ]) {
      expect(source).toContain(expected)
    }
  })

  it('covers health, synthetic storage object, synthetic document row, route safety, family portal safety, and cleanup', () => {
    const source = readFileSync(scriptPath, 'utf8')

    for (const expected of [
      '/api/health',
      'private request documents storage bucket was not available',
      'synthetic_storage_object_uploaded',
      'synthetic_request_document_row_created',
      'staff_document_manifest_safe',
      'cross_parish_staff_document_denial',
      'direct_anonymous_storage_denied',
      'family_portal_document_surface_safe',
      'cleanupFixtures',
      'syntheticRowsDeleted',
      'syntheticStorageObjectDeleted',
    ]) {
      expect(source).toContain(expected)
    }
  })

  it('does not call signed URL APIs, Google, email, OpenAI, public intake, exports, or migration commands', () => {
    const source = readFileSync(scriptPath, 'utf8')

    for (const forbidden of [
      'createSignedUrl',
      '/api/google',
      '/api/email',
      '/api/intake',
      '/api/exports',
      'OPENAI_API_KEY: process.env.OPENAI_API_KEY',
      'supabase db reset',
      'supabase migration',
      'psql ',
      'pg_restore',
      'raw_export',
      'rawMetadataBody',
    ]) {
      expect(source).not.toContain(forbidden)
    }
  })

  it('prints sanitized labels rather than raw IDs, token material, storage paths, signed URLs, or filenames', () => {
    const source = readFileSync(scriptPath, 'utf8')

    for (const expected of [
      "staff: 'temporary synthetic staff user'",
      "activeParish: 'temporary synthetic parish A'",
      "deniedParish: 'temporary synthetic parish B without membership'",
      "request: 'temporary synthetic baptism request'",
      "workflowStep: 'temporary synthetic family-facing workflow step'",
      "document: 'temporary synthetic document row'",
      "storageObject: 'temporary synthetic storage object'",
      "familyPortal: 'temporary family portal token used internally but not recorded'",
      'signedUrlValuesPrinted: false',
      'storagePathsPrinted: false',
      'originalFilenamesPrinted: false',
      'rawIdsPrinted: false',
      'secretsPrinted: false',
    ]) {
      expect(source).toContain(expected)
    }

    for (const forbidden of [
      'console.log(fixture',
      'console.log(portalToken',
      'console.log(signIn',
      'console.log(publicUrl',
      'console.log(fixture.storagePath',
      'console.log(documentRow',
    ]) {
      expect(source).not.toContain(forbidden)
    }
  })
})
