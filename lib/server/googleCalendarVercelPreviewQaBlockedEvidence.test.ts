import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const evidencePath = join(
  root,
  'docs',
  'GOOGLE_CALENDAR_VERCEL_PREVIEW_QA_BLOCKED_20260628.md'
)
const buildStatusPath = join(root, 'docs', 'VINEA_BUILD_STATUS.md')

describe('Google Calendar Vercel preview OAuth QA blocked evidence', () => {
  it('records why the existing Vercel preview is not a valid QA target', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Status: `BLOCKED - CURRENT SAFE PREVIEW DEPLOYMENT NOT AVAILABLE`',
      'Vercel project found | `YES - vinea-platform`',
      'Existing preview found | `YES - June 22 preview branch codex/weekly-security-audit-20260622`',
      'Existing preview current enough for this QA | `NO - predates recent selected-parish Google Calendar work`',
      'Vercel deployment protection | `ENABLED - visitors must log in to Vercel and be team members`',
      'Vercel CLI auth result | `BLOCKED - login/whoami hung in non-interactive auth prompt`',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('records that no production, OAuth, deployment, or calendar side effects occurred', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Production app accessed for QA | `NO`',
      'Production deployment used as QA target | `NO`',
      'Migrations applied | `NO`',
      'Operational RLS changed | `NO`',
      'Vercel deployment protection changed | `NO`',
      'Google OAuth redirect URI registered | `NO`',
      'Google OAuth reconnect started | `NO`',
      'Google credentials submitted | `NO`',
      'Google Calendar event create/update/delete attempted | `NO`',
      'Secrets printed into evidence | `NO`',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('updates build status with the blocked Vercel preview path and next setup options', () => {
    const buildStatus = readFileSync(buildStatusPath, 'utf8')

    for (const expected of [
      'Google Calendar Vercel Preview OAuth QA Blocked',
      'docs/GOOGLE_CALENDAR_VERCEL_PREVIEW_QA_BLOCKED_20260628.md',
      'current, non-production HTTPS URL',
      'Vercel token scoped to preview deployment',
      'Google Calendar event create/update/delete remains blocked',
    ]) {
      expect(buildStatus).toContain(expected)
    }
  })
})
