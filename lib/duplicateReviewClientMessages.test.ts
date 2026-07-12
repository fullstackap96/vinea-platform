import { describe, expect, it } from 'vitest'
import {
  duplicateReviewClientErrorMessage,
  duplicateReviewClientFallbacks,
  type DuplicateReviewClientAction,
} from './duplicateReviewClientMessages'

describe('duplicate review client messages', () => {
  it('replaces unexpected backend details with action-specific safe fallbacks', () => {
    const actions: DuplicateReviewClientAction[] = [
      'loadPeople',
      'mergePeople',
      'loadHouseholds',
      'mergeHouseholds',
    ]

    for (const action of actions) {
      const message = duplicateReviewClientErrorMessage(
        action,
        'postgresql://secret@host private-row-id provider failure',
      )
      expect(message).toBe(duplicateReviewClientFallbacks[action])
      expect(message).not.toContain('postgresql://')
      expect(message).not.toContain('private-row-id')
    }
  })

  it('preserves approved validation and parish-scope guidance', () => {
    expect(
      duplicateReviewClientErrorMessage('mergePeople', 'Choose two different people to merge.'),
    ).toBe('Choose two different people to merge.')
    expect(
      duplicateReviewClientErrorMessage(
        'loadHouseholds',
        'You are not authorized to review duplicate households for this parish.',
      ),
    ).toBe('You are not authorized to review duplicate households for this parish.')
  })
})
