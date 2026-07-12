import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const docPath = 'docs/SACRAMENTAL_RECORDS_LIST_SAFE_ERRORS_20260707.md'
const readmePath = 'README.md'

describe('Sacramental Records list safe errors documentation', () => {
  it('documents the Records list safe-error boundary', () => {
    const doc = readFileSync(join(process.cwd(), docPath), 'utf8')

    expect(doc).toContain('# Sacramental Records List Safe Errors - 2026-07-07')
    expect(doc).toContain('`lib/server/loadSacramentalRecordsList.ts`')
    expect(doc).toContain('shared dashboard-safe Supabase error helper')
    expect(doc).toContain(
      'Could not load sacramental records. Please try again or contact support if this continues.'
    )
    expect(doc).toContain('Could not load all continuity signals. Parish-scoped records are still shown.')

    for (const boundary of [
      'mutate records',
      'link records automatically',
      'generate certificates',
      'make sacramental/canonical eligibility decisions',
      'alter selected active parish scope',
      'apply migrations',
      'change operational RLS',
      'make public trust claims',
    ]) {
      expect(doc).toContain(boundary)
    }

    for (const forbidden of ['postgresql://', 'SUPABASE_SERVICE_ROLE_KEY', 'OPENAI_API_KEY']) {
      expect(doc).not.toContain(forbidden)
    }
  })

  it('links the safe-error evidence from the README production-readiness table', () => {
    const readme = readFileSync(join(process.cwd(), readmePath), 'utf8')

    expect(readme).toContain('docs/SACRAMENTAL_RECORDS_LIST_SAFE_ERRORS_20260707.md')
    expect(readme).toContain('Sacramental Records list safe-error boundary')
  })
})
