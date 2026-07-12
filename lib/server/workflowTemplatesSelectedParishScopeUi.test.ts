import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const settingsPagePath = join(
  process.cwd(),
  'app',
  'dashboard',
  'settings',
  'ParishSettingsPage.tsx'
)
const workflowSectionPath = join(
  process.cwd(),
  'app',
  'dashboard',
  'settings',
  'SettingsWorkflowTemplatesSection.tsx'
)
const workflowRoutePath = join(process.cwd(), 'app', 'api', 'parish', 'workflow-templates', 'route.ts')
const evidencePath = join(
  process.cwd(),
  'docs',
  'WORKFLOW_TEMPLATES_SELECTED_PARISH_SCOPE_UX_20260629.md'
)

describe('workflow templates selected parish scope UX', () => {
  it('passes the loaded active parish name into the Workflow templates settings section', () => {
    const page = readFileSync(settingsPagePath, 'utf8')

    expect(page).toContain('loadedParishName')
    expect(page).toContain('setLoadedParishName(p.name)')
    expect(page).toContain('<SettingsWorkflowTemplatesSection')
    expect(page).toContain('activeParishId={activeParishId}')
    expect(page).toContain('activeParishName={loadedParishName}')
  })

  it('shows a display-only selected parish label inside the Workflow templates editor', () => {
    const section = readFileSync(workflowSectionPath, 'utf8')

    expect(section).toContain('type SettingsWorkflowTemplatesSectionProps')
    expect(section).toContain('activeParishName?: string | null')
    expect(section).toContain('activeParishName = null')
    expect(section).toContain('Workflow templates are scoped to')
    expect(section).toContain('{activeParishName}')
  })

  it('keeps Workflow templates backed by active parish and write-safety helpers', () => {
    const route = readFileSync(workflowRoutePath, 'utf8')

    expect(route).toContain('resolveActiveStaffParishContext')
    expect(route).toContain('resolveStaffWriteParishContext')
    expect(route).toContain('activeParishCookie(request)')
    expect(route).toContain('parishContext.activeParishId')
    expect(route).toContain('allowPrimaryParishFallback: !requestedParishId')
  })

  it('documents the non-production safety boundaries and follow-up browser QA', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Production was not accessed',
      'No migrations were applied',
      'Operational RLS was not changed',
      'Google Calendar data was not touched',
      'Workflow templates were not mutated',
      'No secrets were exposed',
      'Workflow templates are scoped to',
      'Run shared-QA browser verification',
    ]) {
      expect(evidence).toContain(expected)
    }

    for (const forbidden of [
      'postgresql://',
      'SUPABASE_SERVICE_ROLE_KEY',
      'GOOGLE_CLIENT_SECRET',
      'OPENAI_API_KEY',
      'access_token=',
      'refresh_token=',
    ]) {
      expect(evidence).not.toContain(forbidden)
    }
  })
})
