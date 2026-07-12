import 'server-only'

import { NextResponse, type NextRequest } from 'next/server'
import { parseExactAppOrigin } from '@/lib/exactAppOrigin'

function normalizeOrigin(value: string | undefined): string | null {
  const candidate = value?.trim()
  if (!candidate) return null

  try {
    const url = new URL(candidate)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    return url.origin
  } catch {
    return null
  }
}

function normalizeBrowserOrigin(value: string | undefined): string | null {
  const candidate = value?.trim()
  if (!candidate) return null

  try {
    const url = new URL(candidate)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    if (url.username || url.password || url.pathname !== '/' || url.search || url.hash) return null
    return url.origin
  } catch {
    return null
  }
}

function allowedOrigins(request: NextRequest): Set<string> {
  const origins = new Set<string>()
  const configuredOrigin = parseExactAppOrigin(process.env.NEXT_PUBLIC_APP_URL, {
    requireHttps: process.env.VERCEL === '1',
  })
  if (configuredOrigin) origins.add(configuredOrigin.origin)

  for (const hostname of [
    process.env.VERCEL_URL,
    process.env.VERCEL_BRANCH_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
  ]) {
    const vercelOrigin = normalizeOrigin(hostname ? `https://${hostname}` : undefined)
    if (vercelOrigin) origins.add(vercelOrigin)
  }

  if (process.env.NODE_ENV !== 'production' && process.env.VERCEL !== '1') {
    const nextRequestOrigin = (request as NextRequest & { nextUrl?: URL }).nextUrl?.origin
    const requestOrigin = normalizeOrigin(nextRequestOrigin ?? request.url)
    if (requestOrigin) origins.add(requestOrigin)
  }

  return origins
}

export function rejectCrossOriginMutation(request: NextRequest): NextResponse | null {
  const fetchSite = request.headers.get('sec-fetch-site')?.trim().toLowerCase()
  if (fetchSite && fetchSite !== 'same-origin') {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 403 })
  }

  const requestOrigin = normalizeBrowserOrigin(request.headers.get('origin') ?? undefined)
  if (!requestOrigin || !allowedOrigins(request).has(requestOrigin)) {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 403 })
  }

  return null
}
