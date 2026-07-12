import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const doc = readFileSync(
  join(process.cwd(), 'docs', 'PUBLIC_INTAKE_SUCCESS_SETTLEMENT_BOUNDARY_20260712.md'),
  'utf8'
)

describe('public intake success settlement evidence', () => {
  it('records success, timeout, privacy, rollback, and rollout boundaries', () => {
    for (const phrase of [
      'sees success as soon as `/api/intake` confirms',
      'is not awaited',
      'aborted after 15 seconds',
      'disabled in production',
      'never changes an already confirmed intake',
      'No notification response body',
      'does not claim durable notification-job delivery',
      'Approved with constraints',
      'exact-head non-production browser smoke',
    ]) {
      expect(doc).toContain(phrase)
    }
  })
})
