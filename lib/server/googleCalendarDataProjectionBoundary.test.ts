import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  CALENDAR_EVENT_PARISHIONER_SELECT,
  CALENDAR_EVENT_REQUEST_SELECT,
} from '@/lib/calendarEventFromRequest'

const root = process.cwd()

function read(path: string) {
  return readFileSync(join(root, path), 'utf8')
}

describe('Google Calendar data projection boundary', () => {
  it('uses explicit minimal request and parishioner projections', () => {
    expect(CALENDAR_EVENT_REQUEST_SELECT.split(', ')).toEqual([
      'id',
      'request_type',
      'parishioner_id',
      'confirmed_baptism_date',
      'child_name',
      'preferred_dates',
      'notes',
      'staff_notes',
      'google_calendar_event_id',
      'google_calendar_id',
      'google_calendar_event_html_link',
    ])
    expect(CALENDAR_EVENT_PARISHIONER_SELECT.split(', ')).toEqual([
      'id',
      'parish_id',
      'full_name',
      'email',
      'phone',
    ])
  })

  it('keeps create, update, and delete routes off wildcard operational reads', () => {
    for (const path of [
      'app/api/google/calendar-event/create/route.ts',
      'app/api/google/calendar-event/update/route.ts',
      'app/api/google/calendar-event/delete/route.ts',
    ]) {
      const source = read(path)
      const requestProjectionIndex = source.indexOf('.select(CALENDAR_EVENT_REQUEST_SELECT)')
      const parishionerProjectionIndex = source.indexOf(
        '.select(CALENDAR_EVENT_PARISHIONER_SELECT)',
      )

      expect(source).not.toContain(".select('*')")
      expect(requestProjectionIndex).toBeGreaterThan(-1)
      expect(parishionerProjectionIndex).toBeGreaterThan(requestProjectionIndex)
      expect(source).toContain('parishionerMatchesParish(')
    }
  })

  it('uses explicit Funeral, Wedding, and OCIA detail projections before event assembly', () => {
    const source = read('lib/calendarEventFromRequest.ts')

    expect(source).not.toContain(".select('*')")
    expect(source).toContain('.select(FUNERAL_CALENDAR_DETAIL_SELECT)')
    expect(source).toContain('.select(WEDDING_CALENDAR_DETAIL_SELECT)')
    expect(source).toContain('.select(OCIA_CALENDAR_DETAIL_SELECT)')

    for (const requiredField of [
      'confirmed_service_at',
      'deceased_name',
      'confirmed_ceremony_at',
      'partner_one_name',
      'confirmed_session_at',
      'sacramental_background',
    ]) {
      expect(source).toContain(requiredField)
    }
  })

  it('keeps browser Supabase imports limited to authentication surfaces', () => {
    const browserSupabaseImports = [
      'app/login/page.tsx',
      'app/dashboard/DashboardLayoutClient.tsx',
    ]

    for (const path of browserSupabaseImports) {
      expect(read(path)).toContain("import { supabase } from '@/lib/supabase'")
    }

    const requestDetail = read('app/dashboard/requests/[id]/page.tsx')
    const dashboard = read('app/dashboard/DashboardPageCore.tsx')
    expect(requestDetail).not.toContain("from '@/lib/supabase'")
    expect(dashboard).not.toContain("from '@/lib/supabase'")
  })
})
