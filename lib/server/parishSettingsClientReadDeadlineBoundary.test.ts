import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const settingsSource = readFileSync(
  join(process.cwd(), 'app/dashboard/settings/ParishSettingsPage.tsx'),
  'utf8',
)
const workflowSource = readFileSync(
  join(process.cwd(), 'app/dashboard/settings/SettingsWorkflowTemplatesSection.tsx'),
  'utf8',
)

describe('Parish Settings client read deadline boundary', () => {
  it('gives every selected-parish settings read a finite deadline', () => {
    expect(settingsSource).toContain('const PARISH_SETTINGS_READ_TIMEOUT_MS = 15_000')
    expect(settingsSource.match(/startParishSettingsReadDeadline\(controller\)/g)).toHaveLength(4)
    expect(settingsSource.match(/window\.clearTimeout\(readTimeoutId\)/g)).toHaveLength(4)

    expect(workflowSource).toContain('const WORKFLOW_TEMPLATE_READ_TIMEOUT_MS = 15_000')
    expect(workflowSource.match(/startWorkflowTemplateReadDeadline\(controller\)/g)).toHaveLength(1)
    expect(workflowSource.match(/window\.clearTimeout\(readTimeoutId\)/g)).toHaveLength(1)
  })

  it('uses each existing controller for both deadline and fetch cancellation', () => {
    expect(settingsSource).toContain(
      'return window.setTimeout(() => controller.abort(), PARISH_SETTINGS_READ_TIMEOUT_MS)',
    )
    expect(settingsSource.match(/signal: controller\.signal/g)).toHaveLength(4)

    expect(workflowSource).toContain(
      'return window.setTimeout(() => controller.abort(), WORKFLOW_TEMPLATE_READ_TIMEOUT_MS)',
    )
    expect(workflowSource).toContain('signal: controller.signal')
  })

  it('keeps replacement and unmount cancellation quiet through sequence ownership', () => {
    expect(settingsSource).toContain('const isLatestLoad = () =>')
    expect(settingsSource).toContain('if (!isLatestLoad()) return')
    for (const sequenceRef of [
      'settingsLoadSequenceRef',
      'staffAccessLoadSequenceRef',
      'recentAuditLoadSequenceRef',
      'publicRoutingLoadSequenceRef',
    ]) {
      expect(settingsSource).toContain(`${sequenceRef}.current += 1`)
    }
    expect(settingsSource).toContain('.abort()')

    expect(workflowSource).toContain('const isLatestLoad = () =>')
    expect(workflowSource).toContain('if (!isLatestLoad()) return')
    expect(workflowSource).toContain('loadSequenceRef.current += 1')
    expect(workflowSource).toContain('.abort()')
  })

  it('allows a timeout on the current read to reach existing safe error guidance', () => {
    expect(settingsSource).not.toContain('isAbortError(error) || !isLatestLoad()')
    expect(settingsSource.match(/parishSettingsClientErrorMessage\('load/g)?.length).toBeGreaterThan(4)
    expect(workflowSource).not.toContain("loadError.name === 'AbortError'")
    expect(workflowSource).toContain('setLoadError(workflowTemplateLoadErrorMessage(loadError))')
  })

  it('keeps the bounded paths credentialed and read-only', () => {
    for (const path of [
      '/api/parish/staff-users',
      '/api/audit-events?limit=5',
      '/api/parish/public-intake-routing',
      '/api/parish/settings',
    ]) {
      expect(settingsSource).toContain(`fetch('${path}'`)
    }
    expect(workflowSource).toContain("fetch('/api/parish/workflow-templates'")

    const settingsReadSurface = settingsSource.slice(
      settingsSource.indexOf('const loadStaffAccess'),
      settingsSource.indexOf('async function handleSave'),
    )
    const workflowReadSurface = workflowSource.slice(
      workflowSource.indexOf('const loadTemplates'),
      workflowSource.indexOf('function updateStep'),
    )
    for (const source of [settingsReadSurface, workflowReadSurface]) {
      expect(source).toContain("credentials: 'include'")
      expect(source).not.toMatch(/method:\s*['"](?:POST|PUT|PATCH|DELETE)['"]/)
      expect(source).not.toContain('createSignedUrl')
      expect(source).not.toContain('supabase.storage')
    }
  })
})
