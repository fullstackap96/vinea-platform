import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  baptismCertificateFilename,
  buildBaptismCertificatePdf,
} from '@/lib/server/baptismCertificatePdf'
import {
  ACTIVE_STAFF_PARISH_COOKIE,
  resolveActiveStaffParishContext,
} from '@/lib/server/activeStaffParishContext'
import { requireStaffFromRequest } from '@/lib/server/requireStaff'
import { logServerError } from '@/lib/server/safeErrorLogging'
import { rejectCrossOriginMutation } from '@/lib/server/sameOriginMutation'
import { parseSacramentalRecordRow } from '@/lib/sacramentalRecords'

const CERTIFICATE_RECORD_SELECT =
  'id, parish_id, record_type, person_name, sacrament_date, place, minister, book, page, line' as const

type StaffSupabaseClient = Parameters<typeof resolveActiveStaffParishContext>[0]

function selectedParishId(request: NextRequest): string | null {
  return request.cookies.get(ACTIVE_STAFF_PARISH_COOKIE)?.value?.trim() || null
}

async function resolveCertificateParishContext(
  supabase: StaffSupabaseClient,
  requestedParishId: string | null,
) {
  const context = await resolveActiveStaffParishContext(supabase, {
    requestedParishId,
  })
  if (!context.ok) return context

  if (
    requestedParishId &&
    (context.activeParishId !== requestedParishId || context.source !== 'membership')
  ) {
    return {
      ok: false as const,
      source: context.source,
      error: 'Record not found.',
      technicalDetail: 'Selected parish did not resolve through exact staff membership.',
      requestedParishId,
    }
  }

  return context
}

function certificateRouteErrorResponse(
  action: string,
  error: unknown,
  safeMessage: string,
  status = 500
) {
  logServerError(`[record-certificate] ${action} failed`, error)
  return NextResponse.json({ ok: false, error: safeMessage }, { status })
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const originRejection = rejectCrossOriginMutation(request)
  if (originRejection) return originRejection

  try {
    const { id: recordId } = await context.params
    const id = String(recordId ?? '').trim()
    if (!id) {
      return NextResponse.json({ ok: false, error: 'Missing record id.' }, { status: 400 })
    }

    const staff = await requireStaffFromRequest(request)
    if (!staff.ok) return staff.response

    const requestedParishId = selectedParishId(request)
    const parishContext = await resolveCertificateParishContext(
      staff.supabase,
      requestedParishId,
    )
    if (!parishContext.ok) {
      return NextResponse.json({ ok: false, error: 'Record not found.' }, { status: 404 })
    }

    const { data: row, error: rowErr } = await staff.supabase
      .from('sacramental_records')
      .select(CERTIFICATE_RECORD_SELECT)
      .eq('id', id)
      .eq('parish_id', parishContext.activeParishId)
      .maybeSingle()

    if (rowErr) {
      return certificateRouteErrorResponse(
        'load sacramental record',
        rowErr,
        'Could not load sacramental record.'
      )
    }
    if (!row) {
      return NextResponse.json({ ok: false, error: 'Record not found.' }, { status: 404 })
    }

    const record = parseSacramentalRecordRow(row as Record<string, unknown>)
    if (record.record_type !== 'baptism') {
      return NextResponse.json(
        { ok: false, error: 'Certificates are only available for baptism records.' },
        { status: 403 }
      )
    }

    const { data: parish } = await staff.supabase
      .from('parishes')
      .select('name')
      .eq('id', parishContext.activeParishId)
      .maybeSingle()
    const parishName = parish?.name ? String(parish.name).trim() : null

    const pdfBytes = await buildBaptismCertificatePdf({
      personName: record.person_name,
      sacramentDate: record.sacrament_date,
      place: record.place,
      minister: record.minister,
      book: record.book,
      page: record.page,
      line: record.line,
      parishName,
    })

    const { data: certificateEvent, error: eventErr } = await staff.supabase
      .from('sacramental_record_events')
      .insert({
        parish_id: parishContext.activeParishId,
        sacramental_record_id: record.id,
        action: 'certificate_generated',
        actor_id: staff.user.id,
        actor_email: staff.staff.email,
        metadata: { template: 'baptism_v1' },
      })
      .select('id')
      .maybeSingle()

    if (eventErr || !certificateEvent?.id) {
      return certificateRouteErrorResponse(
        'log certificate generation',
        eventErr ?? new Error('Certificate generation event was not recorded.'),
        'Could not log certificate generation.'
      )
    }

    const filename = baptismCertificateFilename(record.person_name)

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error: unknown) {
    return certificateRouteErrorResponse(
      'unexpected certificate generation',
      error,
      'Could not generate certificate.'
    )
  }
}

export const recordCertificateRouteTestInternals = {
  CERTIFICATE_RECORD_SELECT,
  resolveCertificateParishContext,
  selectedParishId,
}
