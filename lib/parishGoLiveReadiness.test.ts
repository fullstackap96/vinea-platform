import { describe, expect, it } from 'vitest'
import { buildParishGoLiveReadiness } from './parishGoLiveReadiness'
import type { ParishReadinessResult } from './parishOnboardingReadiness'

function readiness(overrides: Partial<ParishReadinessResult>): ParishReadinessResult {
  return {
    completedCount: 0,
    totalCount: 2,
    percent: 0,
    onboardingComplete: false,
    readyToComplete: false,
    items: [
      {
        key: 'profile',
        label: 'Parish profile',
        detail: 'Parish name is set.',
        complete: false,
        href: '/dashboard/settings',
      },
      {
        key: 'admin',
        label: 'Admin access',
        detail: 'At least one active admin can manage parish setup.',
        complete: false,
        href: '/dashboard/settings',
      },
    ],
    ...overrides,
  }
}

describe('buildParishGoLiveReadiness', () => {
  it('keeps go-live blocked until setup is complete', () => {
    const result = buildParishGoLiveReadiness({ setupReadiness: readiness({}) })

    expect(result.status).toBe('setup_in_progress')
    expect(result.headline).toBe('Finish setup before migration')
    expect(result.nextActions).toEqual(['Finish: Parish profile.', 'Finish: Admin access.'])
  })

  it('marks a parish ready for supervised pilot when setup is complete', () => {
    const result = buildParishGoLiveReadiness({
      setupReadiness: readiness({
        completedCount: 2,
        percent: 100,
        readyToComplete: true,
        items: readiness({}).items.map((item) => ({ ...item, complete: true })),
      }),
    })

    expect(result.status).toBe('ready_for_supervised_pilot')
    expect(result.headline).toBe('Ready for a supervised pilot')
    expect(result.nextActions).toContain(
      'Run one safe sample request for each core intake form the parish plans to use.'
    )
  })

  it('includes competitor and spreadsheet migration guidance without making trust or canonical claims', () => {
    const result = buildParishGoLiveReadiness({ setupReadiness: readiness({}) })
    const text = JSON.stringify(result)

    for (const expected of [
      'ParishSOFT',
      'ParishStaq/Pushpay',
      'PDS',
      'eCatholic',
      'Planning Center',
      'Breeze',
      'Servant Keeper',
      'Spreadsheets',
      'Verify sacramental record fields manually',
      'not as final sacramental register authority',
    ]) {
      expect(text).toContain(expected)
    }

    for (const forbidden of [
      'production ready',
      'automatic import',
      'public trust claim',
    ]) {
      expect(text.toLowerCase()).not.toContain(forbidden)
    }
  })
})
