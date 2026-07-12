import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { EXPORT_PRESET_POLICIES, buildExportPermissionEvaluationDto } from '../exportAccessControl'

const packetPath = join(process.cwd(), 'docs', 'REQUEST_DOCUMENT_MANIFEST_EXPORT_READINESS_PACKET_20260630.md')
const policyPath = join(process.cwd(), 'docs', 'DATA_EXPORT_ACCESS_CONTROL_POLICY_PROPOSAL_20260630.md')
const trustCenterPath = join(process.cwd(), 'docs', 'TRUST_CENTER_READINESS_PACKET_20260627.md')

describe('request document manifest export readiness packet', () => {
  it('is explicitly non-runtime and preserves safety boundaries', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'Status: Prepared as a non-runtime export-governance packet only.',
      'Production was not accessed',
      'production flags were not enabled',
      'no staff-facing production UI was added',
      'no live export route was wired',
      'no migrations were applied',
      'operational RLS was not changed',
      'Google Calendar data was not touched',
      'records were not mutated',
      'no secrets were exposed',
      'Current decision state: `DOCUMENT MANIFEST EXPORT PLAN PREPARED, ROUTE WIRING NOT APPROVED`',
      'Completion marker: `REQUEST_DOCUMENT_MANIFEST_EXPORT_READINESS_PACKET_20260630`',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('selects request_document_manifest and keeps bulk document files out of scope', () => {
    const packet = readFileSync(packetPath, 'utf8')

    expect(EXPORT_PRESET_POLICIES.request_document_manifest.requiredPermission).toBe('export_documents_manifest')
    expect(EXPORT_PRESET_POLICIES.request_document_manifest.runtimeExportEnabled).toBe(false)
    expect(EXPORT_PRESET_POLICIES.request_document_files_bulk.runtimeExportEnabled).toBe(false)

    for (const expected of [
      'Recommended export preset: `request_document_manifest`',
      'Recommended future route candidate: `app/api/exports/requests/documents/manifest/route.ts`',
      'This is intentionally a manifest-only plan.',
      'Manifest-only export is safer than bulk file export',
      'Do not use this future surface for bulk file downloads',
      'Bulk document file export remains disabled under `request_document_files_bulk`.',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('defines safe manifest fields and explicit exclusions for document privacy', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'The future route must use a server-owned allowlist.',
      'Request reference.',
      'Workflow step title.',
      'Workflow step required/optional flag.',
      'Document family-facing label.',
      'Document review status.',
      'Missing/received indicator.',
      'Uploaded file contents.',
      'Original filename.',
      'Storage bucket name.',
      'Storage object path.',
      'Direct storage path.',
      'Signed URL.',
      'Family portal token.',
      'Family portal token hash.',
      'Staff-only internal notes.',
      'Staff-only document comments.',
      'AI summaries, prompts, drafts, provider payloads, or token material.',
      'Sacramental/canonical record details.',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('requires active parish, request ownership, permission DTO, audit metadata, and preflight before future queries', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'Evaluate `getExportRuntimeGate` before export query work.',
      'Require authenticated staff.',
      'Deny family portal or unauthenticated surfaces.',
      'Resolve selected active parish context server-side.',
      "Validate the active parish is in the staff member's `parish_memberships`.",
      'Validate every target request belongs to the selected active parish.',
      'Build `buildExportPermissionEvaluationDto` with preset `request_document_manifest`.',
      'Use the server-owned document manifest field allowlist.',
      'Prepare safe audit metadata with no raw file contents, prompts, tokens, signed URLs, storage paths, original filenames, provider payloads, or full record payloads.',
      'Write the audit event before query execution or file delivery.',
      'Query only same-parish request document metadata for the selected active parish.',
      'The route must continue to satisfy `lib/server/exportRouteRuntimeWiringPreflight.ts` before merge.',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('keeps document manifest permission DTO disabled and scoped to same active parish', () => {
    const result = buildExportPermissionEvaluationDto({
      staff: {
        userId: 'staff-docs',
        email: 'docs@exampleparish.test',
        roles: ['parish_secretary'],
      },
      scope: {
        activeParishId: 'parish-a',
        membershipParishIds: ['parish-a', 'parish-b'],
        targetParishIds: ['parish-a'],
        selectedParishName: 'Vinea QA Parish A',
      },
      request: {
        presetId: 'request_document_manifest',
        targetObjectType: 'request_documents',
        requestedFields: ['request_reference', 'workflow_step_title', 'document_status', 'submitted_at'],
        filtersSummary: 'Required document readiness for active parish requests',
        estimatedRowCount: 12,
      },
      timestamp: '2026-06-30T18:00:00.000Z',
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.dto.decision).toBe('disabled_non_runtime')
    expect(result.dto.blockedReason).toBe('runtime_export_not_enabled')
    expect(result.dto.preset.id).toBe('request_document_manifest')
    expect(result.dto.preset.requiredPermission).toBe('export_documents_manifest')
    expect(result.dto.activeParishId).toBe('parish-a')
    expect(result.dto.parishIdsIncluded).toEqual(['parish-a'])
    expect(result.dto.familyFacingExportAllowed).toBe(false)
    expect(result.dto.auditMetadataTemplate.safeMetadataOnly).toBe(true)
  })

  it('rejects document manifest attempts from family surfaces or with signed URL/storage/token fields', () => {
    const familySurface = buildExportPermissionEvaluationDto({
      staff: {
        userId: 'staff-docs',
        email: 'docs@exampleparish.test',
        roles: ['parish_secretary'],
      },
      scope: {
        activeParishId: 'parish-a',
        membershipParishIds: ['parish-a'],
        targetParishIds: ['parish-a'],
      },
      request: {
        presetId: 'request_document_manifest',
        targetObjectType: 'request_documents',
        requestedFields: ['request_reference', 'document_status'],
        familyPortalSurface: true,
      },
    })
    const blockedFields = buildExportPermissionEvaluationDto({
      staff: {
        userId: 'staff-docs',
        email: 'docs@exampleparish.test',
        roles: ['parish_secretary'],
      },
      scope: {
        activeParishId: 'parish-a',
        membershipParishIds: ['parish-a'],
        targetParishIds: ['parish-a'],
      },
      request: {
        presetId: 'request_document_manifest',
        targetObjectType: 'request_documents',
        requestedFields: ['request_reference', 'signed_url', 'direct_storage_path', 'portal_token_hash'],
      },
    })

    expect(familySurface.ok).toBe(false)
    if (familySurface.ok) throw new Error('Expected family portal document manifest export to be blocked.')

    expect(familySurface.blockedReason).toBe('family_portal_surface_cannot_export_staff_data')
    expect(blockedFields.ok).toBe(false)
    if (blockedFields.ok) throw new Error('Expected blocked document manifest fields to be denied.')

    expect(blockedFields.blockedReason).toBe('blocked_export_fields_requested')
  })

  it('links policy and trust-center docs without strengthening runtime claims', () => {
    const policy = readFileSync(policyPath, 'utf8')
    const trustCenter = readFileSync(trustCenterPath, 'utf8')

    expect(policy).toContain(
      'Request document manifest export readiness packet: `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_READINESS_PACKET_20260630.md`'
    )
    expect(policy).toContain(
      'The document manifest readiness packet is manifest-only and intentionally does not approve bulk file downloads, signed URL delivery, storage path exposure, production flags, staff-facing production UI, migrations, operational RLS changes, Google Calendar behavior, or record mutations.'
    )
    expect(trustCenter).toContain(
      'Request document manifest export readiness packet: `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_READINESS_PACKET_20260630.md`'
    )
    expect(trustCenter).toContain(
      'Request document manifest export readiness tests: `lib/server/requestDocumentManifestExportReadinessPacket.test.ts`'
    )
    expect(trustCenter).toContain(
      'Document manifest route wiring is approved only for non-production runtime QA behind the disabled export runtime gate.'
    )
  })

  it('does not include obvious credential, connection-string, signed URL, token, or raw fixture material', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const forbidden of [
      'postgresql://',
      'SUPABASE_SERVICE_ROLE_KEY=',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=',
      'GOOGLE_CLIENT_SECRET=',
      'OPENAI_API_KEY=',
      'access_token=',
      'refresh_token=',
      'https://signed',
      'eyJ',
      '00000000-0000-4000-8000-000000000000',
    ]) {
      expect(packet).not.toContain(forbidden)
    }
  })
})
