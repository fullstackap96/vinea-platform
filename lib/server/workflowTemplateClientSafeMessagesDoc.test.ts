import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()
const docPath = 'docs/WORKFLOW_TEMPLATE_CLIENT_SAFE_MESSAGES_20260707.md'

describe('workflow template client safe messages documentation', () => {
  it('documents the Workflow Template Settings client-message boundary', () => {
    const doc = readFileSync(join(repoRoot, docPath), 'utf8')

    expect(doc).toContain('# Workflow Template Client Safe Messages - 2026-07-07')
    expect(doc).toContain('`lib/workflowTemplateSettingsClientMessages.ts`')
    expect(doc).toContain('`app/dashboard/settings/SettingsWorkflowTemplatesSection.tsx`')
    expect(doc).toContain('allowlisted authentication, authorization, validation, setup, and load/save messages')
    expect(doc).toContain('raw Supabase/database, token, route, raw id, or exception details')

    for (const boundary of [
      'access production',
      'apply migrations',
      'change operational RLS',
      'change workflow template editing semantics',
      'mutate records beyond existing staff-triggered saves',
      'run exports',
      'call AI',
      'make public trust claims',
    ]) {
      expect(doc).toContain(boundary)
    }
  })
})
