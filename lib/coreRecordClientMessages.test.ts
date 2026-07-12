import { describe, expect, it } from 'vitest'

import {
  coreRecordClientErrorMessage,
  coreRecordClientFallbackMessage,
  type CoreRecordClientAction,
} from './coreRecordClientMessages'

const actions: CoreRecordClientAction[] = [
  'createPerson',
  'updatePerson',
  'createHousehold',
  'updateHousehold',
  'addHouseholdMember',
  'updateHouseholdMember',
  'createMassIntention',
  'updateMassIntention',
]

describe('core record client messages', () => {
  it('preserves approved validation and selected-parish guidance', () => {
    expect(coreRecordClientErrorMessage('createPerson', 'First name is required.')).toBe(
      'First name is required.',
    )
    expect(
      coreRecordClientErrorMessage('addHouseholdMember', 'Select a person to add.'),
    ).toBe('Select a person to add.')
    expect(
      coreRecordClientErrorMessage(
        'updateMassIntention',
        'Mass intention not found for the selected parish.',
      ),
    ).toBe('Mass intention not found for the selected parish.')
    expect(
      coreRecordClientErrorMessage(
        'updateHousehold',
        'Parish membership is required before writing parish data.',
      ),
    ).toBe('Parish membership is required before writing parish data.')
  })

  it('maps an expired staff session to plain guidance', () => {
    for (const action of actions) {
      expect(coreRecordClientErrorMessage(action, 'Unauthorized')).toBe(
        'Your staff session is no longer active. Sign in and try again.',
      )
    }
  })

  it('replaces unexpected database, contact, identifier, and credential text', () => {
    const unsafe = [
      'duplicate key value violates a private constraint',
      'row 132ca2b3-84a4-4b50-8625-0bb773d87d31 belongs to family@example.test',
      'provider credential material was rejected',
      { message: 'raw object error' },
      null,
    ]

    for (const action of actions) {
      for (const error of unsafe) {
        const message = coreRecordClientErrorMessage(action, error)
        expect(message).toBe(coreRecordClientFallbackMessage(action))
        expect(message).not.toContain('132ca2b3')
        expect(message).not.toContain('family@example.test')
        expect(message).not.toContain('credential')
        expect(message).not.toContain('constraint')
      }
    }
  })

  it('does not reuse approved messages across unrelated actions', () => {
    expect(coreRecordClientErrorMessage('createPerson', 'Household name is required.')).toBe(
      coreRecordClientFallbackMessage('createPerson'),
    )
    expect(
      coreRecordClientErrorMessage('createHousehold', 'Requester name is required.'),
    ).toBe(coreRecordClientFallbackMessage('createHousehold'))
    expect(
      coreRecordClientErrorMessage('createMassIntention', 'Person not found for the selected parish.'),
    ).toBe(coreRecordClientFallbackMessage('createMassIntention'))
  })
})
