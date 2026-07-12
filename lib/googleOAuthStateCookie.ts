import { createHmac, randomBytes, timingSafeEqual } from 'crypto'

export const GCAL_OAUTH_STATE_COOKIE = 'gcal_oauth_state'

const COOKIE_TTL_MS = 10 * 60 * 1000

export type GoogleOAuthStateCookieMetadata = {
  parishId: string | null
}

type ParsedOAuthStateCookie = {
  state: string
  metadata: GoogleOAuthStateCookieMetadata
}

function oauthStateSigningSecret(): string {
  const dedicated = process.env.GOOGLE_OAUTH_STATE_SECRET?.trim()
  if (dedicated) return dedicated
  const fallback = process.env.GOOGLE_CLIENT_SECRET?.trim()
  if (fallback) return fallback
  throw new Error('Set GOOGLE_OAUTH_STATE_SECRET or GOOGLE_CLIENT_SECRET for OAuth state signing')
}

function normalizeParishId(value: unknown): string | null {
  const parishId = String(value ?? '').trim()
  return parishId || null
}

export function createSignedOAuthStateValue(options: {
  parishId?: unknown
} = {}): { plainState: string; cookieValue: string } {
  const plainState = randomBytes(32).toString('base64url')
  const exp = Date.now() + COOKIE_TTL_MS
  const payloadRecord: { s: string; exp: number; p?: string } = { s: plainState, exp }
  const parishId = normalizeParishId(options.parishId)
  if (parishId) payloadRecord.p = parishId
  const payload = Buffer.from(JSON.stringify(payloadRecord), 'utf8').toString('base64url')
  const sig = createHmac('sha256', oauthStateSigningSecret()).update(payload).digest('base64url')
  return { plainState, cookieValue: `${payload}.${sig}` }
}

export function verifySignedOAuthStateCookieWithMetadata(
  cookieValue: string | undefined
): ParsedOAuthStateCookie | null {
  if (!cookieValue) return null
  const dot = cookieValue.indexOf('.')
  if (dot <= 0) return null
  const payloadB64 = cookieValue.slice(0, dot)
  const sigB64 = cookieValue.slice(dot + 1)
  const expectedSig = createHmac('sha256', oauthStateSigningSecret())
    .update(payloadB64)
    .digest('base64url')
  if (sigB64.length !== expectedSig.length) return null
  if (!timingSafeEqual(Buffer.from(sigB64), Buffer.from(expectedSig))) return null

  let parsed: unknown
  try {
    parsed = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'))
  } catch {
    return null
  }
  if (!parsed || typeof parsed !== 'object') return null
  const rec = parsed as { s?: unknown; exp?: unknown; p?: unknown }
  if (typeof rec.s !== 'string' || typeof rec.exp !== 'number') return null
  if (Date.now() > rec.exp) return null
  return {
    state: rec.s,
    metadata: {
      parishId: normalizeParishId(rec.p),
    },
  }
}

export function verifySignedOAuthStateCookie(cookieValue: string | undefined): string | null {
  return verifySignedOAuthStateCookieWithMetadata(cookieValue)?.state ?? null
}

export function timingSafeStateEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  return timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

export const googleOAuthStateCookieTestInternals = {
  normalizeParishId,
}
