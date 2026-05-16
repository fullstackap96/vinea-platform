import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isParishSettingsAdminEmail } from '@/lib/server/parishSettingsAdmin'
import { assertParishSettingsEnv } from '@/lib/server/requiredEnv'
import { writeAuditLog } from '@/lib/server/writeAuditLog'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'
import { createSupabaseRouteHandlerReadOnlyClient } from '@/lib/supabase/routeHandlerClient'
import { directoryFromJsonColumn } from '@/lib/parishDirectory'

function isValidEmail(value: string): boolean {
  const s = String(value || '').trim()
  if (!s) return false
  return s.includes('@') && !/\s/.test(s)
}

type ParishSettingsComparable = {
  name: string
  default_notification_email: string | null
  staff_directory: string[]
  priest_directory: string[]
}

function parishSettingsComparable(row: {
  name?: unknown
  default_notification_email?: unknown
  staff_directory?: unknown
  priest_directory?: unknown
}): ParishSettingsComparable {
  const email = String(row.default_notification_email ?? '').trim()
  return {
    name: String(row.name ?? '').trim(),
    default_notification_email: email.length > 0 ? email : null,
    staff_directory: directoryFromJsonColumn(row.staff_directory),
    priest_directory: directoryFromJsonColumn(row.priest_directory),
  }
}

function directoryListsEqual(a: string[], b: string[]): boolean {
  const norm = (list: string[]) =>
    [...list].map((s) => s.toLowerCase()).sort().join('\u0001')
  return norm(a) === norm(b)
}

/** Field names only — no directory contents or notification email values. */
function changedParishSettingsFieldNames(
  before: ParishSettingsComparable,
  after: ParishSettingsComparable
): string[] {
  const fields: string[] = []
  if (before.name !== after.name) fields.push('name')
  if (before.default_notification_email !== after.default_notification_email) {
    fields.push('default_notification_email')
  }
  if (!directoryListsEqual(before.staff_directory, after.staff_directory)) {
    fields.push('staff_directory')
  }
  if (!directoryListsEqual(before.priest_directory, after.priest_directory)) {
    fields.push('priest_directory')
  }
  return fields
}

async function loadPrimaryParishWithGoogle(admin: ReturnType<typeof createSupabaseServiceRoleClient>) {
  const { data: parish, error: parishErr } = await admin
    .from('parishes')
    .select('id, name, default_notification_email, staff_directory, priest_directory, created_at')
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

    if (!isParishSettingsAdminEmail(user.email)) {
      return NextResponse.json(
        { ok: false, error: 'Only parish admins can update parish settings.' },
        { status: 403 }
      )
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

    const staff = directoryFromJsonColumn(
      Array.isArray(body.staff_names) ? body.staff_names : []
    )
    const priests = directoryFromJsonColumn(
      Array.isArray(body.priest_names) ? body.priest_names : []
    )

    const admin = createSupabaseServiceRoleClient()
    const { data: parish, error: parishErr } = await admin
      .from('parishes')
      .select('id, name, default_notification_email, staff_directory, priest_directory')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (parishErr || !parish?.id) {
      return NextResponse.json({ ok: false, error: 'Parish not found' }, { status: 404 })
    }

    const beforeSettings = parishSettingsComparable(parish)
    const afterSettings = parishSettingsComparable({
      name,
      default_notification_email: emailRaw || null,
      staff_directory: staff,
      priest_directory: priests,
    })

    const { error: updateErr } = await admin
      .from('parishes')
      .update({
        name,
        default_notification_email: emailRaw || null,
        staff_directory: staff,
        priest_directory: priests,
        updated_at: new Date().toISOString(),
      })
      .eq('id', parish.id)

    if (updateErr) {
      return NextResponse.json({ ok: false, error: updateErr.message }, { status: 500 })
    }

    const fields_changed = changedParishSettingsFieldNames(beforeSettings, afterSettings)
    if (fields_changed.length > 0) {
      void writeAuditLog({
        parish_id: parish.id,
        actor_email: user.email,
        action: 'parish_settings.updated',
        entity_type: 'parish',
        entity_id: parish.id,
        metadata: { fields_changed },
      })
    }

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || 'Server error' },
      { status: 500 }
    )
  }
}
