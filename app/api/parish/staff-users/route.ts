import { NextResponse, type NextRequest } from 'next/server'
import { requireStaffFromRequest } from '@/lib/server/requireStaff'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'
import { writeAuditEvent } from '@/lib/server/auditLog'

function normalizeEmail(value: unknown): string {
  return String(value ?? '').trim().toLowerCase()
}

function isValidEmail(value: string): boolean {
  return value.includes('@') && !/\s/.test(value)
}

function normalizeRole(value: unknown): 'admin' | 'staff' {
  return value === 'admin' ? 'admin' : 'staff'
}

async function primaryParishId(admin: ReturnType<typeof createSupabaseServiceRoleClient>) {
  const { data, error } = await admin
    .from('parishes')
    .select('id')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data?.id ? String(data.id) : null
}

async function activeAdminCount(
  admin: ReturnType<typeof createSupabaseServiceRoleClient>,
  parishId: string
) {
  const { count, error } = await admin
    .from('staff_users')
    .select('id', { count: 'exact', head: true })
    .eq('parish_id', parishId)
    .eq('role', 'admin')
    .eq('active', true)

  if (error) throw error
  return count ?? 0
}

function adminOnly(staff: Awaited<ReturnType<typeof requireStaffFromRequest>>) {
  return staff.ok && staff.staff.role === 'admin'
}

export async function GET(request: NextRequest) {
  const staff = await requireStaffFromRequest(request)
  if (!staff.ok) return staff.response

  const admin = createSupabaseServiceRoleClient()
  const parishId = await primaryParishId(admin)
  if (!parishId) {
    return NextResponse.json({ ok: false, error: 'Parish is not configured.' }, { status: 404 })
  }

  const { data, error } = await admin
    .from('staff_users')
    .select('id, email, role, active, created_at, updated_at')
    .eq('parish_id', parishId)
    .order('active', { ascending: false })
    .order('email', { ascending: true })

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    canManage: staff.staff.role === 'admin',
    staff: data ?? [],
  })
}

export async function POST(request: NextRequest) {
  const staff = await requireStaffFromRequest(request)
  if (!staff.ok) return staff.response
  if (!adminOnly(staff)) {
    return NextResponse.json({ ok: false, error: 'Only parish admins can manage staff access.' }, { status: 403 })
  }

  const body = await request.json().catch(() => null as Record<string, unknown> | null)
  const email = normalizeEmail(body?.email)
  const role = normalizeRole(body?.role)
  if (!isValidEmail(email)) {
    return NextResponse.json({ ok: false, error: 'Enter a valid staff email.' }, { status: 400 })
  }

  const admin = createSupabaseServiceRoleClient()
  const parishId = await primaryParishId(admin)
  if (!parishId) {
    return NextResponse.json({ ok: false, error: 'Parish is not configured.' }, { status: 404 })
  }

  const { data, error } = await admin
    .from('staff_users')
    .upsert(
      {
        parish_id: parishId,
        email,
        role,
        active: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'parish_id,email' }
    )
    .select('id, email, role, active, created_at, updated_at')
    .single()

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  await writeAuditEvent({
    parishId,
    actorEmail: staff.staff.email,
    action: 'staff_user.upserted',
    targetType: 'staff_user',
    targetId: String(data.id),
    metadata: { email, role },
  })

  return NextResponse.json({ ok: true, staff: data }, { status: 201 })
}

export async function PATCH(request: NextRequest) {
  const staff = await requireStaffFromRequest(request)
  if (!staff.ok) return staff.response
  if (!adminOnly(staff)) {
    return NextResponse.json({ ok: false, error: 'Only parish admins can manage staff access.' }, { status: 403 })
  }

  const body = await request.json().catch(() => null as Record<string, unknown> | null)
  const id = String(body?.id ?? '').trim()
  const role = normalizeRole(body?.role)
  const active = Boolean(body?.active)
  if (!id) {
    return NextResponse.json({ ok: false, error: 'Missing staff user id.' }, { status: 400 })
  }

  const admin = createSupabaseServiceRoleClient()
  const parishId = await primaryParishId(admin)
  if (!parishId) {
    return NextResponse.json({ ok: false, error: 'Parish is not configured.' }, { status: 404 })
  }

  const { data: current, error: currentError } = await admin
    .from('staff_users')
    .select('id, email, role, active')
    .eq('parish_id', parishId)
    .eq('id', id)
    .maybeSingle()

  if (currentError) {
    return NextResponse.json({ ok: false, error: currentError.message }, { status: 500 })
  }
  if (!current) {
    return NextResponse.json({ ok: false, error: 'Staff user not found.' }, { status: 404 })
  }
  if (normalizeEmail(current.email) === staff.staff.email && active === false) {
    return NextResponse.json({ ok: false, error: 'You cannot deactivate your own access.' }, { status: 400 })
  }
  if (current.role === 'admin' && (role !== 'admin' || active === false)) {
    const admins = await activeAdminCount(admin, parishId)
    if (admins <= 1) {
      return NextResponse.json(
        { ok: false, error: 'Add another admin before removing this admin access.' },
        { status: 400 }
      )
    }
  }

  const { data, error } = await admin
    .from('staff_users')
    .update({ role, active, updated_at: new Date().toISOString() })
    .eq('parish_id', parishId)
    .eq('id', id)
    .select('id, email, role, active, created_at, updated_at')
    .single()

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  await writeAuditEvent({
    parishId,
    actorEmail: staff.staff.email,
    action: 'staff_user.updated',
    targetType: 'staff_user',
    targetId: id,
    metadata: {
      email: current.email,
      previousRole: current.role,
      role,
      previousActive: current.active,
      active,
    },
  })

  return NextResponse.json({ ok: true, staff: data })
}
