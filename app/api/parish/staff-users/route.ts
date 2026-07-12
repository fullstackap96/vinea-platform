import { NextResponse, type NextRequest } from 'next/server'
import {
  ACTIVE_STAFF_PARISH_COOKIE,
  resolveActiveStaffParishContext,
} from '@/lib/server/activeStaffParishContext'
import { requireStaffFromRequest } from '@/lib/server/requireStaff'
import { resolveStaffWriteParishContext } from '@/lib/server/staffWriteParishContext'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'
import { writeAuditEvent } from '@/lib/server/auditLog'
import { readBoundedJsonBody } from '@/lib/server/boundedJsonBody'
import { logServerError } from '@/lib/server/safeErrorLogging'
import { staffIsAdminForParish } from '@/lib/server/staffParishRole'
import { rejectCrossOriginMutation } from '@/lib/server/sameOriginMutation'

type AdminClient = ReturnType<typeof createSupabaseServiceRoleClient>
type StaffSupabaseClient = Parameters<typeof resolveActiveStaffParishContext>[0]

const MAX_BODY_BYTES = 16 * 1024

function normalizeEmail(value: unknown): string {
  return String(value ?? '').trim().toLowerCase()
}

function isValidEmail(value: string): boolean {
  return value.includes('@') && !/\s/.test(value)
}

function normalizeRole(value: unknown): 'admin' | 'staff' {
  return value === 'admin' ? 'admin' : 'staff'
}

function activeParishCookie(request: NextRequest): string | null {
  return request.cookies.get(ACTIVE_STAFF_PARISH_COOKIE)?.value ?? null
}

function logStaffUsersError(
  action: 'list' | 'create' | 'read-current' | 'update',
  error: unknown,
  extra: Record<string, string | number | boolean | null | undefined> = {}
) {
  logServerError(`[staff-users] ${action} failed`, error, {
    route: '/api/parish/staff-users',
    ...extra,
  })
}

async function resolveStaffManagementReadParishId(
  supabase: StaffSupabaseClient,
  requestedParishId: string | null
) {
  const context = await resolveActiveStaffParishContext(supabase, {
    requestedParishId,
  })

  if (!context.ok) return context
  if (requestedParishId && context.activeParishId !== requestedParishId) {
    return {
      ok: false as const,
      source: context.source,
      error: 'You are not authorized to read staff access for this parish.',
      technicalDetail:
        context.ignoredRequestedParishReason ??
        'Requested parish did not resolve to the active staff parish.',
      requestedParishId,
    }
  }
  if (requestedParishId && context.source !== 'membership') {
    return {
      ok: false as const,
      source: context.source,
      error: 'You are not authorized to read staff access for this parish.',
      technicalDetail: 'Active parish cookie requires membership-backed parish authorization.',
      requestedParishId,
    }
  }

  return context
}

