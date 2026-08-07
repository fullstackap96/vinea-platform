import { describe, expect, it } from 'vitest'
import {
  safeStaffLoginErrorMessage,
  staffLoginEmailConfirmationMessage,
  staffLoginGenericErrorMessage,
  staffLoginNetworkErrorMessage,
  staffLoginRateLimitErrorMessage,
  staffLoginTimeoutErrorMessage,
} from './loginAuthMessages'
import { ClientOperationTimeoutError } from './clientOperationDeadline'

describe('safeStaffLoginErrorMessage', () => {
  it('returns a generic message for raw provider details', () => {
    const message = safeStaffLoginErrorMessage(
      'Invalid login credentials for alex@example.com using token vinea_secret_123 and postgresql://postgres:pw@db.example.supabase.co/postgres',
    )

    expect(message).toBe(staffLoginGenericErrorMessage)
    expect(message).not.toContain('alex@example.com')
    expect(message).not.toContain('vinea_secret_123')
    expect(message).not.toContain('postgresql://')
  })

  it('returns curated operational guidance for safe known categories', () => {
    expect(safeStaffLoginErrorMessage(new Error('rate limit exceeded'))).toBe(
      staffLoginRateLimitErrorMessage,
    )
    expect(safeStaffLoginErrorMessage(new Error('Failed to fetch'))).toBe(
      staffLoginNetworkErrorMessage,
    )
    expect(safeStaffLoginErrorMessage({ message: 'Email not confirmed' })).toBe(
      staffLoginEmailConfirmationMessage,
    )
    expect(safeStaffLoginErrorMessage(new ClientOperationTimeoutError())).toBe(
      staffLoginTimeoutErrorMessage,
    )
  })
})
