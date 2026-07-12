import { describe, expect, it } from 'vitest'

import {
  sacramentalRecordClientErrorMessage,
  sacramentalRecordClientFallbackMessage,
  type SacramentalRecordClientAction,
} from './sacramentalRecordClientMessages'

const actions: SacramentalRecordClientAction[] = [
  'loadPrefill',
  'createRecord',
  'updateRecord',
  'updatePersonLink',
]

describe('sacramental record client messages', () => {
  it('preserves approved validation, selected-parish, and prefill guidance', () => {
    expect(sacramentalRecordClientErrorMessage('createRecord', 'Person name is required.')).toBe(
      'Person name is required.',
    )
    expect(
      sacramentalRecordClientErrorMessage('createRecord', 'Please choose a record type.'),
    ).toBe('Please choose a record type.')
    expect(
      sacramentalRecordClientErrorMessage(
        'updateRecord',
        'Record not found for the selected parish.',
      ),
    ).toBe('Record not found for the selected parish.')
    expect(
      sacramentalRecordClientErrorMessage(
        'loadPrefill',
        'A sacramental record already exists for this request.',
      ),
    ).toBe('A sacramental record already exists for this request.')
  })

  it('maps an expired staff session to plain guidance', () => {
    for (const action of actions) {
      expect(sacramentalRecordClientErrorMessage(action, 'Unauthorized')).toBe(
        'Your staff session is no longer active. Sign in and try again.',
      )
    }
  })

  it('replaces unexpected database, private-contact, identifier, and token text', () => {
    const unsafe = [
      'duplicate key value violates unique constraint sacramental_records_request_id_key',
      'request 132ca2b3-84a4-4b50-8625-0bb773d87d31 belongs to family@example.test',
      'provider token sk-test_1234567890abcdef failed',
      { message: 'raw object error' },
      null,
    ]

    for (const action of actions) {
      for (const error of unsafe) {
        const message = sacramentalRecordClientErrorMessage(action, error)
        expect(message).toBe(sacramentalRecordClientFallbackMessage(action))
        expect(message).not.toContain('132ca2b3')
        expect(message).not.toContain('family@example.test')
        expect(message).not.toContain('sk-test_')
        expect(message).not.toContain('constraint')
      }
    }
  })

  it('does not reuse a safe message across an unrelated action', () => {
    expect(
      sacramentalRecordClientErrorMessage(
        'createRecord',
        'Could not load the request for prefill.',
      ),
    ).toBe(sacramentalRecordClientFallbackMessage('createRecord'))
    expect(
      sacramentalRecordClientErrorMessage('loadPrefill', 'Could not update record.'),
    ).toBe(sacramentalRecordClientFallbackMessage('loadPrefill'))
  })
})
