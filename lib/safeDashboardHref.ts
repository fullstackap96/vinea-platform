const sensitiveDashboardPayloadMarkers = [
  'accesstoken',
  'refreshtoken',
  'portaltoken',
  'familytoken',
  'authtoken',
  'token',
  'secret',
  'password',
  'signedurl',
  'storagepath',
  'originalfilename',
  'rawprompt',
  'rawoutput',
  'providerpayload',
  'xamzsignature',
]

function hasSensitiveDashboardPayload(value: string): boolean {
  const normalized = value.toLowerCase().replace(/[^a-z0-9]+/g, '')
  return sensitiveDashboardPayloadMarkers.some((marker) => normalized.includes(marker))
}

export function safeDashboardHref(href: string | null | undefined): string | undefined {
  const candidate = String(href ?? '').trim()
  const lowerCandidate = candidate.toLowerCase()
  if (!candidate) return undefined
  if (candidate.startsWith('//')) return undefined
  if (candidate.includes('://')) return undefined
  if (lowerCandidate.includes('javascript:')) return undefined
  if (candidate.includes('\\')) return undefined
  if (/[\u0000-\u001F\u007F]/.test(candidate)) return undefined

  const rawPath = candidate.split(/[?#]/, 1)[0] ?? ''
  for (const segment of rawPath.split('/')) {
    let decodedSegment: string
    try {
      decodedSegment = decodeURIComponent(segment)
    } catch {
      return undefined
    }
    if (decodedSegment === '.' || decodedSegment === '..') return undefined
    if (decodedSegment.includes('\\')) return undefined
    if (/[\u0000-\u001F\u007F]/.test(decodedSegment)) return undefined
  }

  let parsed: URL
  try {
    parsed = new URL(candidate, 'https://vinea.local')
  } catch {
    return undefined
  }

  if (parsed.origin !== 'https://vinea.local') return undefined
  if (parsed.pathname !== '/dashboard' && !parsed.pathname.startsWith('/dashboard/')) {
    return undefined
  }

  for (const segment of parsed.pathname.split('/')) {
    let decodedSegment: string
    try {
      decodedSegment = decodeURIComponent(segment)
    } catch {
      return undefined
    }
    if (decodedSegment === '.' || decodedSegment === '..') return undefined
    if (decodedSegment.includes('\\')) return undefined
    if (/[\u0000-\u001F\u007F]/.test(decodedSegment)) return undefined
  }

  for (const [key, value] of parsed.searchParams.entries()) {
    if (hasSensitiveDashboardPayload(key) || hasSensitiveDashboardPayload(value)) {
      return undefined
    }
  }

  if (parsed.hash) {
    let decodedHash: string
    try {
      decodedHash = decodeURIComponent(parsed.hash.slice(1))
    } catch {
      return undefined
    }
    if (hasSensitiveDashboardPayload(decodedHash)) return undefined
  }

  return candidate
}

export function safeDashboardHrefOrFallback(
  href: string | null | undefined,
  fallback: string,
): string {
  return safeDashboardHref(href) ?? safeDashboardHref(fallback) ?? '/dashboard'
}
