import { describe, expect, it } from 'vitest'
import { demoRequestClientErrorMessage } from './demoRequestClientMessages'

describe('demo request client messages', () => {
  it('preserves expected public validation and availability messages', () => {
    for (const message of [
      'Please enter your name.',
      'Please enter your parish name.',
      'Please enter a valid email address.',
      'Demo request is too large.',
      'Demo requests are temporarily unavailable. Please email us directly.',
    ]) {
      expect(demoRequestClientErrorMessage(message)).toBe(message)
    }
  })

  it('falls back for unexpected technical or secret-shaped messages', () => {
    for (const error of [
      undefined,
      null,
      '',
      'Resend provider rejected key re_123',
      'postgres://postgres:secret@db.example.supabase.co:5432/postgres',
      'Bearer abc.def.ghi',
      'customer@example.com stack trace',
      new Error('network failed'),
    ]) {
      const message = demoRequestClientErrorMessage(error)

      expect(message).toBe('Unable to submit demo request. Please try again or email us directly.')
      expect(message).not.toMatch(/postgres:|supabase\.co|Bearer|re_123|customer@example\.com/i)
    }
  })
})
