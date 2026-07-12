import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Resend } from 'resend'
import {
  buildRequestNotificationEmail,
  type RequestNotificationPayload,
} from '@/lib/email/requestNotificationEmail'
import { readBoundedJsonBody } from '@/lib/server/boundedJsonBody'
import { checkDurableRateLimit } from '@/lib/server/durableRateLimit'
import { logServerError, logServerWarning } from '@/lib/server/safeErrorLogging'
import { rejectCrossOriginMutation } from '@/lib/server/sameOriginMutation'
import { durableRateLimitKeyFromRequest } from '@/lib/server/simpleRateLimit'
import { verifyRequestNotificationPayload } from '@/lib/server/verifyRequestNotification'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'

const ALLOWED_REQUEST_TYPES = new Set([
  'baptism',
  'funeral',
  'wedding',
  'ocia',
  'join_parish',
])

const RATE_LIMIT = { limit: 10, windowMs: 60_000 }
const MAX_BODY_BYTES = 32 * 1024

function isValidEmail(value: string): boolean {
  const s = String(value || '').trim()
  if (!s) return false
  return s.includes('@') && !/\s/.test(s)
}

function normalizeOptionalText(value: unknown): string | undefined {
  const s = String(value ?? '').trim()
  return s ? s : undefined
}

export async function POST(request: NextRequest) {
  const originRejection = rejectCrossOriginMutation(request)
  if (originRejection) return originRejection

  try {
    const admin = createSupabaseServiceRoleClient()
    const rateLimit = await checkDurableRateLimit({
      admin,
      key: durableRateLimitKeyFromRequest(request, 'request-notifications'),
      ...RATE_LIMIT,
    }).catch((error: unknown) => {
      logServerError('[request-notifications] rate limit check failed', error, {
        route: '/api/request-notifications',
      })
      return null
    })

    if (!rateLimit) {
      return NextResponse.json(
        { ok: false, error: 'Notification could not be sent. Please try again later.' },
        { status: 503 }
      )
    }

    if (!rateLimit.ok) {
      return NextResponse.json(
        { ok: false, error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) },
        }
      )
    }

    const parsedBody = await readBoundedJsonBody(request, MAX_BODY_BYTES)
    if (!parsedBody.ok && parsedBody.reason === 'too_large') {
      return NextResponse.json(
        { ok: false, error: 'Notification request is too large.' },
        { status: 413 },
      )
    }

    const rawBody: unknown = parsedBody.ok ? parsedBody.value : null
    const body =
      rawBody && typeof rawBody === 'object'
        ? (rawBody as Record<string, unknown>)
        : null
    const requestId = String(body?.requestId ?? '').trim()
    const requestType = String(body?.requestType ?? '').trim().toLowerCase()
    const contactName = String(body?.contactName ?? '').trim()
    const contactEmail = String(body?.contactEmail ?? '').trim()
    const contactPhone = String(body?.contactPhone ?? '').trim()

    if (!requestId) {
      return NextResponse.json({ ok: false, error: 'Missing requestId' }, { status: 400 })
    }
    if (!ALLOWED_REQUEST_TYPES.has(requestType)) {
      return NextResponse.json({ ok: false, error: 'Invalid requestType' }, { status: 400 })
    }
    if (!contactName) {
      return NextResponse.json({ ok: false, error: 'Missing contactName' }, { status: 400 })
    }
    if (!isValidEmail(contactEmail)) {
      return NextResponse.json({ ok: false, error: 'Invalid contactEmail' }, { status: 400 })
    }
    if (!contactPhone) {
      return NextResponse.json({ ok: false, error: 'Missing contactPhone' }, { status: 400 })
    }

    const verification = await verifyRequestNotificationPayload({
      requestId,
      requestType,
      contactName,
      contactEmail,
      contactPhone,
    })
    if (!verification.ok) {
      return NextResponse.json(
        { ok: false, error: verification.error },
        { status: verification.status }
      )
    }

    let to = String(process.env.REQUEST_NOTIFICATION_TO_EMAIL ?? '').trim()
    if (!to) {
      try {
        const { data: parish } = await admin
          .from('parishes')
          .select('default_notification_email')
          .eq('id', verification.parishId)
          .maybeSingle()
        const fromDb = String(parish?.default_notification_email ?? '').trim()
        if (fromDb && isValidEmail(fromDb)) {
          to = fromDb
        }
      } catch {
        /* ignore */
      }
    }
    if (!to) {
      logServerWarning('[request-notifications] notification inbox missing', {
        route: '/api/request-notifications',
        hasEnvNotificationEmail: Boolean(process.env.REQUEST_NOTIFICATION_TO_EMAIL),
      })
      return NextResponse.json({ ok: true, skipped: true })
    }

    const apiKey = process.env.RESEND_API_KEY
    const from = process.env.RESEND_FROM_EMAIL
    if (!apiKey || !from) {
      logServerWarning('[request-notifications] email provider configuration missing', {
        route: '/api/request-notifications',
        hasResendApiKey: Boolean(apiKey),
        hasResendFromEmail: Boolean(from),
      })
      return NextResponse.json(
        { ok: false, error: 'Server email not configured' },
        { status: 500 }
      )
    }

    const payload: RequestNotificationPayload = {
      requestId,
      requestType: requestType as RequestNotificationPayload['requestType'],
      contactName,
      contactEmail,
      contactPhone,
      childName: normalizeOptionalText(body?.childName),
      notes: normalizeOptionalText(body?.notes),
      requestSpecificSummary: normalizeOptionalText(body?.requestSpecificSummary),
    }

    const { subject, text, html, dashboardUrl } = buildRequestNotificationEmail({
      payload,
      appBaseUrl: process.env.NEXT_PUBLIC_APP_URL ?? null,
      logoUrl: process.env.VINEA_EMAIL_LOGO_URL ?? null,
    })

    if (!dashboardUrl) {
      logServerWarning('[request-notifications] app URL configuration missing', {
        route: '/api/request-notifications',
        setting: 'NEXT_PUBLIC_APP_URL',
      })
    }

    const resend = new Resend(apiKey)
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      text,
      html,
    })

    const providerMessageId = String(data?.id ?? '').trim()
    if (error || !providerMessageId) {
      logServerError('[request-notifications] resend send failed', error ?? new Error('Email provider did not return a message id.'), {
        route: '/api/request-notifications',
      })
      return NextResponse.json(
        { ok: false, error: 'Notification could not be sent. Please try again later.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, id: providerMessageId })
  } catch (error: unknown) {
    logServerError('[request-notifications] unexpected failure', error, {
      route: '/api/request-notifications',
    })
    return NextResponse.json(
      { ok: false, error: 'Could not send notification.' },
      { status: 500 }
    )
  }
}
