import 'server-only'

import { writeAuditEvent } from '@/lib/server/auditLog'
import type { ExportPermissionEvaluationDto, ExportPresetId } from '@/lib/exportAccessControl'

export type ExportDeniedReasonCode =
  | 'unauthenticated_or_non_staff'
  | 'active_parish_scope_denied'
  | 'selected_parish_role_denied'
  | 'export_permission_denied'
  | 'blocked_or_disallowed_fields'

type ExportDeniedAuditInput = {
  readonly action: string
  readonly actorEmail?: string | null
  readonly parishId?: string | null
  readonly presetId: ExportPresetId
  readonly routeId: string
  readonly runtimeGateState: string
  readonly deniedReasonCode: ExportDeniedReasonCode
  readonly httpStatus: number
  readonly targetObjectType: string
  readonly requestedActiveParishCookiePresent?: boolean
  readonly requestedFieldsCount?: number | null
  readonly blockedFieldsRequestedCount?: number | null
  readonly disallowedFieldsCount?: number | null
  readonly permissionDto?: ExportPermissionEvaluationDto | null
}

export async function writeDeniedExportAuditEvent(input: ExportDeniedAuditInput) {
  const dtoMetadata = input.permissionDto?.auditMetadataTemplate ?? null

  await writeAuditEvent({
    parishId: input.parishId ?? input.permissionDto?.activeParishId ?? null,
    actorEmail: input.actorEmail ?? input.permissionDto?.staffIdentity.email ?? null,
    action: input.action,
    targetType: 'export',
    targetId: input.presetId,
    metadata: {
      ...(dtoMetadata ?? {}),
      routeId: input.routeId,
      runtimeGateState: input.runtimeGateState,
      export_preset_id: input.presetId,
      target_object_type: input.targetObjectType,
      decision: 'denied',
      deniedReasonCode: input.deniedReasonCode,
      httpStatus: input.httpStatus,
      requestedActiveParishCookiePresent: input.requestedActiveParishCookiePresent === true,
      requestedFieldsCount: input.requestedFieldsCount ?? null,
      blockedFieldsRequestedCount: input.blockedFieldsRequestedCount ?? null,
      disallowedFieldsCount: input.disallowedFieldsCount ?? null,
      permissionDecisionBeforeRuntimeGate: input.permissionDto?.decision ?? null,
      permissionBlockedReasonBeforeRuntimeGate: input.permissionDto?.blockedReason ?? null,
      safeMetadataOnly: true,
    },
  })
}
