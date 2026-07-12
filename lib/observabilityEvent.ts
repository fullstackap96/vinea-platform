export type ObservabilitySeverity = 'info' | 'warning' | 'error' | 'critical'

export type ObservabilityCategory =
  | 'authentication'
  | 'authorization'
  | 'database'
  | 'public_intake'
  | 'request_workflow'
  | 'document_portal'
  | 'family_portal'
  | 'export'
  | 'ai'
  | 'google_calendar'
  | 'email'
  | 'storage'
  | 'health_check'
  | 'unknown'

export type ObservabilityOwner =
  | 'engineering'
  | 'security_data'
  | 'integration_owner'
  | 'parish_success'
  | 'product_support'

export type ObservabilityCustomerImpact =
  | 'none_known'
  | 'staff_workflow'
  | 'family_portal'
  | 'data_privacy'
  | 'integration'
  | 'unknown'

type SafeTagValue = string | number | boolean | null | undefined

export type BuildObservabilityEventInput = {
  message: string
  category?: ObservabilityCategory
  severity?: ObservabilitySeverity
  route?: string | null
  operation?: string | null
  activeParishLabel?: string | null
  targetType?: string | null
  safeTags?: Record<string, SafeTagValue>
  context?: Record<string, unknown>
  customerImpact?: ObservabilityCustomerImpact
}

export type RedactionResult = {
  text: string
  redactedKinds: string[]
}

export type VineaObservabilityEvent = {
  eventName: 'vinea.observability'
  severity: ObservabilitySeverity
  category: ObservabilityCategory
  safeMessage: string
  route?: string
  operation?: string
  targetType?: string
  activeParishLabel?: string
  safeTags: Record<string, string>
  safeContext: Record<string, string>
  customerImpact: ObservabilityCustomerImpact
  recommendedOwner: ObservabilityOwner
  redaction: {
    redacted: true
    redactedKinds: string[]
    rawMessageStored: false
    rawContextStored: false
    rawPromptStored: false
    rawOutputStored: false
    providerPayloadStored: false
    tokenMaterialStored: false
    signedUrlStored: false
    storagePathStored: false
    documentPayloadStored: false
    rawExportStored: false
    originalFilenameStored: false
    familyPortalTokenStored: false
  }
  monitoringSafety: {
    externalDeliveryApproved: false
    customerCommunicationAllowed: false
    requiresIncidentCommanderApproval: boolean
    requiresLegalDataOwnerApproval: boolean
    forbiddenPayloadCheckRequired: true
    rollbackByDisablingFlags: true
  }
  productionBoundaries: string[]
}

const SENSITIVE_QUERY_KEYS =
  '(token|code|access_token|refresh_token|password|apikey|api_key|service_role|anon_key)'

