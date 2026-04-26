import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Resend } from 'resend'
import { buildDemoRequestEmail } from '@/lib/email/demoRequestEmail'

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
  try {
    const body = await request.json().catch(() => null as any)

    const name = normalizeRequiredText(body?.name)
    const parishName = normalizeRequiredText(body?.parishName)
    const email = normalizeRequiredText(body?.email)
    const roleTitle = normalizeOptionalText(body?.roleTitle)
    const message = normalizeOptionalText(body?.message)

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
      console.warn(
        '[demo-request] DEMO_REQUEST_TO_EMAIL is not set; demo requests disabled.'
      )
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
      console.warn(
        '[demo-request] RESEND_API_KEY/RESEND_FROM_EMAIL missing; cannot send demo request.'
      )
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
    console.error('[demo-request] ERROR:', error)
    return NextResponse.json(
      { ok: false, error: 'Demo requests are temporarily unavailable. Please email us directly.' },
      { status: 500 }
    )
  }
}

