import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

function readComponent(file: string) {
  return readFileSync(
    join(
      process.cwd(),
      'app',
      'dashboard',
      'requests',
      '[id]',
      '_components',
      file,
    ),
    'utf8',
  )
}

describe('Request Detail operational mutation single-flight boundary', () => {
  it('locks internal note creation before the selected-parish Server Action', () => {
    const source = readComponent('InternalNotesSection.tsx')

    expect(source).toContain('const addInFlightRef = useRef(false)')
    expect(source).toContain('if (addInFlightRef.current) return')
    expect(source.indexOf('addInFlightRef.current = true')).toBeLessThan(
      source.indexOf('addRequestNote({'),
    )
    expect(source).toContain("'addInternalNote', error")
    expect(source).toContain("'addInternalNote', result.error")
    expect(source).toContain('aria-busy={saving}')
    expect(source).toContain('disabled={saving}')
  })

  it('locks assignment save and blocks cancellation or editing while persistence is active', () => {
    const source = readComponent('AssignmentSection.tsx')

    expect(source).toContain('const saveInFlightRef = useRef(false)')
    expect(source).toContain('if (saveInFlightRef.current) return')
    expect(source.indexOf('saveInFlightRef.current = true')).toBeLessThan(
      source.indexOf('updateRequestAssignment({'),
    )
    expect(source).toContain("'updateAssignment', error")
    expect(source).toContain("'updateAssignment', result.error")
    expect(source).toContain('aria-busy={saving}')
    expect(source.match(/disabled=\{saving\}/g)).toHaveLength(5)
  })

  it('mutually excludes follow-up save and clear through one immediate lock', () => {
    const source = readComponent('NextFollowUpSection.tsx')
    const saveStart = source.indexOf('async function save()')
    const clearStart = source.indexOf('async function clearDate()')
    const save = source.slice(saveStart, clearStart)
    const clear = source.slice(clearStart, source.indexOf('\n  return (', clearStart))

    expect(source).toContain('const saveInFlightRef = useRef(false)')
    for (const handler of [save, clear]) {
      expect(handler).toContain('if (saveInFlightRef.current) return')
      expect(handler.indexOf('saveInFlightRef.current = true')).toBeLessThan(
        handler.indexOf('updateRequestNextFollowUpDate({'),
      )
      expect(handler).toContain("'updateFollowUp', error")
      expect(handler).toContain("'updateFollowUp', result.error")
    }
    expect(source).toContain('aria-busy={saving}')
    expect(source).toContain('disabled={saving}')
  })

  it('locks care-cadence acceptance before follow-up persistence', () => {
    const source = readComponent('RequestCareCadenceCard.tsx')

    expect(source).toContain('const saveInFlightRef = useRef(false)')
    expect(source).toContain('if (saveInFlightRef.current || !cadence) return')
    expect(source.indexOf('saveInFlightRef.current = true')).toBeLessThan(
      source.indexOf('updateRequestNextFollowUpDate({'),
    )
    expect(source).toContain("'updateFollowUp', error")
    expect(source).toContain("'updateFollowUp', result.error")
    expect(source).toContain('aria-busy={saving}')
  })

  it('documents the selected-parish, retry, and no-automation boundary', () => {
    const evidence = readFileSync(
      join(
        process.cwd(),
        'docs',
        'REQUEST_DETAIL_OPERATIONAL_MUTATION_SINGLE_FLIGHT_BOUNDARY_20260711.md',
      ),
      'utf8',
    )

    for (const phrase of [
      'Request Detail Operational Mutation Single-Flight Boundary',
      'Internal Notes',
      'Assignment',
      'Next Follow-Up',
      'Care Cadence',
      'staff-reviewed',
      'not durable server idempotency',
      'No production',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
