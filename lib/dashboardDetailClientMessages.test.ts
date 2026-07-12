import { describe, expect, it } from 'vitest'
import {
  dashboardDetailLoadFailureMessage,
  dashboardDetailPartialDataMessage,
  type DashboardDetailSurface,
} from './dashboardDetailClientMessages'

const surfaces: DashboardDetailSurface[] = ['person', 'household', 'sacramentalRecord']

describe('dashboard detail client messages', () => {
  it('returns stable load failures for staff detail pages', () => {
    expect(dashboardDetailLoadFailureMessage('person')).toBe('Could not load this person.')
    expect(dashboardDetailLoadFailureMessage('household')).toBe('Could not load this household.')
    expect(dashboardDetailLoadFailureMessage('sacramentalRecord')).toBe(
      'Could not load this record.'
    )
  })

  it('returns stable partial-data warnings without raw technical details', () => {
    for (const surface of surfaces) {
      const message = dashboardDetailPartialDataMessage(surface)

      expect(message).toContain('Some linked')
      expect(message).toContain('Please refresh')

      for (const forbidden of [
        'postgresql://',
        'SUPABASE_SERVICE_ROLE_KEY',
        'OPENAI_API_KEY',
        'JWT',
        'PGRST',
        'permission denied',
        'relation "public.',
      ]) {
        expect(message).not.toContain(forbidden)
      }
    }
  })
})
