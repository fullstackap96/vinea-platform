import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

function read(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

const section = read(
  'app/dashboard/settings/SettingsWorkflowTemplatesSection.tsx',
)

describe('Workflow Template Settings single-flight boundary', () => {
  it('locks synchronously before the selected-parish PATCH request', () => {
    const start = section.indexOf('async function saveStep(step: WorkflowStep)')
    const end = section.indexOf('\n  const saving =', start)
    const handler = section.slice(start, end)

    expect(start).toBeGreaterThanOrEqual(0)
    expect(end).toBeGreaterThan(start)
    expect(section).toContain('const saveInFlightRef = useRef<string | null>(null)')
    expect(handler).toContain('if (saveInFlightRef.current) return')
    expect(handler.indexOf('saveInFlightRef.current = step.id')).toBeLessThan(
      handler.indexOf("fetch('/api/parish/workflow-templates'"),
    )
    expect(handler.indexOf('finally {')).toBeLessThan(
      handler.indexOf('saveInFlightRef.current = null'),
    )
  })

  it('freezes type switching, refresh, and all reviewed step fields', () => {
    expect(section).toContain("const saving = savingStepId !== ''")
    expect(section).toContain('aria-busy={loading || saving}')
    expect(section).toContain('disabled={loading || saving}')
    expect(
      section.match(/disabled=\{saving\}/g)?.length ?? 0,
    ).toBeGreaterThanOrEqual(8)
    expect(section).toContain(
      'disabled={saving || !step.title.trim() || !step.phase.trim()}',
    )
  })

  it('preserves staff-visible success and safe error guidance', () => {
    expect(section).toContain("setMessage('Workflow step saved.')")
    expect(section).toContain('workflowTemplateSaveErrorMessage(data?.error)')
    expect(section).toContain('workflowTemplateSaveErrorMessage(saveError)')
  })

  it('documents immediate exclusion without claiming durable idempotency', () => {
    const evidence = read(
      'docs/WORKFLOW_TEMPLATE_SETTINGS_SINGLE_FLIGHT_BOUNDARY_20260711.md',
    )
    for (const phrase of [
      'Workflow Template Settings Single-Flight Boundary',
      'selected-parish',
      'staff-reviewed',
      'new requests',
      'not durable server idempotency',
      'No production',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
