import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const component = readFileSync(
  join(process.cwd(), 'app/dashboard/settings/SettingsWorkflowTemplatesSection.tsx'),
  'utf8',
)
const route = readFileSync(
  join(process.cwd(), 'app/api/parish/workflow-templates/route.ts'),
  'utf8',
)

describe('Workflow Template active-parish freshness boundary', () => {
  it('returns and validates the exact active parish identifier', () => {
    expect(route).toContain('activeParishId: parishContext.activeParishId')
    expect(component).toContain('activeParishId?: string | null')
    expect(component).toContain('parseWorkflowTemplatesResponse(data, activeParishId)')
    expect(component).toContain('}, [activeParishId])')
  })

  it('aborts superseded template loads and permits only the latest response to settle', () => {
    expect(component).toContain('const loadSequenceRef = useRef(0)')
    expect(component).toContain('const loadAbortRef = useRef<AbortController | null>(null)')
    expect(component).toContain('loadAbortRef.current?.abort()')
    expect(component).toContain('signal: controller.signal')
    expect(component).toContain('const isLatestLoad = () => loadSequence === loadSequenceRef.current')
    expect(component).toContain('if (!isLatestLoad()) return')
    expect(component).toContain('setLoadError(workflowTemplateLoadErrorMessage(loadError))')
    expect(component).not.toContain("loadError instanceof DOMException && loadError.name === 'AbortError'")
    expect(component).toContain('if (isLatestLoad()) {')
  })

  it('clears old-parish drafts and blocks stale save settlement after a parish switch', () => {
    expect(component).toContain('setTemplates([])')
    expect(component).toContain('const activeParishIdRef = useRef(activeParishId)')
    expect(component).toContain('activeParishIdRef.current = activeParishId')
    expect(component).toContain('const saveParishId = activeParishIdRef.current')
    expect(component.match(/if \(activeParishIdRef\.current !== saveParishId\) return/g)?.length)
      .toBeGreaterThanOrEqual(2)
    expect(component).toContain('parseWorkflowTemplateStepResponse(data, step.id)')
    expect(component).not.toContain('data.step as WorkflowStep')
  })

  it('documents unchanged write and production boundaries', () => {
    const evidence = readFileSync(
      join(process.cwd(), 'docs/WORKFLOW_TEMPLATE_ACTIVE_PARISH_FRESHNESS_BOUNDARY_20260711.md'),
      'utf8',
    )
    for (const phrase of [
      'WORKFLOW_TEMPLATE_ACTIVE_PARISH_FRESHNESS_IMPLEMENTED_20260711',
      'selected parish',
      'latest-load-wins',
      'No production or shared-QA access',
      'No migration or operational RLS change',
      'No workflow template write was executed',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
