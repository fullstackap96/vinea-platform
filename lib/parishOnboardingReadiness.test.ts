import { describe, expect, it } from 'vitest'
import { buildParishOnboardingReadiness } from '@/lib/parishOnboardingReadiness'

const completeParish = {
  name: 'St. Mark',
  default_notification_email: 'office@example.org',
  daily_ops_brief_enabled: true,
  daily_ops_brief_email: '',
  onboarding_completed_at: null,
  staff_names: ['Jane'],
  priest_names: ['Fr. Thomas'],
  workflow_sla_rules: {
    firstContactDays: { funeral: 1, wedding: 2, baptism: 3, ocia: 3 },
    ownerAssignmentDays: { funeral: 0, wedding: 1, baptism: 2, ocia: 2 },
  },
}

describe('buildParishOnboardingReadiness', () => {
  it('marks a parish ready when all setup signals are present', () => {
    const result = buildParishOnboardingReadiness({
      parish: completeParish,
      staffUsers: [{ role: 'admin', active: true }],
    })

    expect(result.completedCount).toBe(result.totalCount)
    expect(result.readyToComplete).toBe(true)
    expect(result.percent).toBe(100)
  })

  it('flags missing daily brief, notification inbox, and admin access', () => {
    const result = buildParishOnboardingReadiness({
      parish: {
        ...completeParish,
        default_notification_email: '',
        daily_ops_brief_enabled: false,
      },
      staffUsers: [{ role: 'staff', active: true }],
    })

    const incomplete = result.items.filter((item) => !item.complete).map((item) => item.key)
    expect(incomplete).toContain('notification')
    expect(incomplete).toContain('admin')
    expect(incomplete).toContain('daily-brief')
    expect(result.readyToComplete).toBe(false)
  })
})
