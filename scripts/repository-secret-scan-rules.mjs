const PLACEHOLDER_MARKERS = [
  'YOUR',
  'PASSWORD',
  'PLACEHOLDER',
  'REDACTED',
  'EXAMPLE',
  'PASTE_',
  'INSERT_',
  'NOT_AVAILABLE',
  'TEST',
  'MOCK',
  'FAKE',
  'DUMMY',
  'SAMPLE',
  'SECRET',
  'SENSITIVE',
  'PROVIDER',
]

const PATTERN_RULES = [
  {
    id: 'JWT_THREE_SEGMENT',
    pattern: /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/g,
  },
  {
    id: 'OPENAI_SECRET_KEY',
    pattern: /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/g,
  },
  {
    id: 'GOOGLE_OAUTH_CLIENT_SECRET',
    pattern: /\bGOCSPX-[A-Za-z0-9_-]{20,}\b/g,
  },
  {
    id: 'VERCEL_ACCESS_TOKEN',
    pattern: /\bvcp_[A-Za-z0-9_-]{20,}\b/g,
  },
  {
    id: 'RESEND_API_KEY',
    pattern: /\bre_[A-Za-z0-9_-]{20,}\b/g,
  },
  {
    id: 'AWS_ACCESS_KEY_ID',
    pattern: /\bAKIA[0-9A-Z]{16}\b/g,
  },
  {
    id: 'GITHUB_ACCESS_TOKEN',
    pattern: /\bgh[pousr]_[A-Za-z0-9]{30,}\b/g,
  },
]

const databaseUrlPattern =
  /postgres(?:ql)?:\/\/[^:\s/@]+:([^@\s/]+)@([^/\s:]+)(?::\d+)?\/[^\s'"`]+/gi
const privateKeyPattern = new RegExp(
  ['-----BEGIN ', '(?:RSA |EC |OPENSSH |DSA )?', 'PRIVATE KEY-----'].join(''),
  'g',
)

function lineNumberAt(text, index) {
  let line = 1
  for (let cursor = 0; cursor < index; cursor += 1) {
    if (text.charCodeAt(cursor) === 10) line += 1
  }
  return line
}

function isPlaceholder(value) {
  const normalized = String(value).trim().toUpperCase()
  return (
    normalized.length === 0 ||
    normalized.includes('<') ||
    normalized.includes('>') ||
    normalized.includes('[') ||
    normalized.includes(']') ||
    normalized.includes('*') ||
    PLACEHOLDER_MARKERS.some((marker) => normalized.includes(marker))
  )
}

export function scanTextForRepositorySecrets(text) {
  const findings = []

  for (const rule of PATTERN_RULES) {
    rule.pattern.lastIndex = 0
    for (const match of text.matchAll(rule.pattern)) {
      if (isPlaceholder(match[0])) continue
      findings.push({
        ruleId: rule.id,
        line: lineNumberAt(text, match.index ?? 0),
      })
    }
  }

  databaseUrlPattern.lastIndex = 0
  for (const match of text.matchAll(databaseUrlPattern)) {
    const host = String(match[2] ?? '').toLowerCase()
    const isReservedTestHost =
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.endsWith('.invalid') ||
      host.endsWith('.test') ||
      host.endsWith('.example') ||
      host.endsWith('.example.com') ||
      host.includes('.example.')

    if (!isPlaceholder(match[1]) && !isReservedTestHost) {
      findings.push({
        ruleId: 'DATABASE_URL_WITH_PASSWORD',
        line: lineNumberAt(text, match.index ?? 0),
      })
    }
  }

  privateKeyPattern.lastIndex = 0
  for (const match of text.matchAll(privateKeyPattern)) {
    findings.push({
      ruleId: 'PRIVATE_KEY_MATERIAL',
      line: lineNumberAt(text, match.index ?? 0),
    })
  }

  return findings.sort((left, right) =>
    left.line === right.line
      ? left.ruleId.localeCompare(right.ruleId)
      : left.line - right.line,
  )
}

export function isProbablyBinary(buffer) {
  const sample = buffer.subarray(0, Math.min(buffer.length, 8192))
  if (sample.includes(0)) return true

  let nonTextBytes = 0
  for (const byte of sample) {
    const isCommonText =
      byte === 9 || byte === 10 || byte === 13 || (byte >= 32 && byte <= 126) || byte >= 128
    if (!isCommonText) nonTextBytes += 1
  }

  return sample.length > 0 && nonTextBytes / sample.length > 0.3
}
