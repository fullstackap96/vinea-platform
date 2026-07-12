import { parseExactAppOrigin } from '@/lib/exactAppOrigin'

export const ACTIVE_PARISH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 180

function configuredAppOriginProtocol(): string | null {
  return parseExactAppOrigin(process.env.NEXT_PUBLIC_APP_URL)?.protocol ?? null
}

export function shouldUseSecureActiveParishCookie(): boolean {
  if (process.env.NODE_ENV !== 'production') return false

  const configuredProtocol = configuredAppOriginProtocol()
  if (configuredProtocol) return configuredProtocol === 'https:'

  return true
}

export function normalizeRequestedParishId(value: unknown): string | null {
  const id = String(value ?? '').trim()
  return id || null
}

export function activeParishCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: shouldUseSecureActiveParishCookie(),
    path: '/',
    maxAge: ACTIVE_PARISH_COOKIE_MAX_AGE_SECONDS,
  }
}
