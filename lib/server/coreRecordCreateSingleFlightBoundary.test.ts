import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const createPages = [
  {
    path: 'app/dashboard/people/new/NewPersonPage.tsx',
    action: 'createPerson',
    operation: 'createPerson',
  },
  {
    path: 'app/dashboard/households/new/NewHouseholdPage.tsx',
    action: 'createHousehold',
    operation: 'createHousehold',
  },
  {
    path: 'app/dashboard/intentions/new/NewMassIntentionPage.tsx',
    action: 'createMassIntention',
    operation: 'createMassIntention',
  },
  {
    path: 'app/dashboard/records/new/NewSacramentalRecordPage.tsx',
    action: 'createSacramentalRecord',
    operation: 'createRecord',
  },
] as const

const formComponents = [
  {
    path: 'app/dashboard/people/_components/PersonForm.tsx',
    busyMarker: 'aria-busy={saving}',
  },
  {
    path: 'app/dashboard/households/_components/HouseholdForm.tsx',
    busyMarker: 'aria-busy={operationBusy}',
  },
  {
    path: 'app/dashboard/intentions/_components/MassIntentionForm.tsx',
    busyMarker: 'aria-busy={saving}',
  },
  {
    path: 'app/dashboard/records/_components/SacramentalRecordForm.tsx',
    busyMarker: 'aria-busy={saving}',
  },
] as const

function read(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

describe('core record create single-flight boundary', () => {
  it.each(createPages)('$path locks before $action and releases only failed attempts', ({
    path,
    action,
    operation,
  }) => {
    const source = read(path)

    expect(source).toContain('const createInFlightRef = useRef(false)')
    expect(source).toContain('if (createInFlightRef.current) return')
    expect(source).toContain('createInFlightRef.current = true')
    expect(source.indexOf('createInFlightRef.current = true')).toBeLessThan(
      source.indexOf(`${action}(`),
    )
    expect(source).toContain('function releaseCreate()')
    expect(source).toContain('createInFlightRef.current = false')
    expect(source).toContain(`ClientErrorMessage('${operation}', error)`)
    expect(source).toContain(`ClientErrorMessage('${operation}', result.error)`)
    expect(source.match(/\n      releaseCreate\(\)/g)).toHaveLength(2)
  })

  it.each(formComponents)('$path exposes its visible save state to assistive technology', ({
    path,
    busyMarker,
  }) => {
    expect(read(path)).toContain(busyMarker)
  })

  it('documents the exact create-only boundary', () => {
    const evidence = read('docs/CORE_RECORD_CREATE_SINGLE_FLIGHT_BOUNDARY_20260711.md')

    for (const phrase of [
      'Core Record Create Single-Flight Boundary',
      'People',
      'Households',
      'Mass Intentions',
      'Sacramental Records',
      'successful navigation',
      'not durable server idempotency',
      'No production',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
