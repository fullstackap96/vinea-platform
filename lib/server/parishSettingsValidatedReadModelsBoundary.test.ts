import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  join(process.cwd(), 'app/dashboard/settings/ParishSettingsPage.tsx'),
  'utf8',
)

describe('Parish Settings validated read-model boundary', () => {
  it('requires shared validators before each read loader settles data', () => {
    for (const parser of [
      'parseParishSettingsResponse(data, activeParishId)',
      'parseStaffAccessResponse(data)',
      'parseRecentAuditEventsResponse(data)',
      'parsePublicIntakeRoutingResponse(data, activeParishId)',
    ]) {
      expect(source).toContain(parser)
    }

    expect(source).toContain('setStaffAccess(parsed.staff)')
    expect(source).toContain('setRecentAuditEvents(parsed)')
    expect(source).toContain('setGoogleCalendar(parsed.googleCalendar)')
    expect(source).toContain('applyPublicIntakeRoutingSnapshot(routing)')
  })

  it('fails malformed current-generation responses closed with existing safe messages', () => {
    expect(source).toContain("parishSettingsClientErrorMessage('loadSettings', null)")
    expect(source).toContain("parishSettingsClientErrorMessage('loadStaffAccess', null)")
    expect(source).toContain("parishSettingsClientErrorMessage('loadRecentActivity', null)")
    expect(source).toContain("parishSettingsClientErrorMessage('loadPublicIntakeRouting', null)")
    expect(source).toContain('setStaffAccess([])')
    expect(source).toContain('setCanManageStaff(false)')
    expect(source).toContain('setRecentAuditEvents([])')
    expect(source).toContain('setPublicIntakeRouting(null)')
  })

  it('retains abortable latest-generation reads and existing mutation routes', () => {
    expect(source.match(/signal: controller\.signal/g)?.length).toBeGreaterThanOrEqual(4)
    expect(source.match(/const isLatestLoad = \(\) =>/g)?.length).toBeGreaterThanOrEqual(4)
    expect(source).toContain("method: 'PATCH'")
    expect(source).toContain("fetch('/api/parish/staff-users'")
    expect(source).toContain("fetch('/api/parish/public-intake-routing'")
  })

  it('validates every routing mutation snapshot and its narrow response extras', () => {
    expect(source.match(/parsePublicIntakeRoutingResponse\(data, activeParishId\)/g)?.length)
      .toBeGreaterThanOrEqual(8)
    expect(source).toContain('parseCreatedPublicIntakeTokenResponse(data)')
    expect(source).toContain('parsePublicIntakeDomainVerificationResponse(data)')
    expect(source).not.toContain('data.routing as PublicIntakeRoutingSnapshot')
    expect(source).not.toContain('data.createdToken as CreatedPublicIntakeToken')
  })

  it('documents unchanged runtime and production boundaries', () => {
    const evidence = readFileSync(
      join(process.cwd(), 'docs/PARISH_SETTINGS_VALIDATED_READ_MODELS_20260711.md'),
      'utf8',
    )
    for (const phrase of [
      'PARISH_SETTINGS_VALIDATED_READ_MODELS_IMPLEMENTED_20260711',
      'selected-parish identifier agreement',
      'token hashes',
      'No production or shared-QA access',
      'No migration or operational RLS change',
      'No write route or provider behavior changed',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
