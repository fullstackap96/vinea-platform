import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  WORKFLOW_TEMPLATE_REFRESH_REQUIRED_MESSAGE,
  WORKFLOW_TEMPLATE_SAVE_CONFIRMATION_TIMEOUT_MS,
} from '../workflowTemplateClientConfirmation'

const source = readFileSync(
  join(process.cwd(), 'app', 'dashboard', 'settings', 'SettingsWorkflowTemplatesSection.tsx'),
  'utf8',
)

function saveHandler(): string {
  const start = source.indexOf('async function saveStep(step: WorkflowStep)')
  const end = source.indexOf('\n  const saving =', start)
  expect(start).toBeGreaterThanOrEqual(0)
  expect(end).toBeGreaterThan(start)
  return source.slice(start, end)
}

describe('Workflow Template save confirmation deadline boundary', () => {
  it('keeps save confirmation finite and refresh guidance safe', () => {
    expect(WORKFLOW_TEMPLATE_SAVE_CONFIRMATION_TIMEOUT_MS).toBe(60_000)
    expect(WORKFLOW_TEMPLATE_REFRESH_REQUIRED_MESSAGE).toContain('could not confirm')
    expect(WORKFLOW_TEMPLATE_REFRESH_REQUIRED_MESSAGE).toContain('selected parish')
  })

  it('distinguishes confirmed rejection from an ambiguous success acknowledgement', () => {
    const handler = saveHandler()

    expect(handler).toContain('const saveParishId = activeParishIdRef.current')
    expect(handler).toContain(
      'signal: AbortSignal.timeout(WORKFLOW_TEMPLATE_SAVE_CONFIRMATION_TIMEOUT_MS)',
    )
    expect(handler).toContain('if (activeParishIdRef.current !== saveParishId) return')
    expect(handler).toContain('if (!res.ok)')
    expect(handler).toContain('workflowTemplateSaveErrorMessage(data?.error)')
    expect(handler).toContain('if (!data?.ok)')
    expect(handler).toContain('setMutationRequiresRefresh(true)')
  })

  it('validates acknowledgement and authoritative selected-parish reload before success', () => {
    const handler = saveHandler()

    expect(handler).toContain('parseWorkflowTemplateStepResponse(data, step.id)')
    expect(handler).toContain('const refreshed = await loadTemplates()')
    expect(handler).toContain('if (!refreshed)')
    expect(handler.indexOf("setMessage('Workflow step saved.')")).toBeGreaterThan(
      handler.indexOf('if (!refreshed)'),
    )
  })

  it('freezes the complete editor and resets only with a fresh parish-scoped load', () => {
    expect(source).toContain("const saving = savingStepId !== '' || mutationRequiresRefresh")
    expect(source).toContain('setMutationRequiresRefresh(false)')
    expect(source).toContain('aria-busy={loading || saving}')
    expect(source).not.toContain('setTimeout(() => saveStep')
    expect(source).not.toContain('void saveStep(savedStep)')
  })
})
