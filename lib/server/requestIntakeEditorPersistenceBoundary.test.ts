import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  join(process.cwd(), 'app', 'dashboard', 'requests', 'actions.ts'),
  'utf8'
)

function functionBlock(name: string): string {
  const start = source.indexOf(`export async function ${name}`)
  if (start < 0) throw new Error(`Missing request action ${name}`)
  const next = source.indexOf('\nexport async function ', start + 1)
  return source.slice(start, next < 0 ? source.length : next)
}

describe('request intake editor persistence boundary', () => {
  const action = functionBlock('saveRequestIntakeDetails')

  it('validates Catholic type-specific required fields before the first write', () => {
    const firstWrite = action.indexOf(".from('parishioners')")

    for (const validation of [
      "error: 'Deceased name is required.'",
      "error: 'Partner name is required.'",
      "error: 'OCIA background, seeking, parishioner status, and contact method are required.'",
    ]) {
      const validationIndex = action.indexOf(validation)
      expect(validationIndex).toBeGreaterThanOrEqual(0)
      expect(validationIndex).toBeLessThan(firstWrite)
    }
  })

  it('positively confirms contact, request, and type-detail persistence before audit', () => {
    const auditIndex = action.indexOf('await auditIntakeUpdate()')

    for (const marker of [
      '!updatedParishioners?.length',
      '!updatedRequest?.id',
      '!updatedRequestNotes?.id',
      '!savedFuneral?.request_id',
      '!savedWedding?.request_id',
      '!savedOcia?.request_id',
    ]) {
      expect(action).toContain(marker)
    }

    expect(action).toContain(".select('id')\n      .maybeSingle()")
    expect(action).toContain(".select('request_id')\n      .maybeSingle()")
    expect(auditIndex).toBeGreaterThan(action.indexOf('!updatedRequest?.id'))
    expect(action.lastIndexOf('await auditIntakeUpdate()')).toBeGreaterThan(
      action.indexOf('!savedOcia?.request_id')
    )
  })

  it('keeps partial-save guidance explicit and staff-safe', () => {
    for (const phrase of [
      'Contact information was saved, but baptism details were not.',
      'Contact information was saved, but intake notes were not.',
      'Contact information and intake notes were saved, but funeral details were not.',
      'Contact information and intake notes were saved, but wedding details were not.',
      'Contact information and intake notes were saved, but OCIA details were not.',
    ]) {
      expect(action).toContain(phrase)
    }

    expect(action).not.toContain('technicalDetail')
    expect(action).not.toContain('error.message')
  })
})
