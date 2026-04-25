import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Resend } from 'resend'
import {
  buildRequestNotificationEmail,
  type RequestNotificationPayload,
} from '@/lib/email/requestNotificationEmail'

const ALLOWED_REQUEST_TYPES = new Set(['baptism', 'funeral', 'wedding', 'ocia'])

function isValidEmail(value: string): boolean {
  const s = String(value || '').trim()
  if (!s) return false
  // Basic sanity check (avoid heavy validation).
  return s.includes('@') && !/\s/.test(s)
}

function normalizeOptionalText(value: unknown): string | undefined {
  const s = String(value ?? '').trim()
  return s ? s : undefined
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null as any)
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

    const to = String(process.env.REQUEST_NOTIFICATION_TO_EMAIL ?? '').trim()
    if (!to) {
      console.warn(
        '[request-notifications] REQUEST_NOTIFICATION_TO_EMAIL is not set; skipping notification.'
      )
      return NextResponse.json({ ok: true, skipped: true })
    }

    const apiKey = process.env.RESEND_API_KEY
    const from = process.env.RESEND_FROM_EMAIL
    if (!apiKey || !from) {
      console.warn(
        '[request-notifications] RESEND_API_KEY/RESEND_FROM_EMAIL missing; cannot send notification.'
      )
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
      console.warn(
        '[request-notifications] NEXT_PUBLIC_APP_URL not set; email will include a relative dashboard link.'
      )
    }

    const resend = new Resend(apiKey)
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      text,
      html,
    })

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, id: data?.id || null })
  } catch (error: any) {
    console.error('[request-notifications] ERROR:', error)
    return NextResponse.json(
      { ok: false, error: error?.message || 'Unknown error' },
      { status: 500 }
    )
  }
}

