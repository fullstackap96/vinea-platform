import { describe, expect, it } from 'vitest'
import { sanitizeAuditMetadata } from './auditLogMetadata'

describe('sanitizeAuditMetadata', () => {
  it('removes sensitive keys and email content fields', () => {
    const out = sanitizeAuditMetadata({
      from_status: 'new',
      to_status: 'complete',
      refresh_token: 'secret',
      text: 'full email body',
      subject: 'Hello family',
      to: 'user@example.com',
      note_id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(out).toEqual({
      from_status: 'new',
      to_status: 'complete',
      note_id: '550e8400-e29b-41d4-a716-446655440000',
    })
  })

  it('redacts jwt-like strings', () => {
    const out = sanitizeAuditMetadata({
      external_id: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.sig',
    })
    expect(out.external_id).toBe('[redacted]')
  })
})
