/**
 * Per-type "confirmed schedule" for dashboard attention, metrics, and follow-up queue.
 * Baptism: requests.confirmed_baptism_date
 * Funeral: funeral_request_details.confirmed_service_at
 * Wedding: wedding_request_details.confirmed_ceremony_at
 * OCIA: ocia_request_details.confirmed_session_at
 */

export type RequestScheduleRow = {
  request_type?: string | null
  confirmed_baptism_date?: string | null
  funeral_detail?: { confirmed_service_at?: string | null } | null
  wedding_detail?: { confirmed_ceremony_at?: string | null } | null
  ocia_detail?: { confirmed_session_at?: string | null } | null
}

export function hasConfirmedSchedule(request: RequestScheduleRow): boolean {
  const t = String(request.request_type || 'baptism').toLowerCase()
  if (t === 'ocia') {
    return Boolean(request.ocia_detail?.confirmed_session_at)
  }
  if (t === 'funeral') {
    return Boolean(request.funeral_detail?.confirmed_service_at)
  }
  if (t === 'wedding') {
    return Boolean(request.wedding_detail?.confirmed_ceremony_at)
  }
  return Boolean(request.confirmed_baptism_date)
}

export function isMissingConfirmedSchedule(request: RequestScheduleRow): boolean {
  return !hasConfirmedSchedule(request)
}

/** Copy for list badges, queue chips, and follow-up context (single source of truth). */
export function missingConfirmedScheduleCopy(requestType: string | null | undefined) {
  const t = String(requestType || 'baptism').toLowerCase()
  if (t === 'ocia') {
    return {
      badge: 'No confirmed OCIA meeting',
      chip: 'Missing Confirmed OCIA Meeting',
      listHeading: 'Missing confirmed OCIA meeting',
      followUpContextLine:
        '- There is no confirmed OCIA meeting time set yet.',
    }
  }
  if (t === 'funeral') {
    return {
      badge: 'No confirmed service',
      chip: 'Missing Confirmed Service',
      listHeading: 'Missing confirmed service',
      followUpContextLine:
        '- There is no confirmed funeral service time set yet.',
    }
  }
  if (t === 'wedding') {
    return {
      badge: 'No confirmed ceremony',
      chip: 'Missing Confirmed Ceremony',
      listHeading: 'Missing confirmed ceremony',
      followUpContextLine:
        '- There is no confirmed wedding ceremony time set yet.',
    }
  }
  return {
    badge: 'No confirmed date',
    chip: 'Missing Confirmed Date',
    listHeading: 'Missing confirmed date',
    followUpContextLine: '- There is no confirmed baptism date set yet.',
  }
}
