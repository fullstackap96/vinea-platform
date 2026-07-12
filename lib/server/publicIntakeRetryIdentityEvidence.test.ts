import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const doc = readFileSync(
  join(process.cwd(), 'docs', 'PUBLIC_INTAKE_RETRY_IDENTITY_20260712.md'),
  'utf8'
)

describe('public intake retry identity evidence', () => {
  it('records the scoped recovery, completion, privacy, and rollout boundaries', () => {
    for (const phrase of [
      'Durable rate limiting remains before bounded body parsing',
      'resolved parish',
      '`public_intake.created` completion audit marker',
      'cannot report `201` success unless the completion audit write succeeds',
      'generic denial',
      'does not use local or session storage',
      'not claimed as cross-tab idempotency',
      'No public submission',
      'Approved with constraints',
      'synthetic non-production response-loss retry smoke',
    ]) {
      expect(doc).toContain(phrase)
    }
  })
})
