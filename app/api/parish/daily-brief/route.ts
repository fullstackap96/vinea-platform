import { NextResponse, type NextRequest } from 'next/server'
import { Resend } from 'resend'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'
import { resolveAppOrigin } from '@/lib/appOrigin'
import {
  buildParishDailyBriefSubject,
  renderParishDailyBriefHtml,
  renderParishDailyBriefText,
} from '@/lib/email/parishDailyBriefEmail'
import {
  loadEnabledParishDailyBriefs,
  loadParishDailyBriefByParishId,
  type LoadedParishDailyBrief,
} from '@/lib/server/loadParishDailyBrief'
import { readBoundedJsonBody } from '@/lib/server/boundedJsonBody'
import {
  createDailyBriefProviderOptions,
  DAILY_BRIEF_PROVIDER_TIMEOUT_MS,
  isValidDailyBriefDeliveryAttemptId,
} from '@/lib/server/dailyBriefDelivery'
import { requireStaffFromRequest } from '@/lib/server/requireStaff'
import {
  ACTIVE_STAFF_PARISH_COOKIE,
  resolveActiveStaffParishContext,
} from '@/lib/server/activeStaffParishContext'
import { logServerError } from '@/lib/server/safeErrorLogging'
import { rejectCrossOriginMutation } from '@/lib/server/sameOriginMutation'

export const runtime = 'nodejs'

type StaffSupabaseClient = Parameters<typeof resolveActiveStaffParishContext>[0]

type DailyBriefErrorAction =
  | 'manual-send'
  | 'cron-list'
  | 'cron-send'
  | 'email-provider'
  | 'state-write'

const DAILY_BRIEF_SEND_ERROR = 'Daily brief send failed.'
const MAX_MANUAL_SEND_BODY_BYTES = 4 * 1024

function logDailyBriefError(
  action: DailyBriefErrorAction,
  error: unknown,
  extra: Record<string, string | number | boolean | null | undefined> = {}
) {
  logServerError(`[daily-brief] ${action} failed`, error, {
    route: '/api/parish/daily-brief',
    ...extra,
  })
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

function activeParishCookie(request: NextRequest): string | null {
  return request.cookies.get(ACTIVE_STAFF_PARISH_COOKIE)?.value ?? null
}

async function resolveDailyBriefManualSendParishContext(
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
      error: 'You are not authorized to send the daily brief for this parish.',
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
      error: 'You are not authorized to send the daily brief for this parish.',
      technicalDetail: 'Active parish cookie requires membership-backed parish authorization.',
      requestedParishId,
    }
  }

  return context
}

