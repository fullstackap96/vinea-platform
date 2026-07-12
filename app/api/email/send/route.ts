import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServerClient } from '@supabase/ssr'
import type { NextRequest } from 'next/server'
import { ACTIVE_STAFF_PARISH_COOKIE } from '@/lib/server/activeStaffParishContext'
import { writeAuditEvent } from '@/lib/server/auditLog'
import { readBoundedJsonBody } from '@/lib/server/boundedJsonBody'
import { loadStaffScopedRequestDetailAccess } from '@/lib/server/requestDetailAccess'
import { loadStoredRequestEmailRecipient } from '@/lib/server/requestEmailRecipient'
import { authorizeStaffUser } from '@/lib/server/requireStaff'
import { logServerError } from '@/lib/server/safeErrorLogging'
import { rejectCrossOriginMutation } from '@/lib/server/sameOriginMutation'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'

const MAX_BODY_BYTES = 128 * 1024

function getSupabaseServerClient(request: NextRequest, response: NextResponse) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })
}

/**
 * Some reply drafts (e.g. from the AI) start with a "Subject: ..." line even though
 * the real subject is sent via the email header. Remove that first line so it is not
 * duplicated in the body.
 */
function stripLeadingSubjectLineFromPlainText(text: string): string {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/)
  if (lines.length === 0) return text.trim()
  if (/^\s*Subject:\s*.+\s*$/i.test(lines[0])) {
    lines.shift()
    if (lines.length > 0 && lines[0].trim() === '') {
      lines.shift()
    }
    return lines.join('\n').trim()
  }
  return text.trim()
}

export async function POST(request: NextRequest) {
  const originRejection = rejectCrossOriginMutation(request)
  if (originRejection) return originRejection

  const response = NextResponse.json({ ok: false })
  try {
    const supabase = getSupabaseServerClient(request, response)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }
    const staff = await authorizeStaffUser(user)
    if (!staff.ok) {
      return NextResponse.json({ ok: false, error: staff.error }, { status: 403 })
    }

    const parsedBody = await readBoundedJsonBody(request, MAX_BODY_BYTES)
    if (!parsedBody.ok) {
      if (parsedBody.reason === 'too_large') {
        return NextResponse.json(
          { ok: false, error: 'Email content is too large.' },
          { status: 413 },
        )
      }

      return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 })
    }

    const rawBody: unknown = parsedBody.value
    const body =
      rawBody && typeof rawBody === 'object'
        ? (rawBody as Record<string, unknown>)
        : {}
    const requestId = String(body?.requestId || '').trim()
    const subject = String(body?.subject || '').trim()
    let text = String(body?.text || '').trim()
    text = stripLeadingSubjectLineFromPlainText(text)

    if (!requestId || !subject || !text) {
      return NextResponse.json(
        { ok: false, error: 'Missing requestId, subject, or text' },
        { status: 400 }
      )
    }

    const activeParishId = request.cookies.get(ACTIVE_STAFF_PARISH_COOKIE)?.value ?? null
    const admin = createSupabaseServiceRoleClient()
    const access = await loadStaffScopedRequestDetailAccess(admin, requestId, {
      staffSupabase: supabase,
      activeParishId,
      allowPrimaryParishFallback: !activeParishId,
    })

    if (!access) {
      return NextResponse.json({ ok: false, error: 'Request not found.' }, { status: 404 })
    }

    const recipient = await loadStoredRequestEmailRecipient(admin, access)
    if (!recipient) {
      return NextResponse.json(
        { ok: false, error: 'Recipient email is unavailable.' },
        { status: 400 },
      )
    }

    const apiKey = process.env.RESEND_API_KEY
    const from = process.env.RESEND_FROM_EMAIL

    if (!apiKey || !from) {
      return NextResponse.json(
        { ok: false, error: 'Server email not configured' },
        { status: 500 }
      )
    }

    const resend = new Resend(apiKey)
    const { data, error } = await resend.emails.send({
      from,
      to: recipient.email,
      subject,
      text,
    })

    const providerMessageId = String(data?.id ?? '').trim()
    if (error || !providerMessageId) {
      logServerError('[email/send] resend send failed', error ?? new Error('Email provider did not return a message id.'), {
        route: '/api/email/send',
      })
      return NextResponse.json(
        { ok: false, error: 'Email could not be sent. Please try again later.' },
        { status: 500 },
      )
    }

    await writeAuditEvent({
      parishId: access.parishId,
      actorEmail: staff.email,
      action: 'request.email.sent',
      targetType: 'request',
      targetId: access.requestId,
      metadata: {
        source: 'staff_email_send',
        recipientSource: 'stored_request_parishioner',
        subjectLength: subject.length,
        bodyLength: text.length,
      },
    })

    return NextResponse.json({ ok: true, id: providerMessageId })
  } catch (error: unknown) {
    logServerError('[email/send] unexpected failure', error, {
      route: '/api/email/send',
    })
    return NextResponse.json(
      { ok: false, error: 'Could not send email.' },
      { status: 500 }
    )
  }
}

