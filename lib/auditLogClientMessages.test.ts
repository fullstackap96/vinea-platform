import { describe, expect, it } from 'vitest'
import { auditLogClientErrorMessage } from './auditLogClientMessages'

describe('audit log client messages', () => {
  it('preserves expected auth, authorization, and setup messages', () => {
    for (const message of [
      'Unauthorized',
      'This login is not authorized for parish staff access.',
      'Could not verify staff access.',
      'Could not verify parish access.',
      'Parish is not configured.',
      'Only parish admins can view the full audit log.',
      'You are not authorized to read audit events for this parish.',
      'Request activity is not configured yet. Apply the audit-event migration to show activity history.',
      'Could not load audit events.',
    ]) {
      expect(auditLogClientErrorMessage(message)).toBe(message)
    }
  })

  it('falls back for unexpected technical or secret-shaped messages', () => {
    for (const error of [
      undefined,
      null,
      '',
      'postgres://postgres:secret@db.example.supabase.co:5432/postgres',
      'Supabase audit_events select failed for 11111111-1111-1111-1111-111111111111',
      'Bearer abc.def.ghi',
      'storage/private/path',
      new Error('network failure with stack trace'),
    ]) {
      const message = auditLogClientErrorMessage(error)

      expect(message).toBe('Could not load audit log. Please try again.')
      expect(message).not.toMatch(/postgres:|supabase\.co|Bearer|storage\/|11111111/i)
    }
  })
})
