import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

function read(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

const form = read('app/dashboard/intentions/_components/MassIntentionForm.tsx')

describe('Mass Intention form persistence freeze', () => {
  it('blocks all reviewed field changes while persistence is unresolved', () => {
    expect(form).toContain('if (saving) return')
    expect(form.match(/disabled=\{saving\}/g)).toHaveLength(11)

    for (const field of [
      'requesterName',
      'intentionText',
      'requestedDate',
      'assignedMassDate',
      'assignedPriestName',
      'stipendReceived',
      'isFulfilled',
      'notes',
    ]) {
      expect(form).toContain(field)
    }
  })

  it('keeps accessible form and action progress visible', () => {
    expect(form).toContain('aria-busy={saving}')
    expect(form).toContain("saving ? 'Saving...' : submitLabel")
    expect(form).toContain('disabled={saving}')
  })

  it('documents the staff-review and production-safety boundary', () => {
    const doc = read('docs/MASS_INTENTION_FORM_PERSISTENCE_FREEZE_20260711.md')

    for (const phrase of [
      'MASS_INTENTION_FORM_PERSISTENCE_FREEZE_IMPLEMENTED_20260711',
      'complete reviewed snapshot',
      'free-text priest fallback',
      'No production access',
    ]) {
      expect(doc).toContain(phrase)
    }
  })
})