const REDACTION_PATTERNS: Array<{
  kind: string
  pattern: RegExp
  replacement: string
}> = [
  {
    kind: 'database_url',
    pattern: /\bpostgres(?:ql)?:\/\/[^\s"'<>]+/gi,
    replacement: '[database-url]',
  },
  {
    kind: 'jwt_or_api_token',
    pattern: /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g,
    replacement: '[token]',
  },
  {
    kind: 'api_token',
    pattern: /\b(?:sk|rk|pk|sess|sbp)_[A-Za-z0-9_-]{12,}\b/g,
    replacement: '[token]',
  },
  {
    kind: 'api_token',
    pattern: /\b(?:sk|rk|pk|sess)-[A-Za-z0-9_-]{12,}\b/g,
    replacement: '[token]',
  },
  {
    kind: 'bearer_token',
    pattern: /\bBearer\s+[A-Za-z0-9._-]+\b/gi,
    replacement: 'Bearer [token]',
  },
  {
    kind: 'email',
    pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
    replacement: '[email]',
  },
  {
    kind: 'uuid',
    pattern:
      /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi,
    replacement: '[id]',
  },
  {
    kind: 'storage_path',
    pattern:
      /\b(?:request-documents|family-documents|documents|portal-documents|private)\/[^\s"'<>]+/gi,
    replacement: '[storage-path]',
  },
  {
    kind: 'sensitive_key_value',
    pattern:
      /((?:access[_-]?token|refresh[_-]?token|id[_-]?token|portal[_-]?token|family[_-]?token|auth[_-]?token|token|signed[_-]?url|signedUrl|storage[_-]?path|storagePath|original[_-]?filename|originalFilename|raw[_-]?prompt|rawPrompt|raw[_-]?output|rawOutput|provider[_-]?payload|providerPayload|x-amz-signature|x-amz-credential|x-amz-security-token|signature)\s*=\s*)[^&\s"'<>]+/gi,
    replacement: '[sensitive-key]=[redacted]',
  },
  {
    kind: 'sensitive_key_value',
    pattern:
      /((?:access[_-]?token|refresh[_-]?token|id[_-]?token|portal[_-]?token|family[_-]?token|auth[_-]?token|token|signed[_-]?url|signedUrl|storage[_-]?path|storagePath|original[_-]?filename|originalFilename|raw[_-]?prompt|rawPrompt|raw[_-]?output|rawOutput|provider[_-]?payload|providerPayload|x-amz-signature|x-amz-credential|x-amz-security-token|signature)%3d)[^&\s"'<>]+/gi,
    replacement: '[sensitive-key]%3D[redacted]',
  },
  {
    kind: 'sensitive_key_value',
    pattern:
      /("(?:access[_-]?token|refresh[_-]?token|id[_-]?token|portal[_-]?token|family[_-]?token|auth[_-]?token|token|signed[_-]?url|signedUrl|storage[_-]?path|storagePath|original[_-]?filename|originalFilename|raw[_-]?prompt|rawPrompt|raw[_-]?output|rawOutput|provider[_-]?payload|providerPayload|x-amz-signature|x-amz-credential|x-amz-security-token|signature)"\s*:\s*")[^"]*(")/gi,
    replacement: '"[sensitive-key]":"[redacted]"',
  },
  {
    kind: 'sensitive_literal',
    pattern:
      /\b(?=[A-Za-z0-9._-]*(?:password|secret|credential|cookie|token|oauth-code|service-role-key))[A-Za-z0-9._-]*[-_][A-Za-z0-9._-]*\b(?!\s*(?:=|%3d))/gi,
    replacement: '[sensitive-value]',
  },
]

const SENSITIVE_QUERY_PATTERN = new RegExp(
  `([?&]${SENSITIVE_QUERY_KEYS}=)[^&#\\s]+`,
  'gi',
)

const MAX_SAFE_VALUE_LENGTH = 240
const MAX_CONTEXT_KEYS = 20
const FORBIDDEN_SAFE_EVENT_TEXT_MARKERS = [
  'postgres://',
  'postgresql://',
  'eyJ',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'OPENAI_API_KEY',
  'GOOGLE_CLIENT_SECRET',
  'RESEND_API_KEY',
  'createSignedUrl(',
  'rawPrompt',
  'rawOutput',
  'rawExport',
  'providerPayload',
  'documentContent',
  'originalFilename',
  'familyPortalToken',
] as const

export function redactObservabilityText(value: unknown): RedactionResult {
  let text = stringifyUnknown(value)
  const redactedKinds = new Set<string>()

  text = text.replace(SENSITIVE_QUERY_PATTERN, (match, prefix: string) => {
    redactedKinds.add('sensitive_query')
    return `${prefix}[redacted]`
  })

  for (const rule of REDACTION_PATTERNS) {
    if (rule.pattern.test(text)) {
      redactedKinds.add(rule.kind)
      rule.pattern.lastIndex = 0
      text = text.replace(rule.pattern, rule.replacement)
    }
    rule.pattern.lastIndex = 0
  }

  if (text.length > MAX_SAFE_VALUE_LENGTH) {
    redactedKinds.add('truncated')
    text = `${text.slice(0, MAX_SAFE_VALUE_LENGTH - 1)}...`
  }

  return { text, redactedKinds: [...redactedKinds].sort() }
}

export function buildObservabilityEvent(
  input: BuildObservabilityEventInput,
): VineaObservabilityEvent {
  const message = redactObservabilityText(input.message)
  const route = input.route ? redactObservabilityText(input.route) : null
  const category = input.category ?? inferCategory(input.message)
  const severity = input.severity ?? inferSeverity(input.message, category)
  const customerImpact = input.customerImpact ?? inferCustomerImpact(category)
  const safeTags = sanitizeTags(input.safeTags ?? {})
  const safeContext = sanitizeContext(input.context ?? {})
  const redactedKinds = new Set<string>(message.redactedKinds)

  if (route) {
    for (const kind of route.redactedKinds) redactedKinds.add(kind)
  }

  for (const value of Object.values(safeTags)) {
    for (const kind of redactObservabilityText(value).redactedKinds) {
      redactedKinds.add(kind)
    }
  }

  for (const value of Object.values(safeContext)) {
    for (const kind of redactObservabilityText(value).redactedKinds) {
      redactedKinds.add(kind)
    }
  }

  return {
    eventName: 'vinea.observability',
    severity,
    category,
    safeMessage: message.text,
    route: route?.text,
    operation: input.operation ? redactObservabilityText(input.operation).text : undefined,
    targetType: input.targetType
      ? redactObservabilityText(input.targetType).text
      : undefined,
    activeParishLabel: input.activeParishLabel
      ? redactObservabilityText(input.activeParishLabel).text
      : undefined,
    safeTags,
    safeContext,
    customerImpact,
    recommendedOwner: ownerForCategory(category),
    redaction: {
      redacted: true,
      redactedKinds: [...redactedKinds].sort(),
      rawMessageStored: false,
      rawContextStored: false,
      rawPromptStored: false,
      rawOutputStored: false,
      providerPayloadStored: false,
      tokenMaterialStored: false,
      signedUrlStored: false,
      storagePathStored: false,
      documentPayloadStored: false,
      rawExportStored: false,
      originalFilenameStored: false,
      familyPortalTokenStored: false,
    },
    monitoringSafety: {
      externalDeliveryApproved: false,
      customerCommunicationAllowed: false,
      requiresIncidentCommanderApproval:
        severity === 'critical' || customerImpact === 'data_privacy',
      requiresLegalDataOwnerApproval:
        severity === 'critical' ||
        customerImpact === 'data_privacy' ||
        category === 'authorization' ||
        category === 'document_portal' ||
        category === 'family_portal' ||
        category === 'storage' ||
        category === 'export' ||
        category === 'ai',
      forbiddenPayloadCheckRequired: true,
      rollbackByDisablingFlags: true,
    },
    productionBoundaries: [
      'No external error-reporting service is wired by this DTO.',
      'Do not store raw prompts, generated AI output, token material, signed URLs, storage paths, database URLs, or document contents.',
      'Production observability requires owner approval, redaction smoke tests, monitoring owner, rollback owner, and support playbook coverage.',
    ],
  }
}

export function assertNoForbiddenObservabilityPayload(
  event: VineaObservabilityEvent,
): void {
  const unsafeMarkers = forbiddenSafeEventMarkers(event)
  if (unsafeMarkers.length > 0) {
    throw new Error(
      `Observability event contains forbidden safe payload markers: ${unsafeMarkers.join(
        ', ',
      )}`,
    )
  }

  if (
    event.redaction.rawMessageStored ||
    event.redaction.rawContextStored ||
    event.redaction.rawPromptStored ||
    event.redaction.rawOutputStored ||
    event.redaction.providerPayloadStored ||
    event.redaction.tokenMaterialStored ||
    event.redaction.signedUrlStored ||
    event.redaction.storagePathStored ||
    event.redaction.documentPayloadStored ||
    event.redaction.rawExportStored ||
    event.redaction.originalFilenameStored ||
    event.redaction.familyPortalTokenStored
  ) {
    throw new Error('Observability event redaction flags indicate unsafe storage.')
  }
}

export function assertNoForbiddenProductionMonitoringPayload(
  event: VineaObservabilityEvent,
): void {
  assertNoForbiddenObservabilityPayload(event)

  if (event.monitoringSafety.externalDeliveryApproved) {
    throw new Error(
      'Production monitoring event must not self-approve external delivery.',
    )
  }

  if (event.monitoringSafety.customerCommunicationAllowed) {
    throw new Error(
      'Production monitoring event must not allow automatic customer communication.',
    )
  }
}

function forbiddenSafeEventMarkers(event: VineaObservabilityEvent): string[] {
  const searchable = [
    event.safeMessage,
    event.route,
    event.operation,
    event.targetType,
    event.activeParishLabel,
    ...Object.values(event.safeTags),
    ...Object.values(event.safeContext),
  ]
    .filter(Boolean)
    .join(' ')

  return FORBIDDEN_SAFE_EVENT_TEXT_MARKERS.filter((marker) =>
    searchable.includes(marker),
  )
}

function sanitizeTags(tags: Record<string, SafeTagValue>): Record<string, string> {
  const safeTags: Record<string, string> = {}

  for (const [key, value] of Object.entries(tags)) {
    if (value === undefined) continue
    safeTags[safeKey(key)] = redactObservabilityText(value).text
  }

  return safeTags
}

function sanitizeContext(context: Record<string, unknown>): Record<string, string> {
  const safeContext: Record<string, string> = {}
  let sensitiveContextIndex = 0

  for (const [key, value] of Object.entries(context).slice(0, MAX_CONTEXT_KEYS)) {
    if (sensitiveContextKey(key)) {
      sensitiveContextIndex += 1
      safeContext[`sensitive_context_${sensitiveContextIndex}`] =
        '[redacted-sensitive-context]'
      continue
    }

    safeContext[safeKey(key)] = redactObservabilityText(value).text
  }

  return safeContext
}

function sensitiveContextKey(key: string): boolean {
  const lower = key.toLowerCase()

  return [
    'password',
    'secret',
    'signedurl',
    'token',
    'cookie',
    'oauth',
    'code',
    'hash',
    'prompt',
    'output',
    'payload',
    'body',
    'content',
    'filename',
    'recipient',
    'credential',
    'private',
    'internal',
    'service',
    'key',
    'field',
    'raw',
    'env',
  ].some((marker) => lower.includes(marker))
}

function safeKey(key: string): string {
  return key.replace(/[^a-zA-Z0-9_.:-]/g, '_').slice(0, 64) || 'unknown'
}

function stringifyUnknown(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  if (
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint'
  ) {
    return String(value)
  }

  if (value instanceof Error) {
    return value.message
  }

  try {
    return JSON.stringify(value)
  } catch {
    return '[unserializable]'
  }
}

function inferCategory(message: string): ObservabilityCategory {
  const lower = message.toLowerCase()

  if (
    lower.includes('rls') ||
    lower.includes('unauthorized') ||
    lower.includes('cross-parish')
  ) {
    return 'authorization'
  }
  if (lower.includes('sign in') || lower.includes('login') || lower.includes('auth')) {
    return 'authentication'
  }
  if (lower.includes('supabase') || lower.includes('database') || lower.includes('schema')) {
    return 'database'
  }
  if (lower.includes('family portal')) return 'family_portal'
  if (lower.includes('document') || lower.includes('portal')) return 'document_portal'
  if (lower.includes('export') || lower.includes('csv')) return 'export'
  if (lower.includes('openai') || lower.includes('ai summary')) return 'ai'
  if (lower.includes('google') || lower.includes('calendar')) return 'google_calendar'
  if (lower.includes('email') || lower.includes('resend')) return 'email'
  if (lower.includes('intake')) return 'public_intake'
  if (lower.includes('health')) return 'health_check'
  if (lower.includes('request') || lower.includes('workflow')) return 'request_workflow'
  if (lower.includes('storage') || lower.includes('bucket')) return 'storage'

  return 'unknown'
}

function inferSeverity(
  message: string,
  category: ObservabilityCategory,
): ObservabilitySeverity {
  const lower = message.toLowerCase()

  if (
    lower.includes('publicly accessible') ||
    lower.includes('secret') ||
    lower.includes('token exposed') ||
    lower.includes('cross-parish') ||
    category === 'authorization'
  ) {
    return 'critical'
  }

  if (lower.includes('failed') || lower.includes('error') || lower.includes('exception')) {
    return 'error'
  }

  if (lower.includes('missing') || lower.includes('blocked') || lower.includes('warning')) {
    return 'warning'
  }

  return 'info'
}

function inferCustomerImpact(
  category: ObservabilityCategory,
): ObservabilityCustomerImpact {
  if (category === 'family_portal' || category === 'document_portal') {
    return 'family_portal'
  }

  if (category === 'authorization' || category === 'storage' || category === 'export') {
    return 'data_privacy'
  }

  if (category === 'google_calendar' || category === 'email') {
    return 'integration'
  }

  if (
    category === 'request_workflow' ||
    category === 'public_intake' ||
    category === 'database' ||
    category === 'health_check'
  ) {
    return 'staff_workflow'
  }

  return 'unknown'
}

function ownerForCategory(category: ObservabilityCategory): ObservabilityOwner {
  if (
    category === 'authorization' ||
    category === 'storage' ||
    category === 'export' ||
    category === 'document_portal' ||
    category === 'family_portal' ||
    category === 'ai'
  ) {
    return 'security_data'
  }

  if (category === 'google_calendar' || category === 'email') {
    return 'integration_owner'
  }

  if (category === 'public_intake' || category === 'request_workflow') {
    return 'parish_success'
  }

  if (category === 'database' || category === 'health_check') {
    return 'engineering'
  }

  return 'product_support'
}
