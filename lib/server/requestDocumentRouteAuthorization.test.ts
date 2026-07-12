import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const portalTokenSafeLoggingDocPath = 'docs/REQUEST_PORTAL_TOKEN_SAFE_ERROR_LOGGING_20260706.md'
const requestDocumentsSafeLoggingDocPath =
  'docs/REQUEST_DOCUMENTS_SAFE_ERROR_LOGGING_20260706.md'

function readRoute(relativePath: string) {
  return readFileSync(join(root, relativePath), 'utf8')
}

describe('request document route active parish authorization wiring', () => {
  it('wires the active parish cookie and staff Supabase client into document list and upload access', () => {
    const source = readRoute('app/api/requests/[id]/documents/route.ts')

    expect(source).toContain('ACTIVE_STAFF_PARISH_COOKIE')
    expect(source).toContain('request.cookies.get(ACTIVE_STAFF_PARISH_COOKIE)?.value ?? null')
    expect(source).toContain('allowPrimaryParishFallback: !activeParishId')
    expect(source).toContain('activeParishDocumentAccessOptions(request, staff.supabase)')
  })

  it('wires the active parish cookie and staff Supabase client into document download and review access', () => {
    const source = readRoute('app/api/requests/[id]/documents/[documentId]/route.ts')

    expect(source).toContain('ACTIVE_STAFF_PARISH_COOKIE')
    expect(source).toContain('request.cookies.get(ACTIVE_STAFF_PARISH_COOKIE)?.value ?? null')
    expect(source).toContain('allowPrimaryParishFallback: !activeParishId')
    expect(source).toContain('activeParishDocumentAccessOptions(request, staff.supabase)')
  })

  it('wires the active parish cookie and staff Supabase client into portal-token access', () => {
    const source = readRoute('app/api/requests/[id]/portal-token/route.ts')

    expect(source).toContain('ACTIVE_STAFF_PARISH_COOKIE')
    expect(source).toContain('request.cookies.get(ACTIVE_STAFF_PARISH_COOKIE)?.value ?? null')
    expect(source).toContain('allowPrimaryParishFallback: !activeParishId')
    expect(source).toContain('activeParishDocumentAccessOptions(request, staff.supabase)')
    expect(source).toContain("import { resolveAppOrigin } from '@/lib/appOrigin'")
    expect(source).toContain('const origin = resolveAppOrigin(request)')
    expect(source).not.toContain('new URL(request.url).origin')
  })

  it('logs unexpected portal-token creation failures safely while preserving missing-migration guidance', () => {
    const source = readRoute('app/api/requests/[id]/portal-token/route.ts')

    expect(source).toContain("import { logServerError } from '@/lib/server/safeErrorLogging'")
    expect(source).toContain("logServerError('[portal-token] create failed'")
    expect(source).toContain("route: '/api/requests/[id]/portal-token'")
    expect(source).toContain('hasRequestId: Boolean(requestId)')
    expect(source).toContain('activeParishCookiePresent: Boolean(')
    expect(source).toContain('REQUEST_PORTAL_TOKENS_NOT_CONFIGURED_MESSAGE')
    expect(source).toContain("error: 'Could not create family portal link.'")
    expect(source).not.toContain('const message = error instanceof Error ? error.message')
    expect(source).not.toContain('error: message')
  })

  it('logs unexpected document list and upload failures safely without exposing backend messages', () => {
    const source = readRoute('app/api/requests/[id]/documents/route.ts')

    expect(source).toContain("import { logServerError } from '@/lib/server/safeErrorLogging'")
    expect(source).toContain("logServerError('[request-documents] list failed'")
    expect(source).toContain("logServerError('[request-documents] upload storage failed'")
    expect(source).toContain("logServerError('[request-documents] upload insert failed'")
    expect(source).toContain("logServerError('[request-documents] upload failed'")
    expect(source).toContain("route: '/api/requests/[id]/documents'")
    expect(source).toContain('hasRequestId: Boolean(requestId)')
    expect(source).toContain('activeParishCookiePresent: Boolean(')
    expect(source).toContain('hasWorkflowStepId: Boolean(workflowStepId)')
    expect(source).toContain('storageCleanupAttempted: true')
    expect(source).toContain("error: 'Could not load documents.'")
    expect(source).toContain("error: 'Could not upload document.'")
    expect(source).not.toContain('error.message')
    expect(source).not.toContain('error: message')
    expect(source).not.toContain('storagePath:')
  })

  it('logs unexpected document download and review failures safely without exposing signed URLs or storage paths', () => {
    const source = readRoute('app/api/requests/[id]/documents/[documentId]/route.ts')

    expect(source).toContain("import { logServerError } from '@/lib/server/safeErrorLogging'")
    expect(source).toContain("logServerError('[request-document] signed-url failed'")
    expect(source).toContain('const signedUrl = confirmedRequestDocumentSignedUrl(data)')
    expect(source).toContain('if (error || !signedUrl)')
    expect(source).toContain('return NextResponse.json({ ok: true, url: signedUrl })')
    expect(source).not.toContain('url: data.signedUrl')
    expect(source).toContain("logServerError('[request-document] download failed'")
    expect(source).toContain("logServerError('[request-document] review update failed'")
    expect(source).toContain("logServerError('[request-document] review failed'")
    expect(source).toContain("route: '/api/requests/[id]/documents/[documentId]'")
    expect(source).toContain('hasRequestId: Boolean(requestId)')
    expect(source).toContain('hasDocumentId: Boolean(documentId)')
    expect(source).toContain('activeParishCookiePresent: Boolean(')
    expect(source).toContain("error: 'Could not prepare document download.'")
    expect(source).toContain("error: 'Could not review document.'")
    expect(source).not.toContain('error.message')
    expect(source).not.toContain('error: message')
    expect(source).not.toContain('signedUrl:')
    expect(source).not.toContain('storagePath:')
  })

  it('documents the portal-token safe error logging boundary', () => {
    const doc = readRoute(portalTokenSafeLoggingDocPath)

    expect(doc).toContain('# Request Portal Token Safe Error Logging - 2026-07-06')
    expect(doc).toContain('`app/api/requests/[id]/portal-token/route.ts`')
    expect(doc).toContain('`logServerError`')
    expect(doc).toContain('Preserved active-parish-aware request document authorization')
    expect(doc).toContain('Preserved missing-migration guidance')
    expect(doc).toContain('does not expose raw portal tokens')
  })

  it('documents the request document safe error logging boundary', () => {
    const doc = readRoute(requestDocumentsSafeLoggingDocPath)

    expect(doc).toContain('# Request Documents Safe Error Logging - 2026-07-06')
    expect(doc).toContain('`app/api/requests/[id]/documents/route.ts`')
    expect(doc).toContain('`app/api/requests/[id]/documents/[documentId]/route.ts`')
    expect(doc).toContain('`logServerError`')
    expect(doc).toContain('Preserved active-parish-aware request document authorization')
    expect(doc).toContain('Preserved signed URL creation behavior')
    expect(doc).toContain('does not log storage paths, signed URL values, original filenames, or document contents')
  })
})
