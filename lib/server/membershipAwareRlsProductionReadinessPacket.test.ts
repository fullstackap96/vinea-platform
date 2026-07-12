import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const packetPath = join(
  process.cwd(),
  'docs',
  'MEMBERSHIP_AWARE_RLS_PRODUCTION_READINESS_PACKET_20260629.md'
)

describe('membership-aware RLS production readiness packet', () => {
  it('is explicitly non-executing and keeps production RLS at NO-GO', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'Status: Prepared with non-secret owner and fixture placeholders only.',
      'Production was not accessed',
      'no migrations were applied',
      'runtime behavior was not changed',
      'operational RLS was not changed',
      'Google Calendar data was not touched',
      'Current decision: `NO_GO_PENDING_HUMAN_OWNER_NAMES_AND_FIXTURE_SELECTION`',
      'Production decision remains: `NO-GO`',
      'This packet is ready for human completion, not execution.',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('links the capture form and production readiness source documents', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_OWNER_FIXTURE_CAPTURE_FORM_20260629.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_GO_NO_GO_REVIEW_CHECKLIST_20260627.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_BLOCKER_REGISTER_20260628.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_ROLLBACK_PACKET_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_FIXTURE_WORKSHEET_20260627.md',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('provides non-secret owner placeholders for every required role', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'PROVIDE_PRODUCT_OWNER_NAME',
      'PROVIDE_TECHNICAL_OWNER_NAME',
      'PROVIDE_QA_OWNER_NAME',
      'PROVIDE_SECURITY_DATA_OWNER_NAME',
      'PROVIDE_ROLLBACK_OWNER_NAME',
      'PROVIDE_MONITORING_OWNER_NAME',
      'PROVIDE_SUPPORT_OWNER_NAME',
      'PROVIDE_EVIDENCE_STORAGE_OWNER_NAME',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('provides production-safe fixture placeholders and cleanup/deactivation placeholders', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'PROVIDE_SAFE_STAFF_ACCOUNT_LABEL_NO_PASSWORD',
      'PROVIDE_ACTIVE_PARISH_SAFE_LABEL',
      'PROVIDE_ACTIVE_PARISH_ID_ONLY_IF_SAFE_TO_RECORD',
      'PROVIDE_DENIAL_PARISH_SAFE_LABEL_OR_DOCUMENTED_SUBSTITUTE',
      'PROVIDE_SAFE_SAME_PARISH_REQUEST_LABEL',
      'PROVIDE_SAFE_CROSS_PARISH_DENIED_REQUEST_LABEL',
      'PROVIDE_SAFE_WORKFLOW_STEP_LABEL',
      'Vinea production RLS smoke test staff document - synthetic file only',
      'Vinea production RLS smoke test family document - synthetic file only',
      'CREATE_DURING_APPROVED_SMOKE_WINDOW_DO_NOT_RECORD_RAW_TOKEN',
      'PROVIDE_TOKEN_DEACTIVATION_OR_EXPIRATION_PLAN',
      'PROVIDE_EVIDENCE_REDACTION_REVIEW_PLAN',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('keeps all remaining production blockers explicit', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      '| Human owners named | `BLOCKED` |',
      '| Owner backup/contact paths recorded | `BLOCKED` |',
      '| Production-safe fixtures selected | `BLOCKED` |',
      '| Fixture safety approved | `BLOCKED` |',
      '| Rollout window selected | `BLOCKED` |',
      '| Monitoring/support/evidence storage ready | `BLOCKED` |',
      '| Final explicit product-owner approval | `BLOCKED` |',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('does not contain credential-like values, raw tokens, signed URLs, or real fixture ids', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const forbidden of [
      'postgresql://',
      'SUPABASE_SERVICE_ROLE_KEY=',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=',
      'GOOGLE_CLIENT_SECRET=',
      'OPENAI_API_KEY=',
      'access_token=',
      'refresh_token=',
      'X-Amz-Signature',
      'token=',
      'calendarId=',
      'eventId=',
      '735840c9-a276-4b3d-9773-7b350c9fc35c',
      'f4a50f8b-4039-46d7-902f-a40719a12718',
    ]) {
      expect(packet).not.toContain(forbidden)
    }
  })
})
