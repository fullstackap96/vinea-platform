import { describe, expect, it } from 'vitest'
import {
  parseCreatedPublicIntakeTokenResponse,
  parseParishSettingsResponse,
  parsePublicIntakeDomainVerificationResponse,
  parsePublicIntakeRoutingResponse,
  parseRecentAuditEventsResponse,
  parseStaffAccessResponse,
} from '@/lib/parishSettingsReadModels'

const parishId = '11111111-1111-4111-8111-111111111111'

function settingsResponse() {
  return {
    ok: true,
    parish: {
      id: parishId,
      name: 'St. Martha Parish',
      default_notification_email: 'office@example.org',
      daily_ops_brief_enabled: true,
      daily_ops_brief_email: 'brief@example.org',
      daily_ops_brief_last_sent_on: null,
      daily_ops_brief_last_error: null,
      onboarding_completed_at: '2026-07-01T12:00:00.000Z',
      workflow_sla_rules: {
        firstContactDays: { funeral: 1, wedding: 2, baptism: 3, ocia: 3 },
        ownerAssignmentDays: { funeral: 0, wedding: 1, baptism: 2, ocia: 2 },
      },
      staff_names: ['Alex Parish'],
      priest_names: ['Fr. Joseph'],
      internal_billing_code: 'must-not-survive',
    },
    staff: { id: 'must-not-survive' },
    googleCalendar: {
      status: 'connected',
      last_error: null,
      google_account_email: 'calendar@example.org',
      refresh_token: 'must-not-survive',
    },
  }
}

function routingResponse() {
  return {
    ok: true,
    routing: {
      activeParishId: parishId,
      source: 'membership',
      requestedParishId: parishId,
      parish: {
        id: parishId,
        name: 'St. Martha Parish',
        public_slug: 'st-martha',
        public_display_name: 'St. Martha Parish',
        public_intake_enabled: false,
      },
      domains: [
        {
          id: 'domain-1',
          hostname: 'forms.example.org',
          verified_at: null,
          verification_dns_name: '_vinea.forms.example.org',
          verification_dns_value: 'safe-display-challenge',
          verification_checked_at: null,
          verification_error: null,
          active: true,
          created_at: '2026-07-01T12:00:00.000Z',
          updated_at: '2026-07-01T12:00:00.000Z',
          private_note: 'must-not-survive',
        },
      ],
      tokens: [
        {
          id: 'token-1',
          label: 'Baptism form',
          request_type: 'baptism',
          expires_at: null,
          active: true,
          last_used_at: null,
          created_at: '2026-07-01T12:00:00.000Z',
          updated_at: '2026-07-01T12:00:00.000Z',
          token_hash: 'must-not-survive',
          raw_token: 'must-not-survive',
        },
      ],
    },
  }
}

describe('Parish Settings read-model validation', () => {
  it('projects the valid settings contract and discards unapproved fields', () => {
    const parsed = parseParishSettingsResponse(settingsResponse(), parishId)

    expect(parsed?.parish.name).toBe('St. Martha Parish')
    expect(parsed?.googleCalendar?.status).toBe('connected')
    expect(parsed?.parish).not.toHaveProperty('internal_billing_code')
    expect(parsed?.googleCalendar).not.toHaveProperty('refresh_token')
    expect(parsed).not.toHaveProperty('staff')
  })

  it('rejects mismatched parish scope and malformed SLA or directory fields', () => {
    expect(parseParishSettingsResponse(settingsResponse(), 'different-parish')).toBeNull()

    const malformedSla = settingsResponse()
    malformedSla.parish.workflow_sla_rules.firstContactDays.funeral = 31
    expect(parseParishSettingsResponse(malformedSla, parishId)).toBeNull()

    const malformedDirectory = settingsResponse()
    malformedDirectory.parish.staff_names = [' Alex Parish ']
    expect(parseParishSettingsResponse(malformedDirectory, parishId)).toBeNull()
  })

  it('projects staff rows without timestamps or unrelated account material', () => {
    const parsed = parseStaffAccessResponse({
      ok: true,
      canManage: true,
      staff: [
        {
          id: 'staff-1',
          email: 'staff@example.org',
          role: 'admin',
          active: true,
          created_at: 'private-timestamp',
          auth_user_id: 'must-not-survive',
        },
      ],
    })

    expect(parsed).toEqual({
      canManage: true,
      staff: [{ id: 'staff-1', email: 'staff@example.org', role: 'admin', active: true }],
    })
    expect(parseStaffAccessResponse({ ok: true, canManage: true, staff: [{ id: 'x' }] })).toBeNull()
  })

  it('projects recent audit display fields and rejects malformed event metadata', () => {
    const parsed = parseRecentAuditEventsResponse({
      ok: true,
      activeParishName: 'St. Martha Parish',
      events: [
        {
          id: 'event-1',
          parish_id: parishId,
          actor_email: 'staff@example.org',
          action: 'parish_settings.updated',
          target_type: 'parish',
          target_id: parishId,
          metadata: { summary: 'Settings reviewed' },
          created_at: '2026-07-01T12:00:00.000Z',
        },
      ],
    })

    expect(parsed).toEqual([
      {
        id: 'event-1',
        actor_email: 'staff@example.org',
        action: 'parish_settings.updated',
        target_type: 'parish',
        target_id: parishId,
        metadata: { summary: 'Settings reviewed' },
        created_at: '2026-07-01T12:00:00.000Z',
      },
    ])
    expect(parsed?.[0]).not.toHaveProperty('parish_id')
    expect(parseRecentAuditEventsResponse({ ok: true, events: [{ metadata: [] }] })).toBeNull()
  })

  it('requires routing and parish scope agreement while excluding token secrets', () => {
    const parsed = parsePublicIntakeRoutingResponse(routingResponse(), parishId)

    expect(parsed?.activeParishId).toBe(parishId)
    expect(parsed?.tokens[0]).toEqual({
      id: 'token-1',
      label: 'Baptism form',
      request_type: 'baptism',
      expires_at: null,
      active: true,
      last_used_at: null,
      created_at: '2026-07-01T12:00:00.000Z',
      updated_at: '2026-07-01T12:00:00.000Z',
    })
    expect(parsed?.tokens[0]).not.toHaveProperty('token_hash')
    expect(parsed?.tokens[0]).not.toHaveProperty('raw_token')

    const mismatched = routingResponse()
    mismatched.routing.parish.id = 'different-parish'
    expect(parsePublicIntakeRoutingResponse(mismatched, parishId)).toBeNull()
    expect(parsePublicIntakeRoutingResponse(routingResponse(), 'different-parish')).toBeNull()
  })

  it('projects only approved one-time token and DNS verification response extras', () => {
    expect(
      parseCreatedPublicIntakeTokenResponse({
        ok: true,
        createdToken: {
          id: 'token-1',
          token: 'one-time-visible-token',
          label: 'Baptism form',
          request_type: 'baptism',
          expires_at: null,
          token_hash: 'must-not-survive',
        },
      }),
    ).toEqual({
      id: 'token-1',
      token: 'one-time-visible-token',
      label: 'Baptism form',
      request_type: 'baptism',
      expires_at: null,
    })

    expect(
      parsePublicIntakeDomainVerificationResponse({
        ok: true,
        verification: { verified: false, error: 'DNS record not found', resolverTrace: 'private' },
      }),
    ).toEqual({ verified: false, error: 'DNS record not found' })
    expect(
      parsePublicIntakeDomainVerificationResponse({
        ok: true,
        verification: { verified: 'yes', error: null },
      }),
    ).toBeNull()
  })
})
