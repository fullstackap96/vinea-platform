import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

function read(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

const route = read('app/api/intake/route.ts')

describe('public intake insert persistence boundary', () => {
  for (const table of [
    'funeral_request_details',
    'wedding_request_details',
    'ocia_request_details',
    'join_parish_request_details',
  ]) {
    it(`confirms ${table} belongs to the created request`, () => {
      const tableIndex = route.indexOf(`.from('${table}')`)
      const confirmationIndex = route.indexOf(
        'detail?.request_id !== ids.requestId',
        tableIndex,
      )
      const block = route.slice(tableIndex, confirmationIndex)

      expect(tableIndex).toBeGreaterThanOrEqual(0)
      expect(block).toMatch(
        /\.insert\([\s\S]*?\.select\('request_id'\)[\s\S]*?\.maybeSingle\(\)/,
      )
      expect(confirmationIndex).toBeGreaterThan(tableIndex)
    })
  }

  it('requires the complete checklist batch before workflow creation or success', () => {
    const checklistIndex = route.indexOf(".from('checklist_items')")
    const countConfirmationIndex = route.indexOf(
      '(insertedChecklist?.length ?? 0) !== checklist.length',
      checklistIndex,
    )
    const workflowIndex = route.indexOf(
      'createRequestWorkflowStepsFromActiveTemplate({',
      countConfirmationIndex,
    )
    const auditIndex = route.indexOf("action: 'public_intake.created'", workflowIndex)
    const successIndex = route.indexOf('status: 201', auditIndex)

    expect(route.slice(checklistIndex, countConfirmationIndex)).toMatch(
      /\.insert\(checklist\)[\s\S]*?\.select\('id'\)/,
    )
    expect(countConfirmationIndex).toBeGreaterThan(checklistIndex)
    expect(workflowIndex).toBeGreaterThan(countConfirmationIndex)
    expect(auditIndex).toBeGreaterThan(workflowIndex)
    expect(successIndex).toBeGreaterThan(auditIndex)
  })

  it('routes detail or checklist confirmation failures through checked partial cleanup', () => {
    const firstDetailIndex = route.indexOf(".from('funeral_request_details')")
    const checklistIndex = route.indexOf(".from('checklist_items')")
    const catchIndex = route.indexOf('} catch (error) {', checklistIndex)
    const cleanupIndex = route.indexOf(
      'cleanupPartialPublicIntake(admin, ids)',
      catchIndex,
    )
    const genericFailureIndex = route.indexOf(
      "error: 'Could not submit request.'",
      cleanupIndex,
    )

    expect(firstDetailIndex).toBeGreaterThanOrEqual(0)
    expect(checklistIndex).toBeGreaterThan(firstDetailIndex)
    expect(catchIndex).toBeGreaterThan(checklistIndex)
    expect(cleanupIndex).toBeGreaterThan(catchIndex)
    expect(genericFailureIndex).toBeGreaterThan(cleanupIndex)
  })

  it('documents confirmation, compensation, and non-transactional boundaries', () => {
    const doc = read('docs/PUBLIC_INTAKE_PARTIAL_CLEANUP_OBSERVABILITY_BOUNDARY_20260711.md')

    for (const phrase of [
      'type-specific detail insert',
      'complete checklist batch',
      'positively confirmed',
      'compensating cleanup',
      'not a database transaction',
      'No public intake submission was executed',
    ]) {
      expect(doc).toContain(phrase)
    }
  })
})
