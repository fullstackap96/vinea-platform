import type { NextRequest } from 'next/server'
import { parseExactAppOrigin } from '@/lib/exactAppOrigin'

/**
 * Canonical public origin for OAuth redirect_uri and post-login redirects.
 * Prefer NEXT_PUBLIC_APP_URL in production so it matches Google Cloud console exactly.
 */
export function resolveAppOrigin(request: NextRequest): string {
  const isVercel = process.env.VERCEL === '1'
  const configured = parseExactAppOrigin(process.env.NEXT_PUBLIC_APP_URL, {
    requireHttps: isVercel,
  })
  if (configured) return configured.origin

  for (const hostname of [
    process.env.VERCEL_URL,
    process.env.VERCEL_BRANCH_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
  ]) {
    const deployment = parseExactAppOrigin(
      hostname ? `https://${hostname}` : undefined,
      { requireHttps: true },
    )
    if (deployment) return deployment.origin
  }

  if (process.env.NODE_ENV !== 'production' && !isVercel) {
    const local = parseExactAppOrigin(request.nextUrl.origin)
    if (local) return local.origin
  }

  throw new Error('Application origin is not configured.')
}
