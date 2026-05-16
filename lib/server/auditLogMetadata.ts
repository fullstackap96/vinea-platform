const MAX_METADATA_DEPTH = 5
const MAX_METADATA_KEYS = 64
const MAX_METADATA_STRING = 500

const SENSITIVE_KEY_PATTERN =
  /token|secret|password|credential|api[_-]?key|service[_-]?role|refresh|authorization|cookie|bearer|private[_-]?key|oauth|resend|openai|supabase/i

const CONTENT_KEY_PATTERN =
  /^(body|text|html|content|message|draft|reply|email_body|note_body|communication_notes)$/i

const EMAIL_ADDRESS_KEY_PATTERN = /^(to|from|cc|bcc|recipient|recipient_email)$/i

const SUBJECT_KEY_PATTERN = /^subject$/i

const JWT_LIKE = /^eyJ[a-zA-Z0-9_-]+\./

function isSensitiveKey(key: string): boolean {
  const k = key.trim()
  if (!k) return true
  if (SENSITIVE_KEY_PATTERN.test(k)) return true
  if (CONTENT_KEY_PATTERN.test(k)) return true
  if (EMAIL_ADDRESS_KEY_PATTERN.test(k)) return true
  if (SUBJECT_KEY_PATTERN.test(k)) return true
  return false
}

function sanitizeString(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (JWT_LIKE.test(trimmed) || (trimmed.length > 200 && /^[A-Za-z0-9+/=_-]+$/.test(trimmed))) {
    return '[redacted]'
  }
  if (trimmed.length > MAX_METADATA_STRING) {
    return `${trimmed.slice(0, MAX_METADATA_STRING)}…`
  }
  return trimmed
}

function sanitizeMetadataValue(
  value: unknown,
  depth: number,
  keyBudget: { remaining: number }
): unknown {
  if (depth > MAX_METADATA_DEPTH) return '[truncated]'

  if (value === null || value === undefined) return value
  if (typeof value === 'boolean' || typeof value === 'number') return value

  if (typeof value === 'string') {
    return sanitizeString(value)
  }

  if (Array.isArray(value)) {
    return value
      .slice(0, 32)
      .map((item) => sanitizeMetadataValue(item, depth + 1, keyBudget))
  }

  if (typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      if (keyBudget.remaining <= 0) break
      if (isSensitiveKey(key)) continue
      keyBudget.remaining -= 1
      out[key] = sanitizeMetadataValue(child, depth + 1, keyBudget)
    }
    return out
  }

  return sanitizeString(String(value))
}

/** Strips sensitive keys and oversized strings before persisting to `audit_logs.metadata`. */
export function sanitizeAuditMetadata(
  metadata: Record<string, unknown> | null | undefined
): Record<string, unknown> {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return {}
  }
  const sanitized = sanitizeMetadataValue(metadata, 0, {
    remaining: MAX_METADATA_KEYS,
  })
  if (sanitized && typeof sanitized === 'object' && !Array.isArray(sanitized)) {
    return sanitized as Record<string, unknown>
  }
  return {}
}
