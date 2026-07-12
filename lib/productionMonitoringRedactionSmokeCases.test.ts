import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { buildProductionMonitoringRedactionSmokeCases } from './productionMonitoringRedactionSmokeCases'

const root = process.cwd()

function read(path: string) {
  return readFileSync(join(root, path), 'utf8')
}

const SYNTHETIC_SENSITIVE_VALUES = [
  'alex.qa@example.test',
  'parish-office-secret',
  'oauth-code-123',
  'oauth-code-456',
  'auth-access-token',
  'nested-auth-token',
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  'parish_memberships.staff_user_id',
  'request-documents/private/baptism.pdf',
  'baptism-certificate-upload.pdf',
  'document-signature',
  'document-signature-2',
  'Private baptism document',
  'family-portal-token-value',
  'token_hash_internal_value',
  'Staff-only family portal note',
  'Private document detail',
  'Generated private pastoral summary',
  'eyJai.provider.token',
  'summarize-private-note',
  'provider-secret',
  'private generated output',
  'json-token',
  'google-access-token',
  'google-refresh-token',
  'Private funeral appointment',
  'google-client-secret-value',
  'resend-secret-value',
  'Private email body',
  'email-token-value',
  'postgresql://postgres:secret@db.example.supabase.co:5432/postgres',
  'service-role-key-value',
  'SUPABASE_SERVICE_ROLE_KEY=service-role-key-value',
] as const

describe('production monitoring redaction smoke cases', () => {
  it('covers every required non-production redaction smoke case', () => {
    const cases = buildProductionMonitoringRedactionSmokeCases()

    expect(cases.map((smokeCase) => smokeCase.id)).toEqual([
      'authentication_failure',
      'active_parish_rls_denial',
      'document_portal_denial',
      'family_portal_denial',
      'export_denial',
      'ai_failure',
      'google_calendar_failure',
      'email_failure',
      'health_check_failure',
    ])
  })

  it('builds only safe observability events with support routing labels', () => {
    const cases = buildProductionMonitoringRedactionSmokeCases()

    for (const smokeCase of cases) {
      expect(smokeCase.safeEvent.eventName).toBe('vinea.observability')
      expect(smokeCase.safeEvent.category).toBe(smokeCase.expectedCategory)
      expect(smokeCase.safeEvent.monitoringSafety.customerCommunicationAllowed).toBe(
        false,
      )
      expect(smokeCase.safeEvent.monitoringSafety.externalDeliveryApproved).toBe(false)
      expect(smokeCase.safeEvent.monitoringSafety.rollbackByDisablingFlags).toBe(true)
      expect(smokeCase.supportRouting.supportOwnerLabel).toBe('support_owner')
      expect(smokeCase.supportRouting.customerCommunicationAllowed).toBe(false)
      expect(smokeCase.supportRouting.rollbackByDisablingFlags).toBe(true)
      expect(smokeCase.passCriteria.join(' ')).toContain(
        'Forbidden payload assertions pass',
      )
      expect(smokeCase.productionBoundary).toContain('non-runtime only')
    }
  })

  it('does not preserve synthetic sensitive values in safe smoke outputs', () => {
    const serializedCases = JSON.stringify(buildProductionMonitoringRedactionSmokeCases())

    for (const sensitiveValue of SYNTHETIC_SENSITIVE_VALUES) {
      expect(serializedCases).not.toContain(sensitiveValue)
    }
  })

  it('covers sensitive key-value payloads embedded in ordinary text fields', () => {
    const safePayloadText = buildProductionMonitoringRedactionSmokeCases()
      .map((smokeCase) =>
        [
          smokeCase.safeEvent.safeMessage,
          smokeCase.safeEvent.route,
          smokeCase.safeEvent.operation,
          smokeCase.safeEvent.targetType,
          smokeCase.safeEvent.activeParishLabel,
          ...Object.values(smokeCase.safeEvent.safeTags),
          ...Object.values(smokeCase.safeEvent.safeContext),
        ]
          .filter(Boolean)
          .join(' '),
      )
      .join(' ')

    for (const redactedMarker of [
      '[sensitive-key]%3D[redacted]',
      '[sensitive-key]=[redacted]',
      '\\"[sensitive-key]\\":\\"[redacted]\\"',
    ]) {
      expect(JSON.stringify(safePayloadText)).toContain(redactedMarker)
    }

    for (const forbiddenLabel of [
      'signedUrl',
      'x-amz-signature',
      'storagePath',
      'originalFilename',
      'rawPrompt',
      'providerPayload',
      'rawOutput',
    ]) {
      expect(safePayloadText).not.toContain(forbiddenLabel)
    }
  })

  it('documents free-form key-value coverage in the smoke matrix', () => {
    const doc = read('docs/PRODUCTION_MONITORING_REDACTION_SMOKE_CASE_MATRIX_20260706.md')

    expect(doc).toContain('Free-form text fields')
    expect(doc).toContain('access_token=...')
    expect(doc).toContain('token%3D...')
    expect(doc).toContain('signed URL markers')
    expect(doc).toContain('provider payload markers')
    expect(doc).toContain('JSON-style sensitive fields')
    expect(doc).toContain('generic `[sensitive-key]` labels')
  })

  it('routes privacy-sensitive smoke cases to security/data ownership', () => {
    const cases = buildProductionMonitoringRedactionSmokeCases()
    const privacyCases = cases.filter((smokeCase) =>
      [
        'active_parish_rls_denial',
        'document_portal_denial',
        'family_portal_denial',
        'export_denial',
        'ai_failure',
      ].includes(smokeCase.id),
    )

    expect(privacyCases.length).toBe(5)
    expect(
      privacyCases.every(
        (smokeCase) =>
          smokeCase.safeEvent.recommendedOwner === 'security_data' &&
          smokeCase.supportRouting.supportRequiredRoleLabels.includes(
            'security_data_owner',
          ),
      ),
    ).toBe(true)
  })
})
