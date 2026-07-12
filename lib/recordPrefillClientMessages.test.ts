import { describe, expect, it } from 'vitest'
import { recordPrefillClientFailureMessage, type RecordPrefillClientAction } from './recordPrefillClientMessages'

describe('recordPrefillClientFailureMessage', () => {
  it('returns stable staff-safe messages for record prefill failures', () => {
    const actions: RecordPrefillClientAction[] = [
      'loadSourceRequest',
      'loadSupportingDetails',
      'checkExistingRecord',
    ]

    for (const action of actions) {
      const message = recordPrefillClientFailureMessage(action)

      expect(message).toMatch(/Could not/)
      expect(message).not.toContain('postgresql://')
      expect(message).not.toContain('SUPABASE')
      expect(message).not.toContain('JWT')
      expect(message).not.toContain('token')
      expect(message).not.toContain('storage')
    }
  })
})
