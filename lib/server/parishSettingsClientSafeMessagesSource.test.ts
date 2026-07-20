import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('parish settings client safe messages', () => {
  it('routes main settings and daily brief failures through allowlisted helpers', () => {
    const source = readRepoFile('app/dashboard/settings/ParishSettingsPage.tsx')

    expect(source).toContain(
      "setLoadError(parishSettingsClientErrorMessage('loadSettings', data?.error))"
    )
    expect(source).toContain(
      "setLoadError(parishSettingsClientErrorMessage('loadSettings', error))"
    )
    expect(source).toContain(
      "setSaveError(parishSettingsClientErrorMessage('saveSettings', data?.error))"
    )
    expect(source).toContain('setSaveError(PARISH_SETTINGS_REFRESH_REQUIRED_MESSAGE)')
    expect(source).toContain(
      "setDailyBriefMessage(parishSettingsClientErrorMessage('sendDailyBrief', data?.error))"
    )
    expect(source).toContain(
      "setDailyBriefMessage(parishSettingsClientErrorMessage('sendDailyBrief', error))"
    )

    for (const rawPattern of [
      'setLoadError(String(data?.error || `Could not load settings (${res.status})`))',
      "setLoadError(messageFromUnknown(error, 'Could not load settings.'))",
      "setSaveError(String(data?.error || 'Save failed'))",
      "setSaveError(messageFromUnknown(error, 'Save failed'))",
      "setDailyBriefMessage(String(data?.error || 'Could not send the daily brief.'))",
      "setDailyBriefMessage(messageFromUnknown(error, 'Could not send the daily brief.'))",
    ]) {
      expect(source).not.toContain(rawPattern)
    }
  })

  it('routes staff access and recent activity failures through allowlisted helpers', () => {
    const source = readRepoFile('app/dashboard/settings/ParishSettingsPage.tsx')

    expect(source).toContain("from '@/lib/parishSettingsClientMessages'")
    expect(source).toContain(
      "setStaffAccessError(parishSettingsClientErrorMessage('loadStaffAccess', data?.error))"
    )
    expect(source).toContain(
      "setStaffAccessError(parishSettingsClientErrorMessage('loadStaffAccess', error))"
    )
    expect(source).toContain(
      "setStaffAccessError(parishSettingsClientErrorMessage('addStaffAccess', data?.error))"
    )
    expect(source).toContain('setStaffAccessError(STAFF_ACCESS_REFRESH_REQUIRED_MESSAGE)')
    expect(source).toContain(
      "setStaffAccessError(parishSettingsClientErrorMessage('updateStaffAccess', data?.error))"
    )
    expect(source).toContain("from '@/lib/parishSettingsClientConfirmation'")
    expect(source).toContain(
      "setRecentAuditError(parishSettingsClientErrorMessage('loadRecentActivity', data?.error))"
    )
    expect(source).toContain(
      "setRecentAuditError(parishSettingsClientErrorMessage('loadRecentActivity', error))"
    )

    for (const rawPattern of [
      "setStaffAccessError(String(data?.error || 'Could not load staff access.'))",
      "setStaffAccessError(messageFromUnknown(error, 'Could not load staff access.'))",
      "setRecentAuditError(String(data?.error || 'Could not load recent activity.'))",
      "setRecentAuditError(messageFromUnknown(error, 'Could not load recent activity.'))",
      "setStaffAccessError(String(data?.error || 'Could not add staff access.'))",
      "setStaffAccessError(messageFromUnknown(error, 'Could not add staff access.'))",
      "setStaffAccessError(String(data?.error || 'Could not update staff access.'))",
      "setStaffAccessError(messageFromUnknown(error, 'Could not update staff access.'))",
    ]) {
      expect(source).not.toContain(rawPattern)
    }
  })

  it('routes public intake routing failures through allowlisted helpers', () => {
    const source = readRepoFile('app/dashboard/settings/ParishSettingsPage.tsx')

    for (const expected of [
      "setPublicIntakeRoutingError(\n          parishSettingsClientErrorMessage('loadPublicIntakeRouting', data?.error)\n        )",
      "setPublicIntakeRoutingError(\n        parishSettingsClientErrorMessage('loadPublicIntakeRouting', error)\n      )",
      "setPublicIntakeRoutingSaveError(\n          parishSettingsClientErrorMessage('savePublicIntakeRouting', data?.error)\n        )",
      "setPublicIntakeRoutingSaveError(\n        parishSettingsClientErrorMessage('savePublicIntakeRouting', error)\n      )",
      "parishSettingsClientErrorMessage('addPublicRoutingDomain', data?.error)",
      "parishSettingsClientErrorMessage('addPublicRoutingDomain', error)",
      "parishSettingsClientErrorMessage('createPublicRoutingToken', data?.error)",
      "parishSettingsClientErrorMessage('createPublicRoutingToken', error)",
      "parishSettingsClientErrorMessage('updatePublicRoutingToken', data?.error)",
      "parishSettingsClientErrorMessage('updatePublicRoutingToken', error)",
      "parishSettingsClientErrorMessage('updatePublicRoutingDomain', data?.error)",
      "parishSettingsClientErrorMessage('updatePublicRoutingDomain', error)",
      "parishSettingsClientErrorMessage('verifyPublicRoutingDomain', data?.error)",
      "parishSettingsClientErrorMessage('verifyPublicRoutingDomain', error)",
      'publicRoutingDomainVerificationResultMessage(verification.error)',
      "parishSettingsClientErrorMessage(\n            'resetPublicRoutingDomainVerification',\n            data?.error\n          )",
      "parishSettingsClientErrorMessage('resetPublicRoutingDomainVerification', error)",
    ]) {
      expect(source).toContain(expected)
    }

    for (const rawPattern of [
      "String(data?.error || 'Could not load public intake routing metadata.')",
      "messageFromUnknown(error, 'Could not load public intake routing metadata.')",
      "String(data?.error || 'Could not save public intake routing metadata.')",
      "messageFromUnknown(error, 'Could not save public intake routing metadata.')",
      "String(data?.error || 'Could not add public intake domain.')",
      "messageFromUnknown(error, 'Could not add public intake domain.')",
      "String(data?.error || 'Could not create public intake token.')",
      "messageFromUnknown(error, 'Could not create public intake token.')",
      "String(data?.error || 'Could not update public intake token.')",
      "messageFromUnknown(error, 'Could not update public intake token.')",
      "String(data?.error || 'Could not update public intake domain.')",
      "messageFromUnknown(error, 'Could not update public intake domain.')",
      "String(data?.error || 'Could not verify public intake domain.')",
      "messageFromUnknown(error, 'Could not verify public intake domain.')",
      "String(data.verification?.error || 'Domain verification did not pass yet.')",
      "String(data?.error || 'Could not reset public intake domain verification.')",
      "messageFromUnknown(error, 'Could not reset public intake domain verification.')",
    ]) {
      expect(source).not.toContain(rawPattern)
    }
  })

  it('keeps selected parish settings and staff success copy intact', () => {
    const source = readRepoFile('app/dashboard/settings/ParishSettingsPage.tsx')

    expect(source).toContain('Settings are scoped to {loadedParishName}.')
    expect(source).toContain("setStaffAccessMessage('Staff access saved.')")
    expect(source).toContain("setStaffAccessMessage('Staff access updated.')")
    expect(source).toContain(
      "setPublicRoutingTokenMessage('Token created. This is the only time the full token is shown.')"
    )
    expect(source).toContain('setCreatedPublicRoutingToken(')
  })
})
