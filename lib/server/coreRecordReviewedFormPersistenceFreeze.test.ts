import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

function read(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

const forms = [
  {
    label: 'People',
    source: read('app/dashboard/people/_components/PersonForm.tsx'),
    guard: 'if (saving) return',
    disabled: 'disabled={saving}',
    disabledCount: 9,
    busy: 'aria-busy={saving}',
  },
  {
    label: 'Households',
    source: read('app/dashboard/households/_components/HouseholdForm.tsx'),
    guard: 'if (operationBusy) return',
    disabled: 'disabled={operationBusy}',
    disabledCount: 14,
    busy: 'aria-busy={operationBusy}',
  },
  {
    label: 'Sacramental Records',
    source: read('app/dashboard/records/_components/SacramentalRecordForm.tsx'),
    guard: 'if (saving) return',
    disabled: 'disabled={saving}',
    disabledCount: 11,
    busy: 'aria-busy={saving}',
  },
] as const

describe('core record reviewed-form persistence freeze', () => {
  it.each(forms)('$label blocks field patches and controls while persistence is unresolved', ({ source, guard, disabled, disabledCount }) => {
    expect(source).toContain(guard)
    expect(source.split(disabled).length - 1).toBe(disabledCount)
  })

  it.each(forms)('$label keeps accessible progress and stable navigation', ({ source, busy }) => {
    expect(source).toContain(busy)
    expect(source).toContain("'Saving...'")
    expect(source).toContain('onCancel')
  })

  it('freezes Household member and primary-contact review alongside household details', () => {
    const household = forms[1].source

    expect(household).toContain('value={member.relationship}')
    expect(household).toContain('checked={member.isPrimaryContact}')
    expect(household).toContain('value={newMember.personId}')
    expect(household).toContain('value={newMember.relationship}')
    expect(household).toContain('checked={newMember.isPrimaryContact}')
    expect(household).toContain("addingMember ? 'Adding...' : 'Add to household'")
  })

  it('freezes Sacramental Record register references with the reviewed record', () => {
    const record = forms[2].source

    for (const field of ['recordType', 'personName', 'sacramentDate', 'minister', 'place', 'book', 'page', 'line', 'notes']) {
      expect(record).toContain(field)
    }
  })

  it('documents the integrity and Catholic-records boundary', () => {
    const doc = read('docs/CORE_RECORD_REVIEWED_FORM_PERSISTENCE_FREEZE_20260711.md')

    for (const phrase of [
      'CORE_RECORD_REVIEWED_FORM_PERSISTENCE_FREEZE_IMPLEMENTED_20260711',
      'People, Household, and Sacramental Record',
      'register references',
      'No production access',
    ]) {
      expect(doc).toContain(phrase)
    }
  })
})
