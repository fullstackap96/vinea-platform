import { describe, expect, it } from 'vitest'

import {
  assertNoForbiddenObservabilityPayload,
  assertNoForbiddenProductionMonitoringPayload,
  buildObservabilityEvent,
  redactObservabilityText,
} from './observabilityEvent'

describe('observability event DTO', () => {
  it('redacts common secret, identity, database, storage, and URL token material', () => {
    const result = redactObservabilityText(
      'Failed for alex@example.com id 11111111-1111-4111-8111-111111111111 ' +
        'postgresql://postgres:password@db.example.supabase.co:5432/postgres ' +
        'eyJabc.def.ghi request-documents/private/file.pdf ' +
        'https://app.example.test/callback?code=oauth-code&token=family-token',
    )

    expect(result.text).toContain('[email]')
    expect(result.text).toContain('[id]')
    expect(result.text).toContain('[database-url]')
    expect(result.text).toContain('[token]')
    expect(result.text).toContain('[storage-path]')
    expect(result.text).toContain('code=[redacted]')
    expect(result.text).toContain('[sensitive-key]=[redacted]')
    expect(result.redactedKinds).toEqual(
      expect.arrayContaining([
        'database_url',
        'email',
        'jwt_or_api_token',
        'sensitive_query',
        'storage_path',
        'uuid',
      ]),
    )
  })

  it('redacts sensitive key-value payloads in free-form monitoring text', () => {
    const results = [
      redactObservabilityText(
        'Callback failed at /dashboard?access_token=plain-token&next=/safe ' +
          'returnTo=%2Fdashboard%3Ftoken%3Dnested-token',
      ),
      redactObservabilityText(
        'Document callback signedUrl=https://storage.example.test/object/sign/private.pdf?X-Amz-Signature=aws-secret ' +
          'x-amz-signature=aws-secret-2 storagePath=request-documents/private/baptism.pdf ' +
          'originalFilename=baptism-certificate-upload.pdf',
      ),
      redactObservabilityText(
        'AI callback rawPrompt=summarize-private-note providerPayload={"apiKey":"provider-secret"} ' +
          '"rawOutput":"private generated output" "token":"json-token"',
      ),
      redactObservabilityText(
        'Provider auth failed Bearer provider-token-value sk_test_1234567890123456',
      ),
    ]
    const combinedText = results.map((result) => result.text).join(' ')
    const combinedKinds = new Set(
      results.flatMap((result) => result.redactedKinds),
    )

    expect(combinedText).toContain('[sensitive-key]%3D[redacted]')
    expect(combinedText).toContain('[sensitive-key]=[redacted]')
    expect(combinedText).toContain('"[sensitive-key]":"[redacted]"')
    expect(combinedText).toContain('Bearer [token]')
    expect(combinedText).toContain('[token]')
    expect(combinedText).not.toContain('signedUrl')
    expect(combinedText).not.toContain('x-amz-signature')
    expect(combinedText).not.toContain('storagePath')
    expect(combinedText).not.toContain('originalFilename')
    expect(combinedText).not.toContain('rawPrompt')
    expect(combinedText).not.toContain('providerPayload')
    expect(combinedText).not.toContain('rawOutput')
    expect(combinedText).not.toContain('plain-token')
    expect(combinedText).not.toContain('nested-token')
    expect(combinedText).not.toContain('aws-secret')
    expect(combinedText).not.toContain('aws-secret-2')
    expect(combinedText).not.toContain('request-documents/private/baptism.pdf')
    expect(combinedText).not.toContain('baptism-certificate-upload.pdf')
    expect(combinedText).not.toContain('summarize-private-note')
    expect(combinedText).not.toContain('private generated output')
    expect(combinedText).not.toContain('json-token')
    expect(combinedText).not.toContain('provider-token-value')
    expect(combinedText).not.toContain('sk_test_1234567890123456')
    expect([...combinedKinds].sort()).toEqual(
      expect.arrayContaining([
        'api_token',
        'bearer_token',
        'sensitive_key_value',
        'sensitive_query',
      ]),
    )
  })

  it('builds a critical safe event for authorization and privacy issues', () => {
    const event = buildObservabilityEvent({
      message:
        'Cross-parish request access failed for alex@example.com and request 11111111-1111-4111-8111-111111111111',
      route:
        '/dashboard/requests/11111111-1111-4111-8111-111111111111?token=not-safe',
      operation: 'request_detail_guard',
      context: {
        actorEmail: 'alex@example.com',
        requestId: '11111111-1111-4111-8111-111111111111',
        storagePath: 'request-documents/private/file.pdf',
      },
    })

    expect(event.eventName).toBe('vinea.observability')
    expect(event.category).toBe('authorization')
    expect(event.severity).toBe('critical')
    expect(event.customerImpact).toBe('data_privacy')
    expect(event.recommendedOwner).toBe('security_data')
    expect(event.safeMessage).not.toContain('alex@example.com')
    expect(event.safeMessage).not.toContain('11111111-1111-4111-8111-111111111111')
    expect(event.route).toContain('[sensitive-key]=[redacted]')
    expect(event.safeContext.actorEmail).toBe('[email]')
    expect(event.safeContext.storagePath).toBe('[storage-path]')
    expect(event.redaction.rawMessageStored).toBe(false)
    expect(event.redaction.tokenMaterialStored).toBe(false)
    expect(event.redaction.storagePathStored).toBe(false)
    expect(event.redaction.signedUrlStored).toBe(false)
    expect(event.monitoringSafety.customerCommunicationAllowed).toBe(false)
    expect(event.monitoringSafety.requiresIncidentCommanderApproval).toBe(true)
    expect(event.monitoringSafety.requiresLegalDataOwnerApproval).toBe(true)
  })

  it('keeps production boundaries explicit and avoids raw AI/export/document payload storage', () => {
    const event = buildObservabilityEvent({
      category: 'ai',
      message: 'AI summary generation blocked before OpenAI call',
      context: {
        prompt: 'Summarize private note body for alex@example.com',
        providerPayload: { token: 'eyJabc.def.ghi' },
        exportFields: ['request_type', 'family_token'],
      },
    })

    expect(event.recommendedOwner).toBe('security_data')
    expect(event.redaction.rawPromptStored).toBe(false)
    expect(event.redaction.rawOutputStored).toBe(false)
    expect(event.redaction.providerPayloadStored).toBe(false)
    expect(event.redaction.rawExportStored).toBe(false)
    expect(event.redaction.documentPayloadStored).toBe(false)
    expect(event.redaction.originalFilenameStored).toBe(false)
    expect(event.redaction.familyPortalTokenStored).toBe(false)
    expect(event.monitoringSafety.externalDeliveryApproved).toBe(false)
    expect(event.monitoringSafety.rollbackByDisablingFlags).toBe(true)
    expect(event.productionBoundaries.join(' ')).toContain('No external error-reporting')
    expect(event.productionBoundaries.join(' ')).toContain('Production observability requires owner approval')
    expect(JSON.stringify(event)).not.toContain('alex@example.com')
    expect(JSON.stringify(event)).not.toContain('eyJabc.def.ghi')
  })

  it('classifies family portal events before generic portal events', () => {
    const event = buildObservabilityEvent({
      message: 'Family portal denial for expired household access link',
    })

    expect(event.category).toBe('family_portal')
    expect(event.customerImpact).toBe('family_portal')
    expect(event.recommendedOwner).toBe('security_data')
  })

  it('passes forbidden-payload assertions for safe DTO output only', () => {
    const event = buildObservabilityEvent({
      category: 'document_portal',
      message:
        'Signed URL failure for document request-documents/private/file.pdf and portal token eyJabc.def.ghi',
      context: {
        originalFilename: 'family baptism certificate.pdf',
        documentContent: 'private sacramental upload body for alex@example.com',
        signedUrl: 'https://storage.example.test/private.pdf?token=secret-token',
      },
    })

    expect(() => assertNoForbiddenObservabilityPayload(event)).not.toThrow()
    expect(() => assertNoForbiddenProductionMonitoringPayload(event)).not.toThrow()
    expect(event.safeMessage).toContain('[storage-path]')
    expect(event.safeMessage).toContain('[token]')
    expect(Object.values(event.safeContext)).toEqual(
      expect.arrayContaining([
        '[redacted-sensitive-context]',
        '[redacted-sensitive-context]',
        '[redacted-sensitive-context]',
      ]),
    )
    expect(Object.keys(event.safeContext).join(' ')).not.toContain('documentContent')
    expect(Object.keys(event.safeContext).join(' ')).not.toContain('originalFilename')
    expect(Object.keys(event.safeContext).join(' ')).not.toContain('signedUrl')
    expect(event.monitoringSafety.customerCommunicationAllowed).toBe(false)
  })

  it('rejects manually forged safe events with unsafe monitoring boundaries', () => {
    const event = buildObservabilityEvent({
      category: 'export',
      message: 'Export denial preserved safely',
    })
    const forgedEvent = {
      ...event,
      safeContext: {
        ...event.safeContext,
        rawExport: 'rawExport',
      },
      monitoringSafety: {
        ...event.monitoringSafety,
        externalDeliveryApproved: true as false,
        customerCommunicationAllowed: true as false,
      },
    }

    expect(() => assertNoForbiddenObservabilityPayload(forgedEvent)).toThrow(
      'forbidden safe payload markers',
    )
    expect(() =>
      assertNoForbiddenProductionMonitoringPayload({
        ...event,
        monitoringSafety: {
          ...event.monitoringSafety,
          externalDeliveryApproved: true as false,
        },
      }),
    ).toThrow('must not self-approve external delivery')
  })
})
