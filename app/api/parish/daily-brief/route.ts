import { NextResponse, type NextRequest } from 'next/server'
import { Resend } from 'resend'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'
import { createSupabaseRouteHandlerReadOnlyClient } from '@/lib/supabase/routeHandlerClient'
import { resolveAppOrigin } from '@/lib/appOrigin'
import {
  buildParishDailyBriefSubject,
  renderParishDailyBriefHtml,
  renderParishDailyBriefText,
} from '@/lib/email/parishDailyBriefEmail'
import {
  loadEnabledParishDailyBriefs,
  loadPrimaryParishDailyBrief,
  type LoadedParishDailyBrief,
} from '@/lib/server/loadParishDailyBrief'

export const runtime = 'nodejs'

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

function dateYmd(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function dateLabel(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

function requireEmailConfig() {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL
  if (!apiKey || !from) {
    throw new Error('Server email is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL.')
  }
  return { apiKey, from }
}

function cronAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET?.trim()
  if (!secret) return process.env.NODE_ENV !== 'production'
  return request.headers.get('authorization') === `Bearer ${secret}`
}

async function sendBriefEmail(input: {
  loaded: LoadedParishDailyBrief
  appUrl: string
  now: Date
}) {
  const { apiKey, from } = requireEmailConfig()
  if (!input.loaded.toEmail) {
    throw new Error('Daily brief recipient email is not configured.')
  }

  const resend = new Resend(apiKey)
  const subject = buildParishDailyBriefSubject({
    parishName: input.loaded.parish.name,
    dateLabel: dateLabel(input.now),
  })
  const text = renderParishDailyBriefText({
    parishName: input.loaded.parish.name,
    dateLabel: dateLabel(input.now),
    brief: input.loaded.brief,
    appUrl: input.appUrl,
  })
  const html = renderParishDailyBriefHtml({
    parishName: input.loaded.parish.name,
    dateLabel: dateLabel(input.now),
    brief: input.loaded.brief,
    appUrl: input.appUrl,
  })

  const { data, error } = await resend.emails.send({
    from,
    to: input.loaded.toEmail,
    subject,
    text,
    html,
  })

  if (error) throw new Error(error.message)
  return data?.id ?? null
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseRouteHandlerReadOnlyClient(request)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const admin = createSupabaseServiceRoleClient()
    const loaded = await loadPrimaryParishDailyBrief(admin, { now })
    if (!loaded) {
      return NextResponse.json({ ok: false, error: 'Parish not found' }, { status: 404 })
    }
    if (!loaded.toEmail) {
      return NextResponse.json(
        { ok: false, error: 'Set a daily brief email in Parish settings first.' },
        { status: 400 }
      )
    }

    const id = await sendBriefEmail({ loaded, appUrl: resolveAppOrigin(request), now })
    await admin
      .from('parishes')
      .update({
        daily_ops_brief_last_sent_on: dateYmd(now),
        daily_ops_brief_last_error: null,
        updated_at: now.toISOString(),
      })
      .eq('id', loaded.parish.id)

    return NextResponse.json({ ok: true, id, to: loaded.toEmail }, { status: 200 })
  } catch (error: unknown) {
    console.error('[daily-brief] manual send failed:', error)
    return NextResponse.json(
      { ok: false, error: errorMessage(error, 'Could not send daily brief.') },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  if (!cronAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const admin = createSupabaseServiceRoleClient()
  const sent: Array<{ parishId: string; to: string; id: string | null }> = []
  const failed: Array<{ parishId: string; error: string }> = []

  try {
    const loadedBriefs = await loadEnabledParishDailyBriefs(admin, {
      now,
      dateYmd: dateYmd(now),
    })

    for (const loaded of loadedBriefs) {
      try {
        const id = await sendBriefEmail({ loaded, appUrl: resolveAppOrigin(request), now })
        await admin
          .from('parishes')
          .update({
            daily_ops_brief_last_sent_on: dateYmd(now),
            daily_ops_brief_last_error: null,
            updated_at: now.toISOString(),
          })
          .eq('id', loaded.parish.id)
        sent.push({ parishId: loaded.parish.id, to: loaded.toEmail, id })
      } catch (error: unknown) {
        const message = errorMessage(error, 'Unknown send error').slice(0, 500)
        await admin
          .from('parishes')
          .update({
            daily_ops_brief_last_error: message,
            updated_at: now.toISOString(),
          })
          .eq('id', loaded.parish.id)
        failed.push({ parishId: loaded.parish.id, error: message })
      }
    }

    return NextResponse.json({ ok: true, sent, failed }, { status: 200 })
  } catch (error: unknown) {
    console.error('[daily-brief] cron failed:', error)
    return NextResponse.json(
      { ok: false, sent, failed, error: errorMessage(error, 'Daily brief cron failed.') },
      { status: 500 }
    )
  }
}
