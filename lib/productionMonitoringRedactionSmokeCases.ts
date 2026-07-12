import {
  assertNoForbiddenProductionMonitoringPayload,
  buildObservabilityEvent,
  type ObservabilityCategory,
  type VineaObservabilityEvent,
} from './observabilityEvent'
import {
  mapObservabilityEventToSupportEscalation,
  type ProductionMonitoringSupportRouting,
} from './supportEscalationMatrix'

export type ProductionMonitoringRedactionSmokeCaseId =
  | 'authentication_failure'
  | 'active_parish_rls_denial'
  | 'document_portal_denial'
  | 'family_portal_denial'
  | 'export_denial'
  | 'ai_failure'
  | 'google_calendar_failure'
  | 'email_failure'
  | 'health_check_failure'

export type ProductionMonitoringRedactionSmokeCaseResult = {
  id: ProductionMonitoringRedactionSmokeCaseId
  label: string
  expectedCategory: ObservabilityCategory
  safeEvent: VineaObservabilityEvent
  supportRouting: ProductionMonitoringSupportRouting
  expectedForbiddenDataAbsent: string[]
  passCriteria: string[]
  productionBoundary: string
}

type ProductionMonitoringRedactionSmokeCaseDefinition = {
  id: ProductionMonitoringRedactionSmokeCaseId
  label: string
  expectedCategory: ObservabilityCategory
  message: string
  context: Record<string, unknown>
  expectedForbiddenDataAbsent: string[]
}

