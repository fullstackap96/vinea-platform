import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  join(process.cwd(), 'app/dashboard/imports/DashboardImportsPageClient.tsx'),
  'utf8',
)

describe('data import client deadline boundary', () => {
  it('bounds history, preview, and commit waits with operation-specific deadlines', () => {
    expect(source).toContain('const IMPORT_HISTORY_TIMEOUT_MS = 15_000')
    expect(source).toContain('const IMPORT_PREVIEW_TIMEOUT_MS = 30_000')
    expect(source).toContain('const IMPORT_COMMIT_TIMEOUT_MS = 120_000')
    expect(source).toContain('controller.abort(), IMPORT_HISTORY_TIMEOUT_MS')
    expect(source).toContain('signal: AbortSignal.timeout(IMPORT_PREVIEW_TIMEOUT_MS)')
    expect(source).toContain('signal: AbortSignal.timeout(IMPORT_COMMIT_TIMEOUT_MS)')
    expect(source).toContain('window.clearTimeout(timeoutId)')
  })

  it('keeps a timed-out commit blocked behind confirm-before-retry guidance', () => {
    const commitStart = source.indexOf('async function commitImport()')
    const commitEnd = source.indexOf('\n  const columns =', commitStart)
    const commit = source.slice(commitStart, commitEnd)

    expect(commit).toContain('setCommitRetryBlocked(true)')
    expect(commit).toContain('message: UNCERTAIN_IMPORT_MESSAGE')
    expect(commit).toContain('await loadHistory()')
    expect(commit).not.toContain('await commitImport()')
    expect(source).toContain(
      'Review Recent imports and the records list before trying again.',
    )
  })

  it('preserves the synchronous single-flight lock before either POST request', () => {
    const previewStart = source.indexOf('async function requestPreview()')
    const previewFetch = source.indexOf("fetch('/api/imports'", previewStart)
    const commitStart = source.indexOf('async function commitImport()')
    const commitFetch = source.indexOf("fetch('/api/imports'", commitStart)

    expect(source.indexOf("beginOperation('previewing')", previewStart)).toBeLessThan(previewFetch)
    expect(source.indexOf("beginOperation('committing')", commitStart)).toBeLessThan(commitFetch)
    expect(source).toContain('if (operationInFlightRef.current) return false')
  })
})
