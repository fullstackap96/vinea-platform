import { NextResponse, type NextRequest } from 'next/server'
import { createRequestPortalToken } from '@/lib/server/requestPortalTokens'
import { loadStaffScopedRequestDocumentAccess } from '@/lib/server/requestDocumentAccess'
import { requireStaffFromRequest } from '@/lib/server/requireStaff'
import { writeAuditEvent } from '@/lib/server/auditLog'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'

type RouteParams = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, context: RouteParams) {
  const staff = await requireStaffFromRequest(request)
  if (!staff.ok) return staff.response

  const { id: requestId } = await context.params
  try {
    const admin = createSupabaseServiceRoleClient()
    const access = await loadStaffScopedRequestDocumentAccess(admin, requestId)
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

    const origin = new URL(request.url).origin
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
    const message = error instanceof Error ? error.message : 'Could not create family portal link.'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
