import { NextResponse, type NextRequest } from 'next/server'
import { requireStaffFromRequest } from '@/lib/server/requireStaff'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'
import { writeAuditEvent } from '@/lib/server/auditLog'

export const runtime = 'nodejs'

function text(value: unknown, max = 500): string {
  return String(value ?? '').trim().slice(0, max)
}

function clampLimit(value: unknown): number {
  const n = Number(value)
  if (!Number.isFinite(n)) return 50
  return Math.max(1, Math.min(100, Math.round(n)))
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

export async function GET(request: NextRequest) {
  const staff = await requireStaffFromRequest(request)
  if (!staff.ok) return staff.response

  const url = new URL(request.url)
  const targetType = text(url.searchParams.get('targetType'), 80)
  const targetId = text(url.searchParams.get('targetId'), 120)
  const actionPrefix = text(url.searchParams.get('actionPrefix'), 120)
  const limit = clampLimit(url.searchParams.get('limit'))

  if ((!targetType || !targetId) && staff.staff.role !== 'admin') {
    return NextResponse.json(
      { ok: false, error: 'Only parish admins can view the full audit log.' },
      { status: 403 }
    )
  }

  const admin = createSupabaseServiceRoleClient()
  const parishId = await primaryParishId(admin)
  if (!parishId) {
    return NextResponse.json({ ok: false, error: 'Parish is not configured.' }, { status: 404 })
  }

  let query = admin
    .from('audit_events')
    .select('id, parish_id, actor_email, action, target_type, target_id, metadata, created_at')
    .eq('parish_id', parishId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (targetType && targetId) {
    query = query.eq('target_type', targetType).eq('target_id', targetId)
  }
  if (actionPrefix) {
    query = query.like('action', `${actionPrefix}%`)
  }

  const { data, error } = await query
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    canViewAll: staff.staff.role === 'admin',
    events: data ?? [],
  })
}

export async function POST(request: NextRequest) {
  const staff = await requireStaffFromRequest(request)
  if (!staff.ok) return staff.response

  const body = await request.json().catch(() => null as Record<string, unknown> | null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 })
  }

  const action = text(body.action, 120)
  const targetType = text(body.targetType, 80)
  const targetId = text(body.targetId, 120)
  const metadata =
    body.metadata && typeof body.metadata === 'object' && !Array.isArray(body.metadata)
      ? (body.metadata as Record<string, unknown>)
      : {}

  if (!action || !targetType || !targetId) {
    return NextResponse.json(
      { ok: false, error: 'Missing action, target type, or target id.' },
      { status: 400 }
    )
  }
  if (targetType !== 'request' && staff.staff.role !== 'admin') {
    return NextResponse.json(
      { ok: false, error: 'Only parish admins can write non-request audit events.' },
      { status: 403 }
    )
  }

  const admin = createSupabaseServiceRoleClient()
  const parishId = await primaryParishId(admin)
  if (!parishId) {
    return NextResponse.json({ ok: false, error: 'Parish is not configured.' }, { status: 404 })
  }

  await writeAuditEvent({
    parishId,
    actorEmail: staff.staff.email,
    action,
    targetType,
    targetId,
    metadata,
  })

  return NextResponse.json({ ok: true }, { status: 201 })
}
