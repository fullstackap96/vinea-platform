import { describe, expect, it } from 'vitest'
import {
  intakeStatusMessageClass,
  intakeStatusMessageTone,
} from '@/lib/intakeFormStyles'

describe('public intake status presentation', () => {
  it('classifies completed submissions as success', () => {
    const message = 'Request submitted successfully.'

    expect(intakeStatusMessageTone(message)).toBe('success')
    expect(intakeStatusMessageClass(message)).toContain('green')
  })

  it.each([
    'Could not submit your request.',
    'Please provide either a date of birth or your age.',
    'Too many submissions. Please try again later.',
  ])('classifies recovery or validation guidance as an error: %s', (message) => {
    expect(intakeStatusMessageTone(message)).toBe('error')
    expect(intakeStatusMessageClass(message)).toContain('amber')
  })
})
