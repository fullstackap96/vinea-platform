import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const validationGatePath = join(
  process.cwd(),
  'docs',
  'MEMBERSHIP_AWARE_RLS_PRODUCTION_HUMAN_INTAKE_VALIDATION_GATE_20260629.md'
)

describe('membership-aware RLS production human intake validation gate', () => {
  it('is explicitly non-executing and keeps production untouched', () => {
    const gate = readFileSync(validationGatePath, 'utf8')

    for (const expected of [
      'Status: Validation gate prepared only.',
      'Production was not accessed',
      'no migrations were applied',
      'runtime behavior was not changed',
      'operational RLS was not changed',
      'Google Calendar data was not touched',
      'records were not mutated',
      'no secrets were exposed',
      'Current decision: `GO_READY_FOR_PRODUCT_OWNER_APPROVAL`',
      'Separate product-owner production approval still required',
    ]) {
      expect(gate).toContain(expected)
    }
  })

  it('links the source checklist and supporting production readiness artifacts', () => {
    const gate = readFileSync(validationGatePath, 'utf8')

    for (const expected of [
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_HUMAN_INTAKE_CHECKLIST_20260629.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_READINESS_PACKET_20260629.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_OWNER_FIXTURE_CAPTURE_FORM_20260629.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_GO_NO_GO_REVIEW_CHECKLIST_20260627.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_BLOCKER_REGISTER_20260628.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_ROLLBACK_PACKET_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_EVIDENCE_TEMPLATE_20260626.md',
    ]) {
      expect(gate).toContain(expected)
    }
  })

  it('requires owners, fixtures, rollout, rollback, scope, and approval-boundary checks', () => {
    const gate = readFileSync(validationGatePath, 'utf8')

    for (const expected of [
      'Owner completeness',
      'Product, technical, QA, security/data, rollback, monitoring, support, and evidence storage owners',
      'Fixture completeness',
      'Staff account label, active parish label, same-parish request label',
      'Fixture safety',
      'Rollout readiness',
      'Forbidden content scan',
      'Scope guard',
      'Final approval boundary',
      'Separate product-owner production approval still required',
      'Latest filled-checklist validation result',
      '| Validation decision | `GO_READY_FOR_PRODUCT_OWNER_APPROVAL` |',
      '| Production accessed during validation | `NO` |',
      '| Migrations applied during validation | `NO` |',
      '| Operational RLS changed during validation | `NO` |',
      '| Secrets/private data found | `NO` |',
    ]) {
      expect(gate).toContain(expected)
    }
  })

  it('defines hard-stop incomplete markers and safe redaction markers', () => {
    const gate = readFileSync(validationGatePath, 'utf8')

    for (const expected of [
      '`UNKNOWN`',
      '`INCOMPLETE`',
      '`PENDING`',
      '`NOT_PROVIDED`',
      '`REQUIRES_HUMAN_CONFIRMATION`',
      '`PROVIDE_`',
      '`TODO`',
      '`TBD`',
      '`REDACTED`',
      '`safe label only`',
      '`do not record raw token`',
    ]) {
      expect(gate).toContain(expected)
    }
  })

  it('forbids secrets, raw tokens, signed URLs, and known QA fixture ids', () => {
    const gate = readFileSync(validationGatePath, 'utf8')

    for (const expected of [
      '`postgresql://`',
      '`SUPABASE_SERVICE_ROLE_KEY=`',
      '`NEXT_PUBLIC_SUPABASE_ANON_KEY=`',
      '`GOOGLE_CLIENT_SECRET=`',
      '`OPENAI_API_KEY=`',
      '`access_token=`',
      '`refresh_token=`',
      '`X-Amz-Signature`',
      '`token=`',
      '`token_hash`',
      '`signedUrl`',
      '`calendarId=`',
      '`eventId=`',
      '735840c9-a276-4b3d-9773-7b350c9fc35c',
      'f4a50f8b-4039-46d7-902f-a40719a12718',
    ]) {
      expect(gate).toContain(expected)
    }
  })

  it('does not accidentally include real credential values or approval overstatements', () => {
    const gate = readFileSync(validationGatePath, 'utf8')

    for (const forbidden of [
      'GO_READY_FOR_PRODUCTION_EXECUTION',
      'PRODUCTION_APPROVED',
      'apply production RLS now',
      'service_role:',
      'Bearer ',
      'sk-',
    ]) {
      expect(gate).not.toContain(forbidden)
    }
  })
})
