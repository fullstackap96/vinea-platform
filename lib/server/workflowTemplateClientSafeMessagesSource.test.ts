import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('workflow template settings client safe messages', () => {
  it('routes load and save failures through the client allowlist helpers', () => {
    const source = readRepoFile('app/dashboard/settings/SettingsWorkflowTemplatesSection.tsx')

    expect(source).toContain("from '@/lib/workflowTemplateSettingsClientMessages'")
    expect(source).toContain('workflowTemplateLoadErrorMessage')
    expect(source).toContain('workflowTemplateSaveErrorMessage')
    expect(source).toContain('setLoadError(workflowTemplateLoadErrorMessage(data?.error))')
    expect(source).toContain('setLoadError(workflowTemplateLoadErrorMessage(loadError))')
    expect(source).toContain('setError(workflowTemplateSaveErrorMessage(data?.error))')
    expect(source).toContain('setError(WORKFLOW_TEMPLATE_REFRESH_REQUIRED_MESSAGE)')
    expect(source).toContain("from '@/lib/workflowTemplateClientConfirmation'")
    expect(source).not.toContain("String(data?.error || 'Could not load workflow templates.')")
    expect(source).not.toContain("String(data?.error || 'Could not save workflow step.')")
    expect(source).not.toContain('function messageFromUnknown')
  })

  it('keeps selected parish scope and empty-state copy intact', () => {
    const source = readRepoFile('app/dashboard/settings/SettingsWorkflowTemplatesSection.tsx')

    expect(source).toContain('Workflow templates are scoped to {activeParishName}.')
    expect(source).toContain('No workflow templates found. Apply the Phase 1 migration to seed default templates.')
    expect(source).toContain("setMessage('Workflow step saved.')")
  })
})
