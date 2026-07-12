import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Resend } from 'resend'
import { buildDemoRequestEmail } from '@/lib/email/demoRequestEmail'
import { readBoundedJsonBody } from '@/lib/server/boundedJsonBody'
import { checkDurableRateLimit } from '@/lib/server/durableRateLimit'
import {
  createDemoRequestProviderOptions,
  DEMO_REQUEST_PROVIDER_TIMEOUT_MS,
  isValidDemoRequestDeliveryAttemptId,
} from '@/lib/server/demoRequestDelivery'
import { logServerError, logServerWarning } from '@/lib/server/safeErrorLogging'
import { rejectCrossOriginMutation } from '@/lib/server/sameOriginMutation'
import { durableRateLimitKeyFromRequest } from '@/lib/server/simpleRateLimit'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'

const RATE_LIMIT = { limit: 5, windowMs: 15 * 60_000 }
const MAX_BODY_BYTES = 32 * 1024

function isValidEmail(value: string): boolean {
  const s = String(value || '').trim()
  if (!s) return false
  return s.includes('@') && !/\s/.test(s)
}

function normalizeRequiredText(value: unknown): string {
  return String(value ?? '').trim()
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
      key: durableRateLimitKeyFromRequest(request, 'demo-request'),
      ...RATE_LIMIT,
    }).catch((error: unknown) => {
      logServerError('[demo-request] rate limit check failed', error, {
        route: '/api/demo-request',
      })
      return null
    })

    if (!rateLimit) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Demo requests are temporarily unavailable. Please email us directly.',
        },
        { status: 503 }
      )
    }

    if (!rateLimit.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Too many demo requests. Please try again later.',
        },
        {
          status: 429,
          headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) },
        }
      )
    }

    const parsedBody = await readBoundedJsonBody(request, MAX_BODY_BYTES)
    if (!parsedBody.ok && parsedBody.reason === 'too_large') {
      return NextResponse.json(
        { ok: false, error: 'Demo request is too large.' },
        { status: 413 },
      )
    }

    const body = parsedBody.ok ? parsedBody.value : null

    const bodyRecord = body && typeof body === 'object' ? (body as Record<string, unknown>) : {}
    const deliveryAttemptId = normalizeRequiredText(bodyRecord.deliveryAttemptId)
    const name = normalizeRequiredText(bodyRecord.name)
    const parishName = normalizeRequiredText(bodyRecord.parishName)
    const email = normalizeRequiredText(bodyRecord.email)
    const roleTitle = normalizeOptionalText(bodyRecord.roleTitle)
    const message = normalizeOptionalText(bodyRecord.message)

    if (!isValidDemoRequestDeliveryAttemptId(deliveryAttemptId)) {
      return NextResponse.json(
        { ok: false, error: 'Please retry your demo request.' },
        { status: 400 },
      )
    }
    if (!name) {
      return NextResponse.json({ ok: false, error: 'Please enter your name.' }, { status: 400 })
    }
    if (!parishName) {
      return NextResponse.json(
        { ok: false, error: 'Please enter your parish name.' },
        { status: 400 }
      )
    }
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { ok: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      )
    }

    const to = String(process.env.DEMO_REQUEST_TO_EMAIL ?? '').trim()
    if (!to) {
      logServerWarning('[demo-request] configuration missing', {
        route: '/api/demo-request',
        setting: 'DEMO_REQUEST_TO_EMAIL',
      })
      return NextResponse.json(
        {
          ok: false,
          error:
            'Demo requests are temporarily unavailable. Please email us directly.',
        },
        { status: 503 }
      )
    }

    const apiKey = process.env.RESEND_API_KEY
    const from = process.env.RESEND_FROM_EMAIL
    if (!apiKey || !from) {
      logServerWarning('[demo-request] email provider configuration missing', {
        route: '/api/demo-request',
        hasResendApiKey: Boolean(apiKey),
        hasResendFromEmail: Boolean(from),
      })
      return NextResponse.json(
        { ok: false, error: 'Demo requests are temporarily unavailable. Please email us directly.' },
        { status: 500 }
      )
    }

    const { subject, text, html } = buildDemoRequestEmail({
      payload: { name, parishName, email, roleTitle, message },
      logoUrl: process.env.VINEA_EMAIL_LOGO_URL ?? null,
    })

    const resend = new Resend(apiKey)
    const providerOptions = createDemoRequestProviderOptions({ deliveryAttemptId })
    let providerResult: Awaited<ReturnType<typeof resend.emails.send>>
    try {
      providerResult = await resend.emails.send(
        {
          from,
          to,
          subject,
          text,
          html,
        },
        providerOptions,
      )
    } catch (error: unknown) {
      if (providerOptions.signal.aborted) {
        logServerWarning('[demo-request] provider confirmation timed out', {
          route: '/api/demo-request',
          timeoutMs: DEMO_REQUEST_PROVIDER_TIMEOUT_MS,
        })
        return NextResponse.json(
          {
            ok: false,
            error:
              'Demo requests are temporarily unavailable. Please email us directly.',
          },
          { status: 504 },
        )
      }
      throw error
    }

    const { data, error } = providerResult

    const providerMessageId = String(data?.id ?? '').trim()
    if (providerOptions.signal.aborted && !providerMessageId) {
      logServerWarning('[demo-request] provider confirmation timed out', {
        route: '/api/demo-request',
        timeoutMs: DEMO_REQUEST_PROVIDER_TIMEOUT_MS,
      })
      return NextResponse.json(
        {
          ok: false,
          error:
            'Demo requests are temporarily unavailable. Please email us directly.',
        },
        { status: 504 },
      )
    }
    if (error || !providerMessageId) {
      logServerError('[demo-request] resend send failed', error, {
        route: '/api/demo-request',
        missingProviderMessageId: !providerMessageId,
      })
      return NextResponse.json(
        {
          ok: false,
          error:
            'Demo requests are temporarily unavailable. Please email us directly.',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, id: providerMessageId })
  } catch (error: unknown) {
    logServerError('[demo-request] unexpected failure', error, {
      route: '/api/demo-request',
    })
    return NextResponse.json(
      { ok: false, error: 'Demo requests are temporarily unavailable. Please email us directly.' },
      { status: 500 }
    )
  }
}

