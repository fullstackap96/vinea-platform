import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

function read(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

describe('action-specific confirmation busy labels', () => {
  it('keeps the shared primitive neutral and lets callers name their operation', () => {
    const dialog = read('app/dashboard/_components/VineaConfirmDialog.tsx')

    expect(dialog).toContain("busyLabel = 'Working...'")
    expect(dialog).toContain('busyLabel?: string')
    expect(dialog).toContain('busy ? busyLabel : confirmLabel')
    expect(dialog).not.toContain("busy ? 'Merging...' : confirmLabel")
  })

  it('uses precise labels for every currently busy confirmation workflow', () => {
    const people = read('app/dashboard/people/duplicates/PeopleDuplicatesPageClient.tsx')
    const households = read(
      'app/dashboard/households/duplicates/HouseholdDuplicatesPageClient.tsx',
    )
    const requestDetail = read('app/dashboard/requests/[id]/page.tsx')

    expect(people).toContain('busyLabel="Merging..."')
    expect(households).toContain('busyLabel="Merging..."')
    expect(requestDetail).toContain('busyLabel="Replacing..."')
  })

  it('documents the presentation-only production boundary', () => {
    const evidence = read('docs/ACTION_SPECIFIC_CONFIRMATION_BUSY_LABELS_20260711.md')

    for (const phrase of [
      'Action-Specific Confirmation Busy Labels',
      '`Working...`',
      '`Merging...`',
      '`Replacing...`',
      'changes presentation only',
      'send email',
      'change authorization',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
