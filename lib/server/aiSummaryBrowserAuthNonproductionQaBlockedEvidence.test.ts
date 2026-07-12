import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const evidencePath = join(
  root,
  'docs',
  'AI_SUMMARY_BROWSER_AUTH_NONPRODUCTION_QA_EVIDENCE_20260627_BLOCKED.md'
)
const buildStatusPath = join(root, 'docs', 'VINEA_BUILD_STATUS.md')

describe('AI summary browser-authenticated non-production QA blocked evidence', () => {
  it('records that the browser-authenticated gate stopped before risky runtime work', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Status: Blocked before browser-authenticated execution.',
      'Production app accessed: `No`',
      'Production flags enabled: `No`',
      'App server started by this gate: `No`',
      'Browser session run by this gate: `No`',
      'OpenAI provider called by this gate: `No`',
      'Live audit rows written by this gate: `No`',
      'Migrations applied: `No`',
      '`/api/ai/reply` changed: `No`',
      'Operational RLS changed: `No`',
      'Secrets printed or committed: `No`',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('captures the missing approved app, staff credentials, and safe fixture blockers', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'NON_PRODUCTION_APP_URL: missing',
      'QA_STAFF_EMAIL: missing',
      'QA_STAFF_PASSWORD: missing',
      'QA_REQUEST_ID: missing',
      'QA_CROSS_PARISH_REQUEST_ID: missing',
      'QA_FAMILY_PORTAL_URL: missing',
      'NEXT_PUBLIC_SUPABASE_URL host: gnfomgsuottcuueasfvi.supabase.co',
      'NEXT_PUBLIC_APP_URL host: localhost',
      'No safe staff email/password is available to sign in through the browser.',
      'No same-parish safe request ID is available for the staff AI summary test.',
      'No cross-parish denied request ID or forged active-parish test fixture is available.',
      'No safe family portal fixture or token plan is available.',
      '## Second Attempt',
      'The Codex process, Windows user scope, Windows machine scope, `HKCU:\\Environment`, `HKCU:\\Volatile Environment`, and `HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment` were checked again without printing secret values.',
      'VINEA_AI_SUMMARY_* runtime gate flags: missing from process/user/machine scope',
      'HKCU:\\Environment: no matching browser-QA input names',
      'HKCU:\\Volatile Environment: no matching browser-QA input names',
      'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment: no matching browser-QA input names',
      'not executed on the second attempt',
      '## Second Attempt Automated Check Outputs',
      'Full test suite: `Pass` (`npm.cmd test`, `173` test files, `728` tests).',
      'Production build: `Pass` (`npm.cmd run build`, Next.js `16.2.2`).',
      '## Third Attempt',
      'Codex rechecked variable visibility by name only using `scripts/check-ai-summary-browser-qa-env.ps1`',
      'VINEA_AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK: missing',
      'not executed on the third attempt',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('documents exactly what is required before the browser-authenticated run can proceed', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'NON_PRODUCTION_APP_URL=<approved non-production app URL>',
      'QA_STAFF_EMAIL=<safe staff account email>',
      'QA_STAFF_PASSWORD=<safe staff account password>',
      'QA_REQUEST_ID=<safe same-parish request id>',
      'QA_CROSS_PARISH_REQUEST_ID=<safe denied request id or approved denial fixture>',
      'QA_FAMILY_PORTAL_URL=<safe family portal fixture URL, no raw token recorded in evidence>',
      'Approved non-production OpenAI/audit settings.',
      'Monitoring owner/channel.',
      'Rollback owner.',
      'Saved browser QA variables for approved non-production host: <host>',
      'powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\\scripts\\check-ai-summary-browser-qa-env.ps1',
      'DO_NOT_APPROVE_BROWSER_AUTH_NONPRODUCTION_AI_SUMMARY_SAFETY_CHAIN',
      'NO_GO_PRODUCTION_AI_SUMMARY_SAFETY_CHAIN',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('records the blocked browser-authenticated QA evidence in build status', () => {
    const buildStatus = readFileSync(buildStatusPath, 'utf8')

    expect(buildStatus).toContain('AI Summary Browser-Authenticated Non-Production QA Execution Blocked')
    expect(buildStatus).toContain('AI_SUMMARY_BROWSER_AUTH_NONPRODUCTION_QA_EVIDENCE_20260627_BLOCKED.md')
  })
})
