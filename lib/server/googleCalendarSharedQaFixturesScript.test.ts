import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const scriptPath = join(process.cwd(), 'scripts', 'create-google-calendar-shared-qa-fixtures.mjs')

describe('Google Calendar shared QA fixture script', () => {
  it('requires explicit confirmation and refuses projects outside shared QA', () => {
    const source = readFileSync(scriptPath, 'utf8')

    for (const expected of [
      'CREATE_GOOGLE_CALENDAR_SHARED_QA_FIXTURES',
      'gnfomgsuottcuueasfvi',
      'Refusing to create fixtures outside shared QA',
      'Refusing to prepare browser QA fixtures for a production-looking app URL',
    ]) {
      expect(source).toContain(expected)
    }
  })

  it('creates synthetic QA-only parishes, staff memberships, and request fixtures', () => {
    const source = readFileSync(scriptPath, 'utf8')

    for (const expected of [
      'Vinea QA Google Calendar Parish A',
      'Vinea QA Google Calendar Parish B',
      "from('staff_users')",
      "from('parish_memberships')",
      "from('parishioners')",
      "from('requests')",
      'VINEA_GOOGLE_CALENDAR_QA_SAME_PARISH',
      'VINEA_GOOGLE_CALENDAR_QA_CROSS_PARISH',
      'VINEA_GOOGLE_CALENDAR_QA_MISMATCHED_CALENDAR',
      '2099-07-01T10:00:00.000Z',
      'google_calendar_id',
    ]) {
      expect(source).toContain(expected)
    }
  })

  it('updates only the ignored browser QA env fixture ids and avoids printing secrets', () => {
    const source = readFileSync(scriptPath, 'utf8')

    for (const expected of [
      '.env.google-calendar-browser-qa.local',
      'QA_ACTIVE_PARISH_A_ID',
      'QA_ACTIVE_PARISH_B_ID',
      'QA_GOOGLE_SAME_PARISH_REQUEST_ID',
      'QA_GOOGLE_CROSS_PARISH_REQUEST_ID',
      'QA_GOOGLE_MISMATCHED_CALENDAR_REQUEST_ID',
      'secretsPrinted: false',
    ]) {
      expect(source).toContain(expected)
    }

    expect(source).not.toContain('console.log(serviceRoleKey)')
    expect(source).not.toContain('console.log(staffEmail)')
  })
})
