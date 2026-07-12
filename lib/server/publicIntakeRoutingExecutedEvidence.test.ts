import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const evidencePath = join(
  process.cwd(),
  'docs',
  'PUBLIC_INTAKE_ROUTING_DISPOSABLE_QA_EVIDENCE_20260624_EXECUTED.json'
)

describe('public intake routing executed disposable QA evidence', () => {
  it('records completed disposable forward, rollback, and cleanup evidence', () => {
    const evidence = JSON.parse(readFileSync(evidencePath, 'utf8'))

    expect(evidence.status).toBe('completed_and_cleaned')
    expect(evidence.projectRef).toBe('kikqtorplsswepqitjys')
    expect(evidence.host).toBe('db.kikqtorplsswepqitjys.supabase.co')
    expect(evidence.forward.columns.rowCount).toBe(3)
    expect(evidence.forward.tables.rowCount).toBe(2)
    expect(evidence.forward.indexes.rowCount).toBe(3)
    expect(evidence.forward.rowsecurity.rows.every((row: { rowsecurity: boolean }) => row.rowsecurity)).toBe(true)
    expect(evidence.forward.policies.rowCount).toBe(4)
    expect(evidence.rollback.columns.rowCount).toBe(0)
    expect(evidence.rollback.tables.rowCount).toBe(0)
    expect(evidence.rollback.indexes.rowCount).toBe(0)
    expect(evidence.cleanup.disposableFoundationDropped).toBe(true)
    expect(evidence.cleanup.remainingRelevantTables).toEqual([])
  })

  it('records all disposable data validation cases as passed', () => {
    const evidence = JSON.parse(readFileSync(evidencePath, 'utf8'))
    const caseNames = evidence.validation.dataCases.map((item: { name: string }) => item.name)

    for (const expected of [
      'Insert slug st-ann-routing-qa',
      'Insert uppercase slug St-Ann-Routing-QA fails',
      'Insert slug with spaces fails',
      'Insert duplicate slug with different case fails',
      'Insert verified lowercase hostname',
      'Insert uppercase hostname fails',
      'Insert duplicate hostname with different case fails',
      'Insert token hash for Baptism',
      'Insert duplicate token hash fails',
      'Insert invalid token request type fails',
      'Confirm raw token value is not stored',
    ]) {
      expect(caseNames).toContain(expected)
    }

    expect(evidence.validation.dataCases.every((item: { passed: boolean }) => item.passed)).toBe(true)
  })
})
