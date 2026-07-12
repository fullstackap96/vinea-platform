import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

function read(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

const simpleEditPages = [
  {
    path: 'app/dashboard/people/[id]/edit/EditPersonPage.tsx',
    action: 'updatePerson',
    operation: 'updatePerson',
  },
  {
    path: 'app/dashboard/intentions/[id]/edit/EditMassIntentionPage.tsx',
    action: 'updateMassIntention',
    operation: 'updateMassIntention',
  },
] as const

describe('core record edit single-flight boundary', () => {
  it.each(simpleEditPages)('$path locks before $action and releases both failure paths', ({
    path,
    action,
    operation,
  }) => {
    const source = read(path)

    expect(source).toContain('const saveInFlightRef = useRef(false)')
    expect(source).toContain('if (saveInFlightRef.current ||')
    expect(source).toContain('saveInFlightRef.current = true')
    expect(source.indexOf('saveInFlightRef.current = true')).toBeLessThan(
      source.indexOf(`${action}(`),
    )
    expect(source).toContain(`ClientErrorMessage('${operation}', error)`)
    expect(source).toContain(`ClientErrorMessage('${operation}', result.error)`)
    expect(source.match(/\n      releaseSave\(\)/g)).toHaveLength(2)
  })

  it('keeps sacramental record and person-link updates in one guarded sequence', () => {
    const source = read(
      'app/dashboard/records/[id]/edit/EditSacramentalRecordPage.tsx',
    )
    const recordAction = source.indexOf('updateSacramentalRecord(recordId,')
    const linkAction = source.indexOf('updateSacramentalRecordPersonLink(recordId, personId)')

    expect(source).toContain('const saveInFlightRef = useRef(false)')
    expect(source).toContain('if (saveInFlightRef.current || !values || !recordId) return')
    expect(source.indexOf('saveInFlightRef.current = true')).toBeLessThan(recordAction)
    expect(recordAction).toBeLessThan(linkAction)
    expect(source).toContain("sacramentalRecordClientErrorMessage('updateRecord', error)")
    expect(source).toContain("sacramentalRecordClientErrorMessage('updateRecord', recordResult.error)")
    expect(source).toContain("sacramentalRecordClientErrorMessage('updatePersonLink', error)")
    expect(source).toContain("sacramentalRecordClientErrorMessage('updatePersonLink', linkResult.error)")
    expect(source.match(/\n      releaseSave\(\)/g)).toHaveLength(4)
  })

  it('mutually excludes household save and add-member mutations', () => {
    const page = read('app/dashboard/households/[id]/edit/EditHouseholdPage.tsx')
    const form = read('app/dashboard/households/_components/HouseholdForm.tsx')

    expect(page).toContain(
      "const mutationInFlightRef = useRef<'save' | 'add-member' | null>(null)",
    )
    expect(page).toContain('if (mutationInFlightRef.current || !householdId) return')
    expect(page).toContain(
      'if (mutationInFlightRef.current || !values || !householdId) return',
    )
    expect(page).toContain("mutationInFlightRef.current = 'add-member'")
    expect(page).toContain("mutationInFlightRef.current = 'save'")
    expect(page.indexOf("mutationInFlightRef.current = 'add-member'")).toBeLessThan(
      page.indexOf('addHouseholdMember(householdId,'),
    )
    expect(page.indexOf("mutationInFlightRef.current = 'save'")).toBeLessThan(
      page.indexOf('updateHousehold(householdId,'),
    )
    expect(page).toContain('operationBusy={saving || addingMember}')
    expect(form).toContain('operationBusy = saving || Boolean(addingMember)')
    expect(form).toContain('aria-busy={operationBusy}')
    expect(form.match(/disabled=\{operationBusy\}/g)).toHaveLength(14)
  })

  it('keeps multi-step partial failure guidance operation-specific', () => {
    const household = read(
      'app/dashboard/households/[id]/edit/EditHouseholdPage.tsx',
    )
    const record = read(
      'app/dashboard/records/[id]/edit/EditSacramentalRecordPage.tsx',
    )

    for (const marker of [
      "coreRecordClientErrorMessage('updateHousehold', error)",
      "coreRecordClientErrorMessage('updateHouseholdMember', error)",
      "coreRecordClientErrorMessage('addHouseholdMember', error)",
    ]) {
      expect(household).toContain(marker)
    }
    expect(record).toContain("sacramentalRecordClientErrorMessage('updatePersonLink', error)")
  })

  it('documents the exact edit and no-idempotency boundary', () => {
    const evidence = read('docs/CORE_RECORD_EDIT_SINGLE_FLIGHT_BOUNDARY_20260711.md')

    for (const phrase of [
      'Core Record Edit Single-Flight Boundary',
      'People',
      'Households',
      'Mass Intentions',
      'Sacramental Records',
      'partial-success guidance',
      'not durable server idempotency',
      'No production',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
