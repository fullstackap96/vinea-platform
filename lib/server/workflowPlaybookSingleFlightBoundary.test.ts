import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  join(
    process.cwd(),
    'app',
    'dashboard',
    'requests',
    '[id]',
    '_components',
    'WorkflowPlaybookBuilder.tsx',
  ),
  'utf8',
)

describe('workflow playbook single-flight boundary', () => {
  it('locks synchronously before applying checklist items', () => {
    expect(source).toContain('const applyInFlightRef = useRef(false)')
    expect(source).toContain('if (applyInFlightRef.current) return')
    expect(source.indexOf('applyInFlightRef.current = true')).toBeLessThan(
      source.indexOf('applyWorkflowPlaybookChecklist({ requestId })'),
    )
    expect(source).toContain("'applyPlaybook', error")
    expect(source).toContain("'applyPlaybook', result.error")
    expect(source).toContain('aria-busy={applying}')
    expect(source).toContain('disabled={applying || suggestion.missingItems.length === 0}')
  })

  it('releases after returned failure, thrown failure, and successful persistence', () => {
    expect(source.match(/applyInFlightRef\.current = false/g)).toHaveLength(3)
    expect(source.match(/setApplying\(false\)/g)).toHaveLength(3)
    expect(source.indexOf('setApplying(false)', source.indexOf('setMessage('))).toBeGreaterThan(
      source.indexOf('applyWorkflowPlaybookChecklist({ requestId })'),
    )
  })

  it('documents browser exclusion without claiming durable idempotency', () => {
    const evidence = readFileSync(
      join(process.cwd(), 'docs', 'WORKFLOW_PLAYBOOK_SINGLE_FLIGHT_BOUNDARY_20260711.md'),
      'utf8',
    )

    for (const phrase of [
      'Workflow Playbook Single-Flight Boundary',
      'checklist',
      'staff-reviewed',
      'not durable server idempotency',
      'No production',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
