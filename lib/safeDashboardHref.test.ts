import { describe, expect, it } from 'vitest'
import { safeDashboardHref, safeDashboardHrefOrFallback } from './safeDashboardHref'

describe('safeDashboardHref', () => {
  it('preserves dashboard-internal links and trims harmless surrounding space', () => {
    expect(safeDashboardHref('/dashboard/requests')).toBe('/dashboard/requests')
    expect(safeDashboardHref(' /dashboard/records?continuity=needs_review ')).toBe(
      '/dashboard/records?continuity=needs_review',
    )
    expect(safeDashboardHref('/dashboard/requests#staff-command-center-heading')).toBe(
      '/dashboard/requests#staff-command-center-heading',
    )
    expect(safeDashboardHref('/dashboard/requests/request%2Fwith%20slash')).toBe(
      '/dashboard/requests/request%2Fwith%20slash',
    )
  })

  it('drops external, protocol-relative, API, JavaScript, and blank links', () => {
    for (const unsafe of [
      '',
      '   ',
      null,
      undefined,
      'https://example.test/not-vinea',
      '//example.test/protocol-relative',
      '/api/exports/requests/basic',
      'javascript:alert("unsafe")',
      '/login',
    ]) {
      expect(safeDashboardHref(unsafe)).toBeUndefined()
    }
  })

  it('drops dashboard lookalikes and paths that escape the dashboard after normalization', () => {
    for (const unsafe of [
      '/dashboardevil',
      '/dashboard/../api/exports/requests/basic',
      '/dashboard/%2e%2e/api/exports/requests/basic',
      '/dashboard/.',
      '/dashboard/%2e',
      '/dashboard\\..\\api\\exports',
      '/dashboard/%5c..%5capi%5cexports',
      '/dashboard/request%5cid',
      '/dashboard/%0Aapi',
    ]) {
      expect(safeDashboardHref(unsafe)).toBeUndefined()
    }
  })

  it('drops dashboard links carrying sensitive query or hash payload markers', () => {
    for (const unsafe of [
      '/dashboard?token=family-portal-token',
      '/dashboard?access_token=oauth-token',
      '/dashboard?returnTo=https%3A%2F%2Fstorage.example.test%2Ffile%3Ftoken%3Dabc',
      '/dashboard?storagePath=request-documents/private/file.pdf',
      '/dashboard?originalFilename=baptism-certificate.pdf',
      '/dashboard?rawPrompt=private-prompt',
      '/dashboard?providerPayload=openai-response',
      '/dashboard#signedUrl=https%3A%2F%2Fstorage.example.test%2Fprivate.pdf',
      '/dashboard#x-amz-signature=abc123',
    ]) {
      expect(safeDashboardHref(unsafe)).toBeUndefined()
    }
  })

  it('returns the fallback when a link is not dashboard-internal', () => {
    expect(safeDashboardHrefOrFallback('/dashboard/requests', '/dashboard')).toBe(
      '/dashboard/requests',
    )
    expect(safeDashboardHrefOrFallback('/api/exports', '/dashboard')).toBe('/dashboard')
    expect(safeDashboardHrefOrFallback('https://example.test', '/dashboard/records')).toBe(
      '/dashboard/records',
    )
    expect(safeDashboardHrefOrFallback('/api/exports', '/dashboard/../api/exports')).toBe(
      '/dashboard',
    )
    expect(safeDashboardHrefOrFallback('/dashboard?token=abc', '/dashboard?secret=abc')).toBe(
      '/dashboard',
    )
  })
})