const PRODUCTION_MONITORING_REDACTION_SMOKE_CASES: readonly ProductionMonitoringRedactionSmokeCaseDefinition[] =
  [
    {
      id: 'authentication_failure',
      label: 'Authentication failure redaction',
      expectedCategory: 'authentication',
      message:
        'Sign in failed for alex.qa@example.test with password parish-office-secret and code oauth-code-123',
      context: {
        email: 'alex.qa@example.test',
        passwordPresent: true,
        sessionCookie: 'sb-session-cookie-value',
        callbackUrl: 'https://qa.example.test/login?code=oauth-code-123',
        callbackMessage:
          'OAuth callback included access_token=auth-access-token and returnTo=%2Fdashboard%3Ftoken%3Dnested-auth-token',
      },
      expectedForbiddenDataAbsent: [
        'email',
        'password',
        'session cookie',
        'token',
        'OAuth code',
      ],
    },
    {
      id: 'active_parish_rls_denial',
      label: 'Active-parish/RLS denial redaction',
      expectedCategory: 'authorization',
      message:
        'Cross-parish RLS denial for request 11111111-1111-4111-8111-111111111111 and person 22222222-2222-4222-8222-222222222222',
      context: {
        requestId: '11111111-1111-4111-8111-111111111111',
        personId: '22222222-2222-4222-8222-222222222222',
        membershipInternals: 'parish_memberships.staff_user_id raw membership row',
      },
      expectedForbiddenDataAbsent: [
        'raw request ID',
        'raw person ID',
        'raw household ID',
        'raw document ID',
        'membership internals',
      ],
    },
    {
      id: 'document_portal_denial',
      label: 'Document portal denial redaction',
      expectedCategory: 'document_portal',
      message:
        'Document portal denied signed URL for request-documents/private/baptism.pdf',
      context: {
        signedUrl:
          'https://storage.example.test/object/sign/request-documents/private/baptism.pdf?token=family-document-token',
        storagePath: 'request-documents/private/baptism.pdf',
        originalFilename: 'baptism-certificate-upload.pdf',
        documentContent: 'Private baptism document for alex.qa@example.test',
        providerMessage:
          'Document provider returned signedUrl=https://storage.example.test/object/sign/private.pdf?X-Amz-Signature=document-signature x-amz-signature=document-signature-2 storagePath=request-documents/private/baptism.pdf originalFilename=baptism-certificate-upload.pdf',
      },
      expectedForbiddenDataAbsent: [
        'signed URL',
        'storage path',
        'original filename',
        'document content',
      ],
    },
    {
      id: 'family_portal_denial',
      label: 'Family portal denial redaction',
      expectedCategory: 'family_portal',
      message:
        'Family portal denied expired link with token eyJfamily.portal.token',
      context: {
        portalToken: 'family-portal-token-value',
        tokenHash: 'token_hash_internal_value',
        internalNotes: 'Staff-only family portal note',
        aiMaterial: 'AI summary draft for private request',
      },
      expectedForbiddenDataAbsent: [
        'portal token value',
        'token hash',
        'internal notes',
        'staff-only fields',
        'AI material',
      ],
    },
    {
      id: 'export_denial',
      label: 'Export denial redaction',
      expectedCategory: 'export',
      message: 'Export CSV denied because a forbidden export field was requested',
      context: {
        rawCsv: 'name,email,token\nAlex,alex.qa@example.test,secret-token',
        forbiddenFields: ['family_token', 'document_storage_path'],
        rawExport: 'rawExport',
        privateDocumentData: 'Private document detail',
      },
      expectedForbiddenDataAbsent: [
        'raw CSV',
        'forbidden fields',
        'token material',
        'private document data',
        'raw export',
      ],
    },
    {
      id: 'ai_failure',
      label: 'AI failure redaction',
      expectedCategory: 'ai',
      message: 'AI summary failed before OpenAI provider call',
      context: {
        prompt: 'Summarize private request for alex.qa@example.test',
        generatedOutput: 'Generated private pastoral summary',
        providerPayload: { token: 'eyJai.provider.token' },
        sourceBody: 'Private request note body',
        providerErrorText:
          'AI provider payload rawPrompt=summarize-private-note providerPayload={"apiKey":"provider-secret"} "rawOutput":"private generated output" "token":"json-token"',
      },
      expectedForbiddenDataAbsent: [
        'prompt',
        'generated output',
        'provider payload',
        'source body',
        'token material',
      ],
    },
    {
      id: 'google_calendar_failure',
      label: 'Google Calendar failure redaction',
      expectedCategory: 'google_calendar',
      message: 'Google Calendar callback failed with OAuth code oauth-code-456',
      context: {
        oauthCode: 'oauth-code-456',
        accessToken: 'google-access-token',
        refreshToken: 'google-refresh-token',
        calendarBody: { summary: 'Private funeral appointment' },
        googleCredential: 'google-client-secret-value',
      },
      expectedForbiddenDataAbsent: [
        'OAuth code',
        'access token',
        'refresh token',
        'calendar body',
        'Google credential',
      ],
    },
    {
      id: 'email_failure',
      label: 'Email failure redaction',
      expectedCategory: 'email',
      message: 'Email provider failed for unauthorized recipient alex.qa@example.test',
      context: {
        providerSecret: 'resend-secret-value',
        privateBodyContent: 'Private email body',
        token: 'email-token-value',
        unauthorizedRecipientList: ['alex.qa@example.test'],
      },
      expectedForbiddenDataAbsent: [
        'provider secret',
        'private body content',
        'token',
        'unauthorized recipient list',
      ],
    },
    {
      id: 'health_check_failure',
      label: '/api/health failure redaction',
      expectedCategory: 'health_check',
      message:
        'Health check failed for postgresql://postgres:secret@db.example.supabase.co:5432/postgres',
      context: {
        databaseUrl:
          'postgresql://postgres:secret@db.example.supabase.co:5432/postgres',
        serviceRoleKey: 'service-role-key-value',
        rawEnvDump: 'SUPABASE_SERVICE_ROLE_KEY=service-role-key-value',
      },
      expectedForbiddenDataAbsent: [
        'secret values',
        'database URL',
        'service-role key',
        'raw env dump',
      ],
    },
  ] as const

export function buildProductionMonitoringRedactionSmokeCases(): ProductionMonitoringRedactionSmokeCaseResult[] {
  return PRODUCTION_MONITORING_REDACTION_SMOKE_CASES.map((definition) => {
    const safeEvent = buildObservabilityEvent({
      category: definition.expectedCategory,
      message: definition.message,
      context: definition.context,
    })

    assertNoForbiddenProductionMonitoringPayload(safeEvent)

    return {
      id: definition.id,
      label: definition.label,
      expectedCategory: definition.expectedCategory,
      safeEvent,
      supportRouting: mapObservabilityEventToSupportEscalation(safeEvent),
      expectedForbiddenDataAbsent: [...definition.expectedForbiddenDataAbsent],
      passCriteria: [
        'Safe event category and severity are label-only.',
        'Forbidden payload assertions pass before external monitoring delivery.',
        'Support routing is label-only and customerCommunicationAllowed is false.',
        'Rollback remains possible by disabling monitoring flags.',
      ],
      productionBoundary:
        'This smoke case matrix is non-runtime only. It does not enable monitoring, send events externally, page staff, contact customers, mutate records, or approve production smoke.',
    }
  })
}
