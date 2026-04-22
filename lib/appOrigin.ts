import type { NextRequest } from 'next/server'

/**
 * Canonical public origin for OAuth redirect_uri and post-login redirects.
 * Prefer NEXT_PUBLIC_APP_URL in production so it matches Google Cloud console exactly.
 */
export function resolveAppOrigin(request: NextRequest): string {
  const env = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (env) return env.replace(/\/$/, '')
  return request.nextUrl.origin
}
