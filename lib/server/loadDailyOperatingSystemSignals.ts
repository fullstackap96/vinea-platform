import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'

import {
  buildDailyOperatingSystemSignals,
  emptyDailyOperatingSystemSignals,
  type DailyOperatingSystemSignals,
} from '@/lib/dailyOperatingSystemSignals'
import { parseHouseholdRow } from '@/lib/households'
import { parsePersonRow } from '@/lib/people'
import { parseSacramentalRecordRow } from '@/lib/sacramentalRecords'
import { logServerError } from '@/lib/server/safeErrorLogging'

type ReadOnlySupabaseClient = Pick<SupabaseClient, 'from'>

export type DailyOperatingSystemSignalsLoadResult = {
  signals: DailyOperatingSystemSignals
  warnings: string[]
}

const PEOPLE_SIGNAL_FIELDS =
  'id, parish_id, first_name, middle_name, last_name, email, phone, date_of_birth'
const HOUSEHOLD_SIGNAL_FIELDS = 'id, parish_id, name, address, city, postal_code'
const RECORD_SIGNAL_FIELDS =
  'id, parish_id, request_id, record_type, person_name, sacrament_date, book, page, line'

function signalWarning(label: string): string {
  return `${label} are temporarily unavailable.`
}

function logSignalLoadError(source: string, error: unknown) {
  logServerError(`[daily-operating-signals] ${source} load failed`, error, {
    route: '/api/dashboard/daily-operating-signals',
  })
}

export async function loadDailyOperatingSystemSignals(
  supabase: ReadOnlySupabaseClient,
  activeParishId: string,
): Promise<DailyOperatingSystemSignalsLoadResult> {
  const parishId = activeParishId.trim()
  if (!parishId) {
    return {
      signals: emptyDailyOperatingSystemSignals(),
      warnings: ['Selected parish context is unavailable.'],
    }
  }

  const [peopleResult, householdsResult, recordsResult] = await Promise.all([
    supabase
      .from('people')
      .select(PEOPLE_SIGNAL_FIELDS)
      .eq('parish_id', parishId)
      .order('updated_at', { ascending: false })
      .limit(500),
    supabase
      .from('households')
      .select(HOUSEHOLD_SIGNAL_FIELDS)
      .eq('parish_id', parishId)
      .order('updated_at', { ascending: false })
      .limit(500),
    supabase
      .from('sacramental_records')
      .select(RECORD_SIGNAL_FIELDS)
      .eq('parish_id', parishId)
      .order('updated_at', { ascending: false })
      .limit(500),
  ])

  const warnings: string[] = []
  if (peopleResult.error) {
    logSignalLoadError('people', peopleResult.error)
    warnings.push(signalWarning('Duplicate people signals'))
  }
  if (householdsResult.error) {
    logSignalLoadError('households', householdsResult.error)
    warnings.push(signalWarning('Duplicate household signals'))
  }
  if (recordsResult.error) {
    logSignalLoadError('sacramental records', recordsResult.error)
    warnings.push(signalWarning('Records and certificate signals'))
  }

  const people = peopleResult.error
    ? []
    : (peopleResult.data ?? []).map((row) => parsePersonRow(row as Record<string, unknown>))
  const households = householdsResult.error
    ? []
    : (householdsResult.data ?? []).map((row) =>
        parseHouseholdRow(row as Record<string, unknown>),
      )
  const sacramentalRecords = recordsResult.error
    ? []
    : (recordsResult.data ?? []).map((row) =>
        parseSacramentalRecordRow(row as Record<string, unknown>),
      )

  const recordIds = sacramentalRecords.map((record) => record.id).filter(Boolean)
  let sacramentalRecordEvents: Array<{ sacramental_record_id: string; action: string }> = []
  let certificateEventsAvailable = true

  if (recordIds.length > 0) {
    const eventsResult = await supabase
      .from('sacramental_record_events')
      .select('sacramental_record_id, action')
      .eq('parish_id', parishId)
      .eq('action', 'certificate_generated')
      .in('sacramental_record_id', recordIds)

    if (eventsResult.error) {
      certificateEventsAvailable = false
      logSignalLoadError('certificate events', eventsResult.error)
      warnings.push(signalWarning('Certificate event signals'))
    } else {
      sacramentalRecordEvents = (eventsResult.data ?? []).map((row) => ({
        sacramental_record_id: String(
          (row as { sacramental_record_id?: unknown }).sacramental_record_id ?? '',
        ),
        action: String((row as { action?: unknown }).action ?? ''),
      }))
    }
  }

  const signals = buildDailyOperatingSystemSignals({
    people,
    households,
    sacramentalRecords,
    sacramentalRecordEvents,
  })

  if (!certificateEventsAvailable) {
    signals.certificateReady = []
    signals.healthSignals.certificateReadyCount = 0
    signals.healthSignals.certificateActivityCount = 0
  }

  return { signals, warnings }
}

export const dailyOperatingSystemSignalLoaderTestInternals = {
  PEOPLE_SIGNAL_FIELDS,
  HOUSEHOLD_SIGNAL_FIELDS,
  RECORD_SIGNAL_FIELDS,
}
