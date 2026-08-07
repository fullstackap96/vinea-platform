import { describe, expect, it } from 'vitest'

import {
  RECORD_CERTIFICATE_CONFIRMATION_TIMEOUT_MS,
  RECORD_CERTIFICATE_REFRESH_REQUIRED_MESSAGE,
  RECORD_CERTIFICATE_RETRYABLE_ERROR_MESSAGE,
} from '@/lib/recordCertificateClientConfirmation'

describe('record certificate client confirmation', () => {
  it('uses a finite browser confirmation deadline', () => {
    expect(RECORD_CERTIFICATE_CONFIRMATION_TIMEOUT_MS).toBe(60_000)
  })

  it('keeps confirmed rejection separate from acknowledgement uncertainty', () => {
    expect(RECORD_CERTIFICATE_RETRYABLE_ERROR_MESSAGE).toContain('Please try again')
    expect(RECORD_CERTIFICATE_REFRESH_REQUIRED_MESSAGE).toContain('Refresh this page')
    expect(RECORD_CERTIFICATE_REFRESH_REQUIRED_MESSAGE).toContain(
      'review certificate activity',
    )
    expect(RECORD_CERTIFICATE_REFRESH_REQUIRED_MESSAGE).not.toContain('try again now')
  })
})