async function activeAdminCount(
  admin: AdminClient,
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

export async function GET(request: NextRequest) {
  const staff = await requireStaffFromRequest(request)
  if (!staff.ok) return staff.response

  try {
    const admin = createSupabaseServiceRoleClient()
    const requestedParishId = activeParishCookie(request)
    const parishContext = await resolveStaffManagementReadParishId(staff.supabase, requestedParishId)
    if (!parishContext.ok) {
      return NextResponse.json({ ok: false, error: parishContext.error }, { status: 403 })
    }
    const parishId = parishContext.activeParishId

    const { data, error } = await admin
      .from('staff_users')
      .select('id, email, role, active, created_at, updated_at')
      .eq('parish_id', parishId)
      .order('active', { ascending: false })
      .order('email', { ascending: true })

    if (error) {
      logStaffUsersError('list', error, {
        hasActiveParishCookie: Boolean(requestedParishId),
      })
      return NextResponse.json({ ok: false, error: 'Could not load staff access.' }, { status: 500 })
    }

    const canManage = await staffIsAdminForParish(admin, {
      parishId,
      email: staff.staff.email,
    })

    return NextResponse.json({
      ok: true,
      canManage,
      staff: data ?? [],
    })
  } catch (error: unknown) {
    logStaffUsersError('list', error, {
      hasActiveParishCookie: Boolean(activeParishCookie(request)),
    })
    return NextResponse.json({ ok: false, error: 'Could not load staff access.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const originRejection = rejectCrossOriginMutation(request)
  if (originRejection) return originRejection

  const staff = await requireStaffFromRequest(request)
  if (!staff.ok) return staff.response

  const parsedBody = await readBoundedJsonBody(request, MAX_BODY_BYTES)
  if (!parsedBody.ok) {
    return NextResponse.json(
      {
        ok: false,
        error:
          parsedBody.reason === 'too_large'
            ? 'Staff access update is too large.'
            : 'Enter a valid staff email.',
      },
      { status: parsedBody.reason === 'too_large' ? 413 : 400 }
    )
  }

  const body = parsedBody.value as Record<string, unknown> | null
  const email = normalizeEmail(body?.email)
  const role = normalizeRole(body?.role)
  if (!isValidEmail(email)) {
    return NextResponse.json({ ok: false, error: 'Enter a valid staff email.' }, { status: 400 })
  }

  try {
    const admin = createSupabaseServiceRoleClient()
    const requestedParishId = activeParishCookie(request)
    const parishContext = await resolveStaffWriteParishContext(staff.supabase, {
      requestedParishId,
      allowPrimaryParishFallback: !requestedParishId,
      fallbackReason: 'Staff management API legacy compatibility path.',
    })
    if (!parishContext.ok) {
      return NextResponse.json({ ok: false, error: parishContext.error }, { status: 403 })
    }
    const parishId = parishContext.parishId

    const canManage = await staffIsAdminForParish(admin, {
      parishId,
      email: staff.staff.email,
    })
    if (!canManage) {
      return NextResponse.json(
        { ok: false, error: 'Only parish admins can manage staff access.' },
        { status: 403 }
      )
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
      logStaffUsersError('create', error, {
        hasActiveParishCookie: Boolean(requestedParishId),
        requestedRole: role,
      })
      return NextResponse.json({ ok: false, error: 'Could not add staff access.' }, { status: 500 })
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
  } catch (error: unknown) {
    logStaffUsersError('create', error, {
      hasActiveParishCookie: Boolean(activeParishCookie(request)),
      requestedRole: role,
    })
    return NextResponse.json({ ok: false, error: 'Could not add staff access.' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const originRejection = rejectCrossOriginMutation(request)
  if (originRejection) return originRejection

  const staff = await requireStaffFromRequest(request)
  if (!staff.ok) return staff.response

  const parsedBody = await readBoundedJsonBody(request, MAX_BODY_BYTES)
  if (!parsedBody.ok) {
    return NextResponse.json(
      {
        ok: false,
        error:
          parsedBody.reason === 'too_large'
            ? 'Staff access update is too large.'
            : 'Missing staff user id.',
      },
      { status: parsedBody.reason === 'too_large' ? 413 : 400 }
    )
  }

  const body = parsedBody.value as Record<string, unknown> | null
  const id = String(body?.id ?? '').trim()
  const role = normalizeRole(body?.role)
  const active = Boolean(body?.active)
  if (!id) {
    return NextResponse.json({ ok: false, error: 'Missing staff user id.' }, { status: 400 })
  }

  try {
    const admin = createSupabaseServiceRoleClient()
    const requestedParishId = activeParishCookie(request)
    const parishContext = await resolveStaffWriteParishContext(staff.supabase, {
      requestedParishId,
      allowPrimaryParishFallback: !requestedParishId,
      fallbackReason: 'Staff management API legacy compatibility path.',
    })
    if (!parishContext.ok) {
      return NextResponse.json({ ok: false, error: parishContext.error }, { status: 403 })
    }
    const parishId = parishContext.parishId

    const canManage = await staffIsAdminForParish(admin, {
      parishId,
      email: staff.staff.email,
    })
    if (!canManage) {
      return NextResponse.json(
        { ok: false, error: 'Only parish admins can manage staff access.' },
        { status: 403 }
      )
    }

    const { data: current, error: currentError } = await admin
      .from('staff_users')
      .select('id, email, role, active')
      .eq('parish_id', parishId)
      .eq('id', id)
      .maybeSingle()

    if (currentError) {
      logStaffUsersError('read-current', currentError, {
        hasActiveParishCookie: Boolean(requestedParishId),
        hasStaffUserId: Boolean(id),
      })
      return NextResponse.json({ ok: false, error: 'Could not update staff access.' }, { status: 500 })
    }
    if (!current) {
      return NextResponse.json({ ok: false, error: 'Staff user not found.' }, { status: 404 })
    }
    if (normalizeEmail(current.email) === normalizeEmail(staff.staff.email) && active === false) {
      return NextResponse.json(
        { ok: false, error: 'You cannot deactivate your own access.' },
        { status: 400 }
      )
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
      logStaffUsersError('update', error, {
        hasActiveParishCookie: Boolean(requestedParishId),
        hasStaffUserId: Boolean(id),
        requestedRole: role,
        requestedActive: active,
      })
      return NextResponse.json({ ok: false, error: 'Could not update staff access.' }, { status: 500 })
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
  } catch (error: unknown) {
    logStaffUsersError('update', error, {
      hasActiveParishCookie: Boolean(activeParishCookie(request)),
      hasStaffUserId: Boolean(id),
      requestedRole: role,
      requestedActive: active,
    })
    return NextResponse.json({ ok: false, error: 'Could not update staff access.' }, { status: 500 })
  }
}

export const staffUsersRouteTestInternals = {
  activeParishCookie,
  normalizeEmail,
  resolveStaffManagementReadParishId,
  staffIsAdminForParish,
}
