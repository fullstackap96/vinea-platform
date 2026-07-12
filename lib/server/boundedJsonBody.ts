import 'server-only'

export type BoundedJsonBodyResult =
  | { ok: true; value: unknown }
  | { ok: false; reason: 'invalid_json' | 'too_large' }

function declaredBodySize(request: Request): number | null {
  const header = request.headers.get('content-length')?.trim()
  if (!header || !/^\d+$/.test(header)) return null

  const value = Number(header)
  return Number.isFinite(value) ? value : null
}

export async function readBoundedJsonBody(
  request: Request,
  maxBytes: number,
): Promise<BoundedJsonBodyResult> {
  if (!Number.isSafeInteger(maxBytes) || maxBytes <= 0) {
    throw new RangeError('maxBytes must be a positive safe integer')
  }

  const declaredSize = declaredBodySize(request)
  if (declaredSize !== null && declaredSize > maxBytes) {
    return { ok: false, reason: 'too_large' }
  }

  if (!request.body) {
    return { ok: false, reason: 'invalid_json' }
  }

  const reader = request.body.getReader()
  const decoder = new TextDecoder()
  let totalBytes = 0
  let text = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (!value) continue

      totalBytes += value.byteLength
      if (totalBytes > maxBytes) {
        await reader.cancel().catch(() => undefined)
        return { ok: false, reason: 'too_large' }
      }

      text += decoder.decode(value, { stream: true })
    }

    text += decoder.decode()
    return { ok: true, value: JSON.parse(text) as unknown }
  } catch {
    return { ok: false, reason: 'invalid_json' }
  }
}
