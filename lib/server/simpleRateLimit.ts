import 'server-only'

type RateLimitEntry = {
  count: number
  windowStartedAt: number
}

const buckets = new Map<string, RateLimitEntry>()

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSeconds: number }

/**
 * Basic in-memory rate limiter (per server instance).
 * Suitable for low-volume abuse protection on single-route handlers.
 */
export function checkRateLimit(
  key: string,
  options: { limit: number; windowMs: number }
): RateLimitResult {
  const now = Date.now()
  const existing = buckets.get(key)

  if (!existing || now - existing.windowStartedAt >= options.windowMs) {
    buckets.set(key, { count: 1, windowStartedAt: now })
    return { ok: true }
  }

  if (existing.count >= options.limit) {
    const retryAfterMs = options.windowMs - (now - existing.windowStartedAt)
    return {
      ok: false,
      retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    }
  }

  existing.count += 1
  buckets.set(key, existing)
  return { ok: true }
}

export function clientIpFromRequest(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  const realIp = request.headers.get('x-real-ip')?.trim()
  if (realIp) return realIp
  return 'unknown'
}
