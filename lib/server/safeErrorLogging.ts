type SafeLogExtra = Record<string, string | number | boolean | null | undefined>

export type SafeLogError = {
  readonly name: string
  readonly message: string
}

const REDACTION_PATTERNS: readonly { readonly pattern: RegExp; readonly replacement: string }[] =
  [
    {
      pattern: /postgres(?:ql)?:\/\/[^\s"'<>]+/gi,
      replacement: '[redacted database url]',
    },
    {
      pattern: /https?:\/\/[^\s"'<>]+/gi,
      replacement: '[redacted url]',
    },
    {
      pattern:
        /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi,
      replacement: '[redacted id]',
    },
    {
      pattern: /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g,
      replacement: '[redacted jwt]',
    },
    {
      pattern: /\b(?:sk|rk|pk|sess|sbp)_[A-Za-z0-9_-]{12,}\b/g,
      replacement: '[redacted token]',
    },
    {
      pattern: /\b(?:sk|rk|pk|sess)-[A-Za-z0-9_-]{12,}\b/g,
      replacement: '[redacted token]',
    },
    {
      pattern: /\bBearer\s+[A-Za-z0-9._-]+\b/gi,
      replacement: 'Bearer [redacted token]',
    },
    {
      pattern:
        /((?:access[_-]?token|refresh[_-]?token|id[_-]?token|portal[_-]?token|family[_-]?token|auth[_-]?token|token|signed[_-]?url|signedUrl|storage[_-]?path|storagePath|original[_-]?filename|originalFilename|raw[_-]?prompt|rawPrompt|raw[_-]?output|rawOutput|provider[_-]?payload|providerPayload|x-amz-signature|x-amz-credential|x-amz-security-token|signature)\s*=\s*)[^&\s"'<>]+/gi,
      replacement: '[redacted key]=[redacted]',
    },
    {
      pattern:
        /((?:access[_-]?token|refresh[_-]?token|id[_-]?token|portal[_-]?token|family[_-]?token|auth[_-]?token|token|signed[_-]?url|signedUrl|storage[_-]?path|storagePath|original[_-]?filename|originalFilename|raw[_-]?prompt|rawPrompt|raw[_-]?output|rawOutput|provider[_-]?payload|providerPayload|x-amz-signature|x-amz-credential|x-amz-security-token|signature)%3d)[^&\s"'<>]+/gi,
      replacement: '[redacted key]%3D[redacted]',
    },
    {
      pattern:
        /("(?:access[_-]?token|refresh[_-]?token|id[_-]?token|portal[_-]?token|family[_-]?token|auth[_-]?token|token|signed[_-]?url|signedUrl|storage[_-]?path|storagePath|original[_-]?filename|originalFilename|raw[_-]?prompt|rawPrompt|raw[_-]?output|rawOutput|provider[_-]?payload|providerPayload|x-amz-signature|x-amz-credential|x-amz-security-token|signature)"\s*:\s*")[^"]*(")/gi,
      replacement: '"[redacted key]":"[redacted]"',
    },
    {
      pattern: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
      replacement: '[redacted email]',
    },
  ]

const SENSITIVE_EXTRA_KEY_PATTERN =
  /(?:token|secret|password|key|authorization|cookie|signed.?url|database.?url|db.?url|service.?role|anon.?key|email|original.?filename|storage.?path|document.?content|raw|payload|portal)/i

export function redactSensitiveLogText(value: unknown): string {
  let text = String(value ?? '')
  for (const { pattern, replacement } of REDACTION_PATTERNS) {
    text = text.replace(pattern, replacement)
  }
  return text
}

function redactSafeLogExtra(extra: SafeLogExtra): SafeLogExtra {
  return Object.fromEntries(
    Object.entries(extra).map(([key, value]) => [
      key,
      SENSITIVE_EXTRA_KEY_PATTERN.test(key) && value != null
        ? typeof value === 'string'
          ? '[redacted by key]'
          : value
        : typeof value === 'string'
          ? redactSensitiveLogText(value)
          : value,
    ]),
  )
}

export function toSafeLogError(error: unknown): SafeLogError {
  if (error instanceof Error) {
    return {
      name: redactSensitiveLogText(error.name || 'Error'),
      message: redactSensitiveLogText(error.message || 'Unexpected error'),
    }
  }

  if (typeof error === 'string') {
    return {
      name: 'NonErrorThrown',
      message: redactSensitiveLogText(error),
    }
  }

  return {
    name: 'UnknownError',
    message: 'An unexpected error occurred.',
  }
}

export function logServerError(
  context: string,
  error: unknown,
  extra: SafeLogExtra = {},
): void {
  console.error(redactSensitiveLogText(context), {
    error: toSafeLogError(error),
    ...redactSafeLogExtra(extra),
  })
}

export function logServerWarning(
  context: string,
  extra: SafeLogExtra = {},
): void {
  console.warn(redactSensitiveLogText(context), redactSafeLogExtra(extra))
}
