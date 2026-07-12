import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const dialogPath = join(
  process.cwd(),
  'app',
  'dashboard',
  '_components',
  'VineaConfirmDialog.tsx',
)

const duplicatePages = [
  {
    path: 'app/dashboard/people/duplicates/PeopleDuplicatesPageClient.tsx',
    endpoint: '/api/people/duplicates',
    title: 'Merge these person profiles?',
  },
  {
    path: 'app/dashboard/households/duplicates/HouseholdDuplicatesPageClient.tsx',
    endpoint: '/api/households/duplicates',
    title: 'Merge these households?',
  },
] as const

describe('duplicate merge confirmation dialog', () => {
  it('provides an accessible keyboard-contained destructive confirmation', () => {
    const source = readFileSync(dialogPath, 'utf8')

    for (const phrase of [
      'role="alertdialog"',
      'aria-modal="true"',
      'aria-labelledby={titleId}',
      'aria-describedby={descriptionId}',
      "event.key === 'Escape'",
      "event.key !== 'Tab'",
      'const busyRef = useRef(busy)',
      'const onCancelRef = useRef(onCancel)',
      'if (event.key === \'Escape\' && !busyRef.current)',
      'onCancelRef.current()',
      '}, [open])',
      'previouslyFocused?.focus()',
      'This cannot be undone from this screen.',
      'Keep reviewing',
      "busyLabel = 'Working...'",
      'busy ? busyLabel : confirmLabel',
    ]) {
      expect(source).toContain(phrase)
    }
  })

  it.each(duplicatePages)(
    '$path requires the Vinea dialog before preserving the existing merge API call',
    ({ path, endpoint, title }) => {
      const source = readFileSync(join(process.cwd(), path), 'utf8')

      expect(source).toContain("import { VineaConfirmDialog }")
      expect(source).toContain('function requestMerge()')
      expect(source).toContain('setMergeConfirmationOpen(true)')
      expect(source).toContain('<VineaConfirmDialog')
      expect(source).toContain(`title="${title}"`)
      expect(source).toContain('busyLabel="Merging..."')
      expect(source).toContain(`fetch('${endpoint}', {`)
      expect(source).toContain("method: 'POST'")
      expect(source).toContain("credentials: 'include'")
      expect(source).not.toContain('window.confirm')
    },
  )

  it('documents the reviewed interaction and unchanged tenant boundary', () => {
    const evidence = readFileSync(
      join(process.cwd(), 'docs', 'DUPLICATE_MERGE_CONFIRMATION_DIALOG_20260711.md'),
      'utf8',
    )

    for (const phrase of [
      'DUPLICATE_MERGE_CONFIRMATION_DIALOG_IMPLEMENTED_20260711',
      'People and Household duplicate review',
      'active-parish authorization remains server-owned',
      'No production access',
      'No record mutation occurred during verification',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
