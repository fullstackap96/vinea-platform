import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const requestDetailPath = join(
  process.cwd(),
  'app',
  'dashboard',
  'requests',
  '[id]',
  'page.tsx',
)

describe('Request Detail confirmation dialog consistency', () => {
  it('uses the shared accessible dialog for completion and template replacement', () => {
    const source = readFileSync(requestDetailPath, 'utf8')
    const dialogUses = source.match(/<VineaConfirmDialog/g) ?? []

    expect(dialogUses).toHaveLength(5)
    expect(source).toContain('open={confirmMarkCompleteOpen}')
    expect(source).toContain('title="Mark this request complete?"')
    expect(source).toContain('confirmLabel="Mark complete"')
    expect(source).toContain("updateRequestStatus('complete')")
    expect(source).toContain('You can reopen the request later by changing its status.')
    expect(source).toContain('open={pendingConfirmedScheduleClear !== null}')
    expect(source).toContain('confirmLabel="Clear confirmed time"')
    expect(source).toContain('onConfirm={confirmConfirmedScheduleClear}')
    expect(source).toContain('This does not delete or update any existing Google Calendar event.')
    expect(source).toContain('open={confirmGoogleCalendarDeleteOpen}')
    expect(source).toContain('title="Delete this Google Calendar event?"')
    expect(source).toContain('confirmLabel="Delete calendar event"')
    expect(source).toContain('open={confirmGoogleCalendarConflictOverrideOpen}')
    expect(source).toContain('title="Create this event despite calendar conflicts?"')
    expect(source).toContain('confirmLabel="Create event anyway"')
    expect(source).not.toContain('aria-label="Confirm mark complete"')
    expect(source).not.toContain('aria-label="Close modal"')
    expect(source).not.toContain('window.confirm')
  })

  it('documents unchanged completion behavior and verification limits', () => {
    const evidence = readFileSync(
      join(process.cwd(), 'docs', 'REQUEST_DETAIL_CONFIRMATION_DIALOG_CONSISTENCY_20260711.md'),
      'utf8',
    )

    for (const phrase of [
      'REQUEST_DETAIL_CONFIRMATION_DIALOG_CONSISTENCY_IMPLEMENTED_20260711',
      'existing status action',
      'same active-parish and request-ownership boundary',
      'No production access',
      'No request status was changed during verification',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
