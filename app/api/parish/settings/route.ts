import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { assertParishSettingsEnv } from '@/lib/server/requiredEnv'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'
import { createSupabaseRouteHandlerReadOnlyClient } from '@/lib/supabase/routeHandlerClient'
import { directoryFromJsonColumn } from '@/lib/parishDirectory'

function isValidEmail(value: string): boolean {
  const s = String(value || '').trim()
  if (!s) return false
  return s.includes('@') && !/\s/.test(s)
}

async function loadPrimaryParishWithGoogle(admin: ReturnType<typeof createSupabaseServiceRoleClient>) {
  const { data: parish, error: parishErr } = await admin
    .from('parishes')
    .select(
      'id, name, default_notification_email, staff_directory, priest_directory, daily_ops_brief_enabled, daily_ops_brief_email, daily_ops_brief_last_sent_on, daily_ops_brief_last_error, created_at'
    )
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (parishErr || !parish?.id) {
    return { parish: null as null, google: null as null, error: parishErr?.message ?? 'No parish row' }
  }

  const { data: row, error: rowErr } = await admin
    .from('parish_google_integrations')
    .select('status, last_error, google_account_email')
    .eq('parish_id', parish.id)
    .maybeSingle()

  if (rowErr) {
    return {
      parish,
      google: null as {
        status: string | null
        last_error: string | null
        google_account_email: string | null
      } | null,
      error: null as string | null,
    }
  }

  return {
    parish,
    google: row
      ? {
          status: row.status,
          last_error: row.last_error,
          google_account_email: row.google_account_email,
        }
      : null,
    error: null as string | null,
  }
}

export async function GET(request: NextRequest) {
  try {
    assertParishSettingsEnv()

    const supabase = createSupabaseRouteHandlerReadOnlyClient(request)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createSupabaseServiceRoleClient()
    const { parish, google, error } = await loadPrimaryParishWithGoogle(admin)

    if (!parish) {
      return NextResponse.json({ ok: false, error: error || 'Parish not found' }, { status: 404 })
    }

    return NextResponse.json(
      {
        ok: true,
        parish: {
          id: parish.id,
          name: parish.name,
          default_notification_email: String(parish.default_notification_email ?? '').trim(),
          daily_ops_brief_enabled: Boolean(parish.daily_ops_brief_enabled),
          daily_ops_brief_email: String(parish.daily_ops_brief_email ?? '').trim(),
          daily_ops_brief_last_sent_on: parish.daily_ops_brief_last_sent_on ?? null,
          daily_ops_brief_last_error: parish.daily_ops_brief_last_error ?? null,
          staff_names: directoryFromJsonColumn(parish.staff_directory),
          priest_names: directoryFromJsonColumn(parish.priest_directory),
        },
        googleCalendar: google,
      },
      { status: 200 }
    )
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || 'Server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    assertParishSettingsEnv()

    const supabase = createSupabaseRouteHandlerReadOnlyClient(request)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => null as Record<string, unknown> | null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 })
    }

    const name = String(body.name ?? '').trim().slice(0, 200)
    if (!name) {
      return NextResponse.json({ ok: false, error: 'Parish name is required' }, { status: 400 })
    }

    const emailRaw = String(body.default_notification_email ?? '').trim()
    if (emailRaw && !isValidEmail(emailRaw)) {
      return NextResponse.json(
        { ok: false, error: 'Please enter a valid notification email, or leave it blank.' },
        { status: 400 }
      )
    }

    const dailyBriefEnabled = Boolean(body.daily_ops_brief_enabled)
    const dailyBriefEmailRaw = String(body.daily_ops_brief_email ?? '').trim()
    if (dailyBriefEmailRaw && !isValidEmail(dailyBriefEmailRaw)) {
      return NextResponse.json(
        { ok: false, error: 'Please enter a valid daily brief email, or leave it blank.' },
        { status: 400 }
      )
    }
    if (dailyBriefEnabled && !dailyBriefEmailRaw && !emailRaw) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Daily brief delivery needs either a daily brief email or a default notification email.',
        },
        { status: 400 }
      )
    }

    const staff = directoryFromJsonColumn(
      Array.isArray(body.staff_names) ? body.staff_names : []
    )
    const priests = directoryFromJsonColumn(
      Array.isArray(body.priest_names) ? body.priest_names : []
    )

    const admin = createSupabaseServiceRoleClient()
    const { data: parish, error: parishErr } = await admin
      .from('parishes')
      .select('id')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (parishErr || !parish?.id) {
      return NextResponse.json({ ok: false, error: 'Parish not found' }, { status: 404 })
    }

    const { error: updateErr } = await admin
      .from('parishes')
      .update({
        name,
        default_notification_email: emailRaw || null,
        daily_ops_brief_enabled: dailyBriefEnabled,
        daily_ops_brief_email: dailyBriefEmailRaw || null,
        staff_directory: staff,
        priest_directory: priests,
        updated_at: new Date().toISOString(),
      })
      .eq('id', parish.id)

    if (updateErr) {
      return NextResponse.json({ ok: false, error: updateErr.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || 'Server error' },
      { status: 500 }
    )
  }
}