async function sendBriefEmail(input: {
  loaded: LoadedParishDailyBrief
  appUrl: string
  now: Date
  deliveryKind: 'manual' | 'scheduled'
  deliveryAttemptId?: string
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

  const providerOptions = createDailyBriefProviderOptions({
    parishId: input.loaded.parish.id,
    deliveryDateYmd: dateYmd(input.now),
    deliveryKind: input.deliveryKind,
    deliveryAttemptId: input.deliveryAttemptId,
  })
  let providerResult: Awaited<ReturnType<typeof resend.emails.send>>
  try {
    providerResult = await resend.emails.send(
      {
        from,
        to: input.loaded.toEmail,
        subject,
        text,
        html,
      },
      providerOptions,
    )
  } catch (error: unknown) {
    if (providerOptions.signal.aborted) {
      logDailyBriefError('email-provider', new Error('Provider confirmation timed out.'), {
        parishId: input.loaded.parish.id,
        hasRecipientEmail: true,
        timeoutMs: DAILY_BRIEF_PROVIDER_TIMEOUT_MS,
      })
      throw new Error(DAILY_BRIEF_SEND_ERROR)
    }
    throw error
  }

  const { data, error } = providerResult

  const providerMessageId = String(data?.id ?? '').trim()
  if (providerOptions.signal.aborted && !providerMessageId) {
    logDailyBriefError('email-provider', new Error('Provider confirmation timed out.'), {
      parishId: input.loaded.parish.id,
      hasRecipientEmail: true,
      timeoutMs: DAILY_BRIEF_PROVIDER_TIMEOUT_MS,
    })
    throw new Error(DAILY_BRIEF_SEND_ERROR)
  }
  if (error || !providerMessageId) {
    logDailyBriefError('email-provider', error ?? new Error('Email provider did not return a message id.'), {
      parishId: input.loaded.parish.id,
      hasRecipientEmail: Boolean(input.loaded.toEmail),
    })
    throw new Error(DAILY_BRIEF_SEND_ERROR)
  }
  return providerMessageId
}

async function recordDailyBriefState(input: {
  admin: ReturnType<typeof createSupabaseServiceRoleClient>
  parishId: string
  patch: {
    daily_ops_brief_last_sent_on?: string
    daily_ops_brief_last_error: string | null
    updated_at: string
  }
  stateKind: 'sent' | 'failed'
}): Promise<boolean> {
  try {
    const { data, error } = await input.admin
      .from('parishes')
      .update(input.patch)
      .eq('id', input.parishId)
      .select('id')
      .maybeSingle()

    if (error || !data?.id) {
      logDailyBriefError(
        'state-write',
        error ?? new Error('Daily brief state update matched no parish.'),
        { parishId: input.parishId, stateKind: input.stateKind },
      )
      return false
    }

    return true
  } catch (error: unknown) {
    logDailyBriefError('state-write', error, {
      parishId: input.parishId,
      stateKind: input.stateKind,
    })
    return false
  }
}

export async function POST(request: NextRequest) {
  const originRejection = rejectCrossOriginMutation(request)
  if (originRejection) return originRejection

  try {
    const staff = await requireStaffFromRequest(request)
    if (!staff.ok) return staff.response

    const parsedBody = await readBoundedJsonBody(request, MAX_MANUAL_SEND_BODY_BYTES)
    if (!parsedBody.ok) {
      return NextResponse.json(
        { ok: false, error: 'Invalid daily brief send request.' },
        { status: parsedBody.reason === 'too_large' ? 413 : 400 },
      )
    }
    const body =
      parsedBody.value && typeof parsedBody.value === 'object'
        ? (parsedBody.value as Record<string, unknown>)
        : {}
    const deliveryAttemptId = String(body.deliveryAttemptId ?? '').trim()
    if (!isValidDailyBriefDeliveryAttemptId(deliveryAttemptId)) {
      return NextResponse.json(
        { ok: false, error: 'Please retry the daily brief send.' },
        { status: 400 },
      )
    }

    const now = new Date()
    const admin = createSupabaseServiceRoleClient()
    const requestedParishId = activeParishCookie(request)
    const parishContext = await resolveDailyBriefManualSendParishContext(
      staff.supabase,
      requestedParishId
    )
    if (!parishContext.ok) {
      return NextResponse.json(
        { ok: false, error: parishContext.error },
        { status: 403 }
      )
    }

    const loaded = await loadParishDailyBriefByParishId(admin, parishContext.activeParishId, {
      now,
    })
    if (!loaded) {
      return NextResponse.json({ ok: false, error: 'Parish not found' }, { status: 404 })
    }
    if (!loaded.toEmail) {
      return NextResponse.json(
        { ok: false, error: 'Set a daily brief email in Parish settings first.' },
        { status: 400 }
      )
    }

    const id = await sendBriefEmail({
      loaded,
      appUrl: resolveAppOrigin(request),
      now,
      deliveryKind: 'manual',
      deliveryAttemptId,
    })
    const stateRecorded = await recordDailyBriefState({
      admin,
      parishId: loaded.parish.id,
      stateKind: 'sent',
      patch: {
        daily_ops_brief_last_sent_on: dateYmd(now),
        daily_ops_brief_last_error: null,
        updated_at: now.toISOString(),
      },
    })
    if (!stateRecorded) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Daily brief was accepted by the email provider, but Vinea could not record delivery. Check the inbox before retrying.',
        },
        { status: 500 },
      )
    }

    return NextResponse.json({ ok: true, id, to: loaded.toEmail }, { status: 200 })
  } catch (error: unknown) {
    logDailyBriefError('manual-send', error, {
      hasActiveParishCookie: Boolean(activeParishCookie(request)),
    })
    return NextResponse.json(
      { ok: false, error: 'Could not send daily brief.' },
      { status: 500 }
    )
  }
}

export const dailyBriefRouteTestInternals = {
  activeParishCookie,
  recordDailyBriefState,
  resolveDailyBriefManualSendParishContext,
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
        const id = await sendBriefEmail({
          loaded,
          appUrl: resolveAppOrigin(request),
          now,
          deliveryKind: 'scheduled',
        })
        const stateRecorded = await recordDailyBriefState({
          admin,
          parishId: loaded.parish.id,
          stateKind: 'sent',
          patch: {
            daily_ops_brief_last_sent_on: dateYmd(now),
            daily_ops_brief_last_error: null,
            updated_at: now.toISOString(),
          },
        })
        if (stateRecorded) {
          sent.push({ parishId: loaded.parish.id, to: loaded.toEmail, id })
        } else {
          failed.push({
            parishId: loaded.parish.id,
            error: 'Daily brief sent, but delivery state was not recorded.',
          })
        }
      } catch (error: unknown) {
        logDailyBriefError('cron-send', error, {
          parishId: loaded.parish.id,
          hasRecipientEmail: Boolean(loaded.toEmail),
        })
        await recordDailyBriefState({
          admin,
          parishId: loaded.parish.id,
          stateKind: 'failed',
          patch: {
            daily_ops_brief_last_error: DAILY_BRIEF_SEND_ERROR,
            updated_at: now.toISOString(),
          },
        })
        failed.push({ parishId: loaded.parish.id, error: DAILY_BRIEF_SEND_ERROR })
      }
    }

    return NextResponse.json({ ok: true, sent, failed }, { status: 200 })
  } catch (error: unknown) {
    logDailyBriefError('cron-list', error, {
      sentCount: sent.length,
      failedCount: failed.length,
    })
    return NextResponse.json(
      { ok: false, sent, failed, error: 'Daily brief cron failed.' },
      { status: 500 }
    )
  }
}
