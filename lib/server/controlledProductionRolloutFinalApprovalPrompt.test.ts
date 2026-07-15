import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const prompt = readFileSync(
  join(
    process.cwd(),
    'docs',
    'CONTROLLED_PRODUCTION_ROLLOUT_FINAL_APPROVAL_PROMPT_20260714.md',
  ),
  'utf8',
)

describe('controlled production rollout final approval prompt', () => {
  it('binds the exact release, window, owner, and fixture identities', () => {
    for (const marker of [
      'Current decision state: `READY_FOR_EXPLICIT_APPROVAL`',
      'Production approval granted: `NO`',
      'https://vineaplatform.com',
      'f134b598308ddd78b5b6b81ee447bf5b1fb15937',
      'dpl_4xKH41v7z7dHTqwQEdTjfXbhzrqG',
      'dpl_FuhBvEBrbZjNzQ6dLp4qHbi5j7UW',
      'July 15, 2026, 8:00 PM-8:30 PM America/Chicago',
      'July 15, 2026, 9:00 PM America/Chicago',
      'Alex Perez - Product Owner',
      'Alex Perez - Rollback Owner',
      'Production smoke authorized parish A',
      'Production smoke authorized parish B',
      'Production smoke same-parish request - approved read-only fixture',
      'Production smoke cross-parish request - generic denial expected',
    ]) {
      expect(prompt).toContain(marker)
    }
  })

  it('limits future smoke to health and read-only staff checks', () => {
    for (const marker of [
      '`/api/health` returns HTTP 200 with `checks.schema: true`',
      'Open the labeled same-parish request',
      'returns a generic denial',
      'No family portal check is included.',
      'Record only label-based pass/fail results',
    ]) {
      expect(prompt).toContain(marker)
    }
  })

  it('preserves every prohibited production-sensitive boundary', () => {
    for (const marker of [
      'Do not apply migrations',
      'change operational RLS',
      'enable production-sensitive flags',
      'send communications',
      'run imports or merges',
      'access storage or signed URLs',
      'call Google Calendar or AI',
      'run exports',
      'generate certificates',
      'mutate records',
      'make public trust claims',
    ]) {
      expect(prompt).toContain(marker)
    }
  })

  it('requires a separate intentional instruction before any action', () => {
    for (const marker of [
      'does not approve deployment, production access, production smoke',
      'unless the product owner intentionally sends the exact approval text below in a new message',
      'do not promote the candidate',
      'do not access the production application or production data',
      'It is not the decision itself.',
    ]) {
      expect(prompt).toContain(marker)
    }
  })
})
