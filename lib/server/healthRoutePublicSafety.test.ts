import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

describe('public health route safety boundary', () => {
  const route = readRepoFile('app/api/health/route.ts')
  const healthCheck = readRepoFile('lib/server/healthCheck.ts')

  it('is explicitly dynamic and uncacheable', () => {
    expect(route).toContain("export const dynamic = 'force-dynamic'")
    expect(route).toContain("'Cache-Control', 'no-store, max-age=0'")
    expect(route).toContain("'Pragma', 'no-cache'")
  })

  it('keeps production failures behind the public response redaction helper', () => {
    expect(route).toContain('buildPublicHealthCheckResponse(result')
    expect(route).toContain(
      "includeFailureDetails: process.env.NODE_ENV !== 'production'",
    )
    expect(route).not.toContain('missingSchema')
    expect(route).not.toContain('result.error')
  })

  it('preserves health status semantics for operators', () => {
    expect(route).toContain('status: result.ok ? 200 : 503')
  })

  it('folds exact app-origin readiness into the existing non-secret env check', () => {
    expect(healthCheck).toContain('const appOriginReady = isAppOriginReady()')
    expect(healthCheck).toContain('coreMissing.length > 0 || !appOriginReady')
    expect(healthCheck).toContain("error: coreMissing[0] ?? 'app-origin'")
    expect(route).not.toContain('NEXT_PUBLIC_APP_URL')
  })

  it('bounds all Supabase health work with one shared database deadline', () => {
    expect(healthCheck).toContain('HEALTH_DATABASE_TIMEOUT_MS = 8_000')
    expect(healthCheck).toContain('AbortSignal.timeout(')
    expect(healthCheck).toContain('.abortSignal(signal)')
    expect(healthCheck).toContain('databaseSignal,')
    expect(healthCheck).toContain("error: 'supabase-timeout'")
  })
})
