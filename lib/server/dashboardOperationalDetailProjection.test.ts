import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  join(process.cwd(), 'lib', 'dashboard', 'loadDashboardRequests.ts'),
  'utf8',
)

describe('Daily Work Hub operational detail projections', () => {
  it('loads only the funeral fields used by the dashboard and staff-reviewed draft builder', () => {
    expect(source).toContain(
      'request_id, deceased_name, family_relationship, date_of_death, funeral_home_or_location, funeral_director_contact, service_location, visitation_details, cemetery_or_committal, readings_music_notes, obituary_program_notes, post_funeral_follow_up_date, preferred_service_notes, confirmed_service_at',
    )
    expect(source).not.toContain(".select('*')")
  })

  it('loads only the wedding and OCIA fields used by the dashboard', () => {
    expect(source).toContain(
      'request_id, partner_one_name, partner_two_name, proposed_wedding_date, ceremony_notes, confirmed_ceremony_at',
    )
    expect(source).toContain(
      'request_id, date_of_birth, age_or_dob_note, sacramental_background, seeking, parishioner_status, preferred_contact_method, availability, confirmed_session_at',
    )
    expect(source).not.toContain(".select('*')")
  })

  it('keeps every operational detail lookup request-id scoped', () => {
    for (const table of [
      'funeral_request_details',
      'wedding_request_details',
      'ocia_request_details',
    ]) {
      expect(source).toContain(`['${table.replace('_request_details', '')}', '${table}']`)
    }
    expect(source).toContain(".in('request_id', ids)")
    expect(source).toContain('DETAIL_FIELDS_BY_TYPE[type]')
  })
})
