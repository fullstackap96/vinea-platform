import { describe, expect, it } from 'vitest'
import { publicIntakeClientErrorMessage } from './publicIntakeClientMessages'

describe('public intake client messages', () => {
  it('preserves expected public validation and availability messages', () => {
    for (const message of [
      'Could not submit request.',
      'Could not submit request. Please try again later.',
      'Too many submissions. Please try again later.',
      'Invalid request.',
      'Invalid request type.',
      'Please provide a name and valid email.',
      'Child name is required.',
      'Deceased name is required.',
      'Partner name is required.',
      'Please provide either date of birth or age.',
      'Public intake form is not available.',
    ]) {
      expect(publicIntakeClientErrorMessage(message)).toBe(message)
    }
  })

  it('falls back for unexpected technical or secret-shaped messages', () => {
    for (const error of [
      undefined,
      null,
      '',
      'postgres://postgres:secret@db.example.supabase.co:5432/postgres',
      'Supabase insert failed for request 11111111-1111-1111-1111-111111111111',
      'Bearer abc.def.ghi',
      'storage/object/path/private-document.pdf',
      new Error('database timeout'),
    ]) {
      const message = publicIntakeClientErrorMessage(error)

      expect(message).toBe(
        'Could not submit your request. Please try again or contact the parish office.'
      )
      expect(message).not.toMatch(/postgres:|supabase\.co|Bearer|storage\/|11111111/i)
    }
  })
})
