import { describe, expect, it } from 'vitest'
import {
  onboardingLoadErrorMessage,
  onboardingSaveErrorMessage,
} from './onboardingClientMessages'

describe('onboarding client messages', () => {
  it('preserves expected setup load messages', () => {
    for (const message of [
      'Unauthorized',
      'This login is not authorized for parish staff access.',
      'Could not verify staff access.',
      'Could not verify parish access.',
      'Parish is not configured.',
      'You are not authorized to read parish settings for this parish.',
      'Parish not found',
      'Could not load parish setup.',
    ]) {
      expect(onboardingLoadErrorMessage(message)).toBe(message)
    }
  })

  it('preserves expected setup completion validation messages', () => {
    for (const message of [
      'Unauthorized',
      'This login is not authorized for parish staff access.',
      'Could not verify staff access.',
      'Could not verify parish access.',
      'Parish is not configured.',
      'Invalid JSON body',
      'Parish name is required',
      'Please enter a valid notification email, or leave it blank.',
      'Please enter a valid daily brief email, or leave it blank.',
      'Daily brief delivery needs either a daily brief email or a default notification email.',
      'Could not mark onboarding complete.',
    ]) {
      expect(onboardingSaveErrorMessage(message)).toBe(message)
    }
  })

  it('falls back for unexpected technical or secret-shaped messages', () => {
    for (const error of [
      undefined,
      null,
      '',
      'postgres://postgres:secret@db.example.supabase.co:5432/postgres',
      'parishes update failed for 11111111-1111-1111-1111-111111111111',
      'Bearer abc.def.ghi',
      new Error('network failure'),
    ]) {
      const loadMessage = onboardingLoadErrorMessage(error)
      const saveMessage = onboardingSaveErrorMessage(error)

      expect(loadMessage).toBe('Could not load parish setup. Please try again.')
      expect(saveMessage).toBe('Could not mark onboarding complete. Please try again.')
      expect(`${loadMessage} ${saveMessage}`).not.toMatch(/postgres:|supabase\.co|Bearer|11111111/i)
    }
  })
})
