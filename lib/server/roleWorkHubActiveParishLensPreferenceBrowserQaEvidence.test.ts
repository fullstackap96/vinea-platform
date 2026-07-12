import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8')
}

describe('Role Work Hub active-parish lens preference browser QA evidence', () => {
  it('records the shared-QA browser verification and safe guardrails', () => {
    const doc = readRepoFile(
      'docs/ROLE_WORK_HUB_ACTIVE_PARISH_LENS_PREFERENCE_BROWSER_QA_20260629.md',
    )

    for (const expected of [
      'Completed against shared QA',
      'localhost:3001',
      'gnfomgsuottcuueasfvi',
      'checks.schema: true',
      'temporary local Chrome browser profile',
      'Page stayed on `/dashboard`',
      'Page did not show a not-found state',
      'Request and communication records were not mutated',
      'Google Calendar was not opened or mutated',
      'Production was not accessed',
      'Migrations/RLS were unchanged',
      'secretsPrinted',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('records separate Parish A and Parish B lens restoration evidence', () => {
    const doc = readRepoFile(
      'docs/ROLE_WORK_HUB_ACTIVE_PARISH_LENS_PREFERENCE_BROWSER_QA_20260629.md',
    )

    for (const expected of [
      'Selecting Pastor lens for Parish A persisted that lens',
      'active tab `Pastor`, stored lens value `pastor`',
      'Selecting Front desk lens for Parish B persisted that lens',
      'active tab `Front desk`, stored lens value `receptionist`',
      'Switching back to Parish A restored the original Parish A lens',
      'Switching back to Parish B restored the original Parish B lens',
      'vinea:dashboard-role-work-hub:active-lens:<parish-id>',
      '"value": "receptionist"',
      '"value": "pastor"',
      'ROLE_WORK_HUB_ACTIVE_PARISH_LENS_PREFERENCE_BROWSER_QA_COMPLETE_SHARED_QA_ONLY',
    ]) {
      expect(doc).toContain(expected)
    }
  })
})
