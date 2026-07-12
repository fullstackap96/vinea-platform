import { describe, expect, it } from 'vitest'
import {
  parseOnboardingSettingsResponse,
  parseOnboardingStaffResponse,
} from './onboardingReadModel'

function settingsResponse(overrides: Record<string, unknown> = {}) {
  return {
    ok: true,
    parish: {
      id: ' parish-a ',
      name: ' St. Anne ',
      default_notification_email: ' office@example.test ',
      daily_ops_brief_enabled: true,
      daily_ops_brief_email: ' brief@example.test ',
      onboarding_completed_at: null,
      workflow_sla_rules: { firstContactDays: {}, ownerAssignmentDays: {} },
      staff_names: [' Parish Secretary ', ''],
      priest_names: [' Pastor '],
      ...overrides,
    },
  }
}

describe('onboarding client read model', () => {
  it('normalizes the safe settings fields used for readiness', () => {
    expect(parseOnboardingSettingsResponse(settingsResponse())).toEqual({
      id: 'parish-a',
      name: 'St. Anne',
      default_notification_email: 'office@example.test',
      daily_ops_brief_enabled: true,
      daily_ops_brief_email: 'brief@example.test',
      onboarding_completed_at: null,
      workflow_sla_rules: { firstContactDays: {}, ownerAssignmentDays: {} },
      staff_names: ['Parish Secretary'],
      priest_names: ['Pastor'],
    })
  })

  it('rejects malformed or incomplete parish settings instead of guessing readiness', () => {
    expect(parseOnboardingSettingsResponse(null)).toBeNull()
    expect(parseOnboardingSettingsResponse({ ok: false })).toBeNull()
    expect(parseOnboardingSettingsResponse(settingsResponse({ id: '' }))).toBeNull()
    expect(parseOnboardingSettingsResponse(settingsResponse({ daily_ops_brief_enabled: 'yes' }))).toBeNull()
    expect(parseOnboardingSettingsResponse(settingsResponse({ staff_names: 'Secretary' }))).toBeNull()
    expect(parseOnboardingSettingsResponse(settingsResponse({ workflow_sla_rules: null }))).toBeNull()
  })

  it('keeps only role and activation state from staff access rows', () => {
    expect(
      parseOnboardingStaffResponse({
        ok: true,
        staff: [
          {
            id: 'staff-a',
            email: 'private@example.test',
            role: 'admin',
            active: true,
            created_at: '2026-01-01',
          },
        ],
      }),
    ).toEqual([{ role: 'admin', active: true }])
  })

  it('rejects malformed staff evidence instead of treating it as an empty directory', () => {
    expect(parseOnboardingStaffResponse({ ok: true, staff: null })).toBeNull()
    expect(parseOnboardingStaffResponse({ ok: true, staff: [{ role: 'admin' }] })).toBeNull()
    expect(parseOnboardingStaffResponse({ ok: true, staff: [{ role: 1, active: true }] })).toBeNull()
  })
})
