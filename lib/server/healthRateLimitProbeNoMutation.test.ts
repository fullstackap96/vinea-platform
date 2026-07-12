import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

describe('health rate-limit RPC probe', () => {
  const health = readRepoFile('lib/server/healthCheck.ts')
  const migration = readRepoFile(
    'supabase/migrations/20260622160000_public_intake_rate_limits.sql',
  )

  it('uses a validation-only probe rather than a durable bucket key', () => {
    expect(health).toContain("p_key: ''")
    expect(health).toContain("expectedExistingErrorCodes: ['P0001']")
    expect(health).not.toContain("p_key: 'health:public-intake-rate-limit'")
  })

  it('keeps key validation before every mutating statement in the RPC', () => {
    const validationIndex = migration.indexOf(
      "IF p_key IS NULL OR char_length(btrim(p_key)) = 0 THEN",
    )
    const deleteIndex = migration.indexOf('DELETE FROM public.rate_limit_buckets')
    const insertIndex = migration.indexOf('INSERT INTO public.rate_limit_buckets')
    const updateIndex = migration.indexOf('UPDATE public.rate_limit_buckets')

    expect(validationIndex).toBeGreaterThan(-1)
    expect(deleteIndex).toBeGreaterThan(validationIndex)
    expect(insertIndex).toBeGreaterThan(validationIndex)
    expect(updateIndex).toBeGreaterThan(validationIndex)
  })

  it('fails health on unexpected RPC errors', () => {
    expect(health).toContain(
      '!check.expectedExistingErrorCodes?.includes(code)',
    )
    expect(health).toContain('throw error')
  })
})
