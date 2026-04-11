import type { SupabaseClient } from '@supabase/supabase-js'

function toIso(value: unknown) {
  if (!value) return null
  const d = new Date(String(value))
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString()
}

export type CalendarEventBuildResult =
  | {
      ok: true
      start: Date
      end: Date
      summary: string
      description: string
    }
  | { ok: false; error: string }

/**
 * Builds Google Calendar event fields from requests + parishioner (+ funeral row when needed).
 */
export async function buildCalendarEventFromRequest(
  supabase: SupabaseClient,
  reqRow: Record<string, unknown>,
  parishionerRow: Record<string, unknown> | null
): Promise<CalendarEventBuildResult> {
  const requestType = String(reqRow.request_type || 'baptism')
  const parishionerName = String(parishionerRow?.full_name || 'Unknown')
  const parishionerEmail = String(parishionerRow?.email || 'Unknown')
  const parishionerPhone = String(parishionerRow?.phone || '')

  if (requestType === 'baptism') {
    const startIso = toIso(reqRow.confirmed_baptism_date)
    if (!startIso) {
      return { ok: false, error: 'Confirmed baptism date is not set' }
    }
    const start = new Date(startIso)
    const end = new Date(start.getTime() + 60 * 60 * 1000)

    const lines: string[] = []
    lines.push('Baptism request details')
    lines.push('')
    lines.push(`Request ID: ${reqRow.id}`)
    lines.push(`Parent: ${parishionerName}`)
    lines.push(`Email: ${parishionerEmail}`)
    if (parishionerPhone) lines.push(`Phone: ${parishionerPhone}`)
    lines.push(`Child: ${reqRow.child_name || ''}`)
    if (reqRow.preferred_dates) lines.push(`Preferred Dates: ${reqRow.preferred_dates}`)
    if (reqRow.notes) {
      lines.push('')
      lines.push('Intake notes:')
      lines.push(String(reqRow.notes))
    }
    if (reqRow.staff_notes) {
      lines.push('')
      lines.push('Staff notes:')
      lines.push(String(reqRow.staff_notes))
    }

    const description = lines.join('\n')
    const summary = `Baptism: ${String(reqRow.child_name || parishionerName)}`
    return { ok: true, start, end, summary, description }
  }

  if (requestType === 'funeral') {
    const { data: fd, error: fdErr } = await supabase
      .from('funeral_request_details')
      .select('*')
      .eq('request_id', reqRow.id as string)
      .maybeSingle()

    if (fdErr || !fd) {
      return { ok: false, error: 'Funeral details not found' }
    }

    const startIso = toIso(fd.confirmed_service_at)
    if (!startIso) {
      return { ok: false, error: 'Confirmed funeral service time is not set' }
    }
    const start = new Date(startIso)
    const end = new Date(start.getTime() + 60 * 60 * 1000)

    const lines: string[] = []
    lines.push('Funeral request details')
    lines.push('')
    lines.push(`Request ID: ${reqRow.id}`)
    lines.push(`Family contact: ${parishionerName}`)
    lines.push(`Email: ${parishionerEmail}`)
    if (parishionerPhone) lines.push(`Phone: ${parishionerPhone}`)
    lines.push(`Deceased: ${fd.deceased_name || ''}`)
    if (fd.date_of_death) lines.push(`Date of death: ${fd.date_of_death}`)
    if (fd.funeral_home_or_location) {
      lines.push(`Location / funeral home: ${fd.funeral_home_or_location}`)
    }
    if (fd.preferred_service_notes) {
      lines.push(`Preferred service notes: ${fd.preferred_service_notes}`)
    }
    if (reqRow.notes) {
      lines.push('')
      lines.push('Intake notes:')
      lines.push(String(reqRow.notes))
    }
    if (reqRow.staff_notes) {
      lines.push('')
      lines.push('Staff notes:')
      lines.push(String(reqRow.staff_notes))
    }

    const description = lines.join('\n')
    const summary = `Funeral: ${String(fd.deceased_name || parishionerName)}`
    return { ok: true, start, end, summary, description }
  }

  if (requestType === 'wedding') {
    const { data: wd, error: wdErr } = await supabase
      .from('wedding_request_details')
      .select('*')
      .eq('request_id', reqRow.id as string)
      .maybeSingle()

    if (wdErr || !wd) {
      return { ok: false, error: 'Wedding details not found' }
    }

    const startIso = toIso(wd.confirmed_ceremony_at)
    if (!startIso) {
      return { ok: false, error: 'Confirmed wedding ceremony time is not set' }
    }
    const start = new Date(startIso)
    const end = new Date(start.getTime() + 60 * 60 * 1000)

    const lines: string[] = []
    lines.push('Wedding request details')
    lines.push('')
    lines.push(`Request ID: ${reqRow.id}`)
    lines.push(`Contact: ${parishionerName}`)
    lines.push(`Email: ${parishionerEmail}`)
    if (parishionerPhone) lines.push(`Phone: ${parishionerPhone}`)
    lines.push(`Partner: ${wd.partner_one_name || ''}`)
    if (wd.partner_two_name) lines.push(`Partner: ${wd.partner_two_name}`)
    if (wd.proposed_wedding_date) {
      lines.push(`Proposed wedding date: ${wd.proposed_wedding_date}`)
    }
    if (wd.ceremony_notes) {
      lines.push(`Ceremony notes: ${wd.ceremony_notes}`)
    }
    if (reqRow.notes) {
      lines.push('')
      lines.push('Intake notes:')
      lines.push(String(reqRow.notes))
    }
    if (reqRow.staff_notes) {
      lines.push('')
      lines.push('Staff notes:')
      lines.push(String(reqRow.staff_notes))
    }

    const description = lines.join('\n')
    const couple = [wd.partner_one_name, wd.partner_two_name].filter(Boolean).join(' & ')
    const summary = `Wedding: ${couple || parishionerName}`
    return { ok: true, start, end, summary, description }
  }

  return {
    ok: false,
    error: 'Calendar is not supported for this request type yet',
  }
}
