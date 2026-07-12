import { NextResponse, type NextRequest } from 'next/server'
import { resolveAppOrigin } from '@/lib/appOrigin'
import {
  createRequestPortalToken,
  isRequestPortalTokensTableMissing,
  REQUEST_PORTAL_TOKENS_NOT_CONFIGURED_MESSAGE,
} from '@/lib/server/requestPortalTokens'
import { ACTIVE_STAFF_PARISH_COOKIE } from '@/lib/server/activeStaffParishContext'
import {
  loadStaffScopedRequestDocumentAccess,
  type StaffScopedRequestDocumentAccessOptions,
} from '@/lib/server/requestDocumentAccess'
import { requireStaffFromRequest } from '@/lib/server/requireStaff'
import { logServerError } from '@/lib/server/safeErrorLogging'
import { rejectCrossOriginMutation } from '@/lib/server/sameOriginMutation'
import { writeAuditEvent } from '@/lib/server/auditLog'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'

type RouteParams = { params: Promise<{ id: string }> }

function activeParishDocumentAccessOptions(
  request: NextRequest,
  staffSupabase: StaffScopedRequestDocumentAccessOptions['staffSupabase']
): StaffScopedRequestDocumentAccessOptions {
  const activeParishId = request.cookies.get(ACTIVE_STAFF_PARISH_COOKIE)?.value ?? null

  return {
    staffSupabase,
    activeParishId,
    allowPrimaryParishFallback: !activeParishId,
  }
}

export async function POST(request: NextRequest, context: RouteParams) {
  const originRejection = rejectCrossOriginMutation(request)
  if (originRejection) return originRejection

  const staff = await requireStaffFromRequest(request)
  if (!staff.ok) return staff.response

  const { id: requestId } = await context.params
  try {
    const admin = createSupabaseServiceRoleClient()
    const access = await loadStaffScopedRequestDocumentAccess(
      admin,
      requestId,
      activeParishDocumentAccessOptions(request, staff.supabase)
    )
    if (!access) {
      return NextResponse.json({ ok: false, error: 'Request not found.' }, { status: 404 })
    }

    const token = await createRequestPortalToken({
      admin,
      parishId: access.parishId,
      requestId: access.requestId,
      createdByUserId: staff.user.id,
      createdByEmail: staff.staff.email,
      expiresInDays: 30,
    })

    const origin = resolveAppOrigin(request)
    const url = `${origin}/family/request/${token.rawToken}`

    await writeAuditEvent({
      parishId: access.parishId,
      actorEmail: staff.staff.email,
      action: 'request.portal_token.created',
      targetType: 'request',
      targetId: access.requestId,
      metadata: {
        tokenId: token.tokenId,
        expiresAt: token.expiresAt,
        summary: 'Family document portal link created',
      },
    })

    return NextResponse.json({ ok: true, url, expiresAt: token.expiresAt })
  } catch (error: unknown) {
    if (isRequestPortalTokensTableMissing(error as { code?: string; message?: string } | null)) {
      return NextResponse.json(
        { ok: false, error: REQUEST_PORTAL_TOKENS_NOT_CONFIGURED_MESSAGE },
        { status: 503 }
      )
    }
    logServerError('[portal-token] create failed', error, {
      route: '/api/requests/[id]/portal-token',
      hasRequestId: Boolean(requestId),
      activeParishCookiePresent: Boolean(request.cookies.get(ACTIVE_STAFF_PARISH_COOKIE)?.value),
    })
    return NextResponse.json({ ok: false, error: 'Could not create family portal link.' }, { status: 500 })
  }
}
