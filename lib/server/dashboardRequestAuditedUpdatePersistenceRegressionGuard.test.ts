import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const actionsPath = join(process.cwd(), 'app', 'dashboard', 'requests', 'actions.ts')

const auditedSingleRowUpdates = [
  { name: 'updateRequestStatus', confirmation: '!updatedRequest?.id' },
  { name: 'updateRequestWorkflowStepStatus', confirmation: '!updatedStep?.id' },
  { name: 'updateRequestAssignment', confirmation: '!updatedRequest?.id' },
  { name: 'updateRequestNextFollowUpDate', confirmation: '!updatedRequest?.id' },
  { name: 'updateRequestWaitingOn', confirmation: '!updatedRequest?.id' },
] as const

function functionBlock(source: string, name: string): string {
  const start = source.indexOf(`export async function ${name}`)
  if (start < 0) throw new Error(`Missing dashboard request action ${name}`)
  const next = source.indexOf('\nexport async function ', start + 1)
  return source.slice(start, next < 0 ? source.length : next)
}

describe('dashboard request audited update persistence regression boundary', () => {
  const source = readFileSync(actionsPath, 'utf8')

  for (const action of auditedSingleRowUpdates) {
    it(`${action.name} confirms persistence before audit and success`, () => {
      const block = functionBlock(source, action.name)
      const updateIndex = block.indexOf('.update(')
      const selectIndex = block.indexOf(".select('id')", updateIndex)
      const singleIndex = block.indexOf('.maybeSingle()', selectIndex)
      const confirmationIndex = block.indexOf(action.confirmation, singleIndex)
      const auditIndex = block.indexOf('await auditRequestAction({', confirmationIndex)
      const successIndex = block.indexOf('return { ok: true }', auditIndex)

      expect(updateIndex).toBeGreaterThanOrEqual(0)
      expect(selectIndex).toBeGreaterThan(updateIndex)
      expect(singleIndex).toBeGreaterThan(selectIndex)
      expect(confirmationIndex).toBeGreaterThan(singleIndex)
      expect(auditIndex).toBeGreaterThan(confirmationIndex)
      expect(successIndex).toBeGreaterThan(auditIndex)
    })
  }

  it('keeps the explicit reviewed inventory stable', () => {
    expect(auditedSingleRowUpdates.map((action) => action.name)).toEqual([
      'updateRequestStatus',
      'updateRequestWorkflowStepStatus',
      'updateRequestAssignment',
      'updateRequestNextFollowUpDate',
      'updateRequestWaitingOn',
    ])
  })
})
