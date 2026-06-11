import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  baptismCertificateFilename,
  buildBaptismCertificatePdf,
} from '@/lib/server/baptismCertificatePdf'
import { parseSacramentalRecordRow } from '@/lib/sacramentalRecords'
import { createSupabaseRouteHandlerReadOnlyClient } from '@/lib/supabase/routeHandlerClient'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: recordId } = await context.params
    const id = String(recordId ?? '').trim()
    if (!id) {
      return NextResponse.json({ ok: false, error: 'Missing record id.' }, { status: 400 })
    }

    const supabase = createSupabaseRouteHandlerReadOnlyClient(request)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { data: row, error: rowErr } = await supabase
      .from('sacramental_records')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (rowErr) {
      return NextResponse.json({ ok: false, error: rowErr.message }, { status: 500 })
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

    let parishName: string | null = null
    try {
      const admin = createSupabaseServiceRoleClient()
      const { data: parish } = await admin
        .from('parishes')
        .select('name')
        .eq('id', record.parish_id)
        .maybeSingle()
      parishName = parish?.name ? String(parish.name).trim() : null
    } catch {
      parishName = null
    }

    const { error: eventErr } = await supabase.from('sacramental_record_events').insert({
      parish_id: record.parish_id,
      sacramental_record_id: record.id,
      action: 'certificate_generated',
      actor_id: user.id,
      actor_email: user.email ?? null,
      metadata: { template: 'baptism_v1' },
    })

    if (eventErr) {
      return NextResponse.json(
        { ok: false, error: eventErr.message || 'Could not log certificate generation.' },
        { status: 500 }
      )
    }

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

    const filename = baptismCertificateFilename(record.person_name)

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Server error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
