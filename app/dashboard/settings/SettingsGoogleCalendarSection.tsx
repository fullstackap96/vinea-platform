'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { primaryButtonMd, secondaryButtonMd } from '@/lib/buttonStyles'
import { chipBase } from '@/lib/chipStyles'

export type ParishGoogleIntegrationSnapshot = {
  status: string | null
  last_error: string | null
  google_account_email: string | null
}

type ParishGoogleCalendarUiState = 'connected' | 'disconnected' | 'error'

const badgeConnected = `${chipBase} bg-green-50 text-green-900 border border-green-200`
const badgeError = `${chipBase} bg-red-50 text-red-900 border border-red-200`
const badgeDisconnected = `${chipBase} bg-gray-100 text-gray-700 border border-gray-200`

function resolveGoogleCalendarUiState(
  integration: ParishGoogleIntegrationSnapshot | null
): ParishGoogleCalendarUiState {
  if (!integration) return 'disconnected'
  const s = integration.status?.trim()
  if (s === 'connected') return 'connected'
  if (s === 'error') return 'error'
  return 'disconnected'
}

function resolveBadge(uiState: ParishGoogleCalendarUiState): { label: string; className: string } {
  if (uiState === 'connected') {
    return { label: 'Connected', className: badgeConnected }
  }
  if (uiState === 'error') {
    return { label: 'Error', className: badgeError }
  }
  return { label: 'Disconnected', className: badgeDisconnected }
}

function OAuthFlashMessages() {
  const searchParams = useSearchParams()
  const gcal = searchParams.get('gcal')

  return (
    <>
      {gcal === 'connected' && (
        <p
          className="text-sm text-green-800 bg-green-50 border border-green-200 rounded-md px-3 py-2 mb-4"
          role="status"
        >
          Google Calendar is connected for this parish.
        </p>
      )}
      {gcal === 'error' && (
        <p
          className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-4"
          role="alert"
        >
          Google Calendar connection failed. Try again, or check server logs if the problem
          persists.
        </p>
      )}
    </>
  )
}

export function SettingsGoogleCalendarSection({
  integration,
}: {
  integration: ParishGoogleIntegrationSnapshot | null
}) {
  const uiState = resolveGoogleCalendarUiState(integration)
  const badge = resolveBadge(uiState)
  const lastError = integration?.last_error?.trim()

  const primaryHref = '/api/google/oauth/start'
  const primaryLabel =
    uiState === 'disconnected' ? 'Connect Google Calendar' : 'Reconnect Google Calendar'

  return (
    <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4 mb-2">
        <h2 className="text-base font-semibold text-gray-900">Google Calendar</h2>
        <span className={`${badge.className} shrink-0 self-start`}>{badge.label}</span>
      </div>
      <p className="text-sm text-gray-600 mt-2 mb-4">
        Connect the parish Google account used to create and update calendar events from the
        dashboard.
      </p>

      <Suspense fallback={null}>
        <OAuthFlashMessages />
      </Suspense>

      {uiState === 'error' ? (
        <div className="mb-4 space-y-2">
          <p
            className="text-sm text-amber-950 bg-amber-50 border border-amber-200 rounded-md px-3 py-2.5"
            role="alert"
          >
            The Google Calendar connection needs attention—often because access expired or was
            revoked in Google. Use <span className="font-medium">Reconnect</span> below to sign in
            again.
          </p>
          {lastError ? (
            <p className="text-xs text-red-800 bg-red-50/70 border border-red-200 rounded-md px-3 py-2 font-mono leading-snug break-words">
              {lastError}
            </p>
          ) : null}
        </div>
      ) : null}

      {uiState === 'connected' ? (
        <p className="text-xs text-gray-600 mb-4">
          Connected to:{' '}
          <span className="font-medium text-gray-900">
            {integration?.google_account_email?.trim() || 'Google account'}
          </span>
        </p>
      ) : null}

      <div className="flex flex-col sm:flex-row gap-3">
        <a href={primaryHref} className={`${primaryButtonMd} text-center`}>
          {primaryLabel}
        </a>
        <Link href="/dashboard" className={`${secondaryButtonMd} text-center`}>
          Back to dashboard
        </Link>
      </div>
    </section>
  )
}
