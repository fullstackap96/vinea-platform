import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const docPath = join(process.cwd(), 'docs', 'API_ROUTE_SAFE_ERROR_REGRESSION_GUARD_20260707.md')
const testPath = join(process.cwd(), 'lib', 'server', 'apiRouteSafeErrorRegressionGuard.test.ts')

describe('API route safe-error regression guard documentation', () => {
  it('documents the source-level route safe-error guard and its safety boundary', () => {
    const doc = readFileSync(docPath, 'utf8')
    const source = readFileSync(testPath, 'utf8')

    expect(doc).toContain('# API Route Safe Error Regression Guard - 2026-07-07')
    expect(doc).toContain('all `app/api/**/route.ts` files')
    expect(doc).toContain('raw database, provider, or exception `.message` text')
    expect(doc).toContain('direct `.message` values in 5xx `NextResponse.json(...)`')
    expect(doc).toContain('catch-derived `message` variables')
    expect(doc).toContain('`messageFromError(...)` helpers')
    expect(doc).toContain('raw `.message` values returned through plain `Response` bodies')
    expect(doc).toContain('expected validation, authentication, authorization, conflict, and not-found messages')

    for (const boundary of [
      'access production',
      'apply migrations',
      'change operational RLS',
      'change route behavior',
      'change staff authentication',
      'change active-parish or membership authorization',
      'mutate records',
      'run exports',
      'call AI',
      'make public trust claims',
    ]) {
      expect(doc).toContain(boundary)
    }

    expect(source).toContain('const appApiRoot')
    expect(source).toContain('forbiddenRawErrorPatterns')
    expect(source).toContain('direct raw Error.message in 5xx JSON response')
    expect(source).toContain('messageFromError helper returned in JSON response')
    expect(source).toContain('expect(findings).toEqual([])')
  })
})
