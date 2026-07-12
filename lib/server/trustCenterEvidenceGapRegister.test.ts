import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const registerPath = join(
  process.cwd(),
  'docs',
  'TRUST_CENTER_EVIDENCE_GAP_REGISTER_20260701.md'
)

describe('trust center evidence gap register', () => {
  it('is non-runtime and keeps public trust-center publishing blocked', () => {
    const register = readFileSync(registerPath, 'utf8')

    for (const expected of [
      'Status: Prepared as a non-runtime trust-center readiness register only.',
      'Production was not accessed',
      'production flags were not enabled',
      'production navigation was not added',
      'production smoke was not run',
      'migrations were not applied',
      'runtime behavior was not changed',
      'operational RLS was not changed',
      'Google Calendar data was not touched',
      'records were not mutated',
      'storage was not accessed',
      'signed URLs were not created',
      'raw exports were not exposed',
      'raw metadata was not exposed',
      'no secrets were exposed',
      'Current decision state: `INTERNAL TRUST-CENTER GAP REGISTER PREPARED; PUBLIC TRUST CENTER REMAINS NO-GO`',
      'Completion marker: `TRUST_CENTER_EVIDENCE_GAP_REGISTER_20260701`',
      'Public trust-center decision: `NO-GO`',
    ]) {
      expect(register).toContain(expected)
    }
  })

  it('links the trust-center packet and supporting evidence sources', () => {
    const register = readFileSync(registerPath, 'utf8')

    for (const expected of [
      'docs/TRUST_CENTER_READINESS_PACKET_20260627.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_APPROVAL_READINESS_RECORD_20260626.md',
      'docs/BACKUP_RESTORE_RUNBOOK_20260627.md',
      'docs/NONPRODUCTION_RESTORE_DRILL_EVIDENCE_TEMPLATE_20260627.md',
      'docs/NONPRODUCTION_RESTORE_DRILL_EXECUTION_PACKET_20260701.md',
      'docs/NONPRODUCTION_RESTORE_DRILL_EXECUTION_APPROVAL_PACKET_20260701.md',
      'docs/NONPRODUCTION_RESTORE_DRILL_FILLED_APPROVAL_INPUTS_20260701.md',
      'docs/NONPRODUCTION_RESTORE_DRILL_EVIDENCE_20260701_SAFE_REUSABLE_DISPOSABLE_TARGET.md',
      'docs/STORAGE_EXCLUDED_RESTORE_READINESS_DECISION_PACKET_20260701.md',
      'docs/SYNTHETIC_STORAGE_DOCUMENT_RESTORE_SMOKE_APPROVAL_PACKET_20260701.md',
      'docs/SYNTHETIC_STORAGE_DOCUMENT_RESTORE_SMOKE_EVIDENCE_20260701_APPROVED_DISPOSABLE_TARGET.md',
      'docs/SYNTHETIC_STORAGE_DOCUMENT_RESTORE_OWNER_REVIEW_PACKET_20260702.md',
      'docs/DATA_RETENTION_DELETION_POLICY_PROPOSAL_20260627.md',
      'docs/INCIDENT_RESPONSE_RUNBOOK_20260627.md',
      'docs/AI_SAFETY_PERMISSION_SCOPED_RETRIEVAL_POLICY_20260627.md',
      'docs/DATA_EXPORT_ACCESS_CONTROL_POLICY_PROPOSAL_20260630.md',
      'docs/EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_SMOKE_EVIDENCE_TEMPLATE_20260701.md',
    ]) {
      expect(register).toContain(expected)
    }
  })

  it('defines conservative claim rules and blocks certification overstatement', () => {
    const register = readFileSync(registerPath, 'utf8')

    for (const expected of [
      'Formal compliance certification',
      'Do not claim SOC 2, HIPAA, PCI, ISO 27001, or equivalent certification',
      'Production diocesan-grade tenant isolation',
      'Public claim allowed?',
      '`NO`',
      '`LIMITED_INTERNAL`',
      'Do not say:',
      'Vinea is SOC 2 certified.',
      'Vinea production is fully diocesan RLS-ready.',
      'Vinea has completed production backup/restore drills.',
      'Vinea production AI is fully permission-scoped for all generation features.',
      'Vinea production exports are generally available.',
    ]) {
      expect(register).toContain(expected)
    }
  })

  it('tracks the major trust-center evidence gaps and next safe non-production steps', () => {
    const register = readFileSync(registerPath, 'utf8')

    for (const expected of [
      '## Evidence Gap Register',
      '| Production RLS |',
      '| Backup/restore |',
      'Backup/restore runbook, non-production restore-drill evidence template, non-production execution packet, product-owner execution approval packet, filled non-secret approval inputs, approved reusable disposable database reset/replay evidence, app/auth smoke evidence, approved storage-excluded limited wording, synthetic storage/document restore smoke approval packet, synthetic storage/document restore smoke evidence, synthetic storage/document owner review packet, and approved stronger limited non-production wording',
      '`DISPOSABLE DATABASE REPLAY, APP/AUTH SMOKE, SYNTHETIC STORAGE/DOCUMENT SMOKE, AND STRONGER LIMITED NON-PRODUCTION WORDING APPROVED; PRODUCTION RESTORE DRILL PENDING`',
      '| Data retention |',
      '| Incident response |',
      '| AI safety |',
      '| Export controls |',
      '| Family portal |',
      '| Public intake routing |',
      '| Public trust center page |',
      'Continue production restore readiness planning without making public backup/restore claims',
      'Run a non-production tabletop drill for document/family portal and cross-parish exposure scenarios',
      'Keep runtime routing disabled until production enablement checklist is complete',
      'Draft public copy only after required evidence changes from pending to complete',
    ]) {
      expect(register).toContain(expected)
    }
  })

  it('contains a product-owner review checklist and safe internal language', () => {
    const register = readFileSync(registerPath, 'utf8')

    for (const expected of [
      '## Safe Internal Language',
      'Vinea has a strong security and governance foundation',
      'remain intentionally gated behind named approvals and evidence',
      '## Product Owner Review Checklist',
      'Confirm the claim maps to an `Existing evidence` row above.',
      'Confirm the claim does not depend on a `Missing evidence` item.',
      'Confirm no formal certification is implied.',
      'Confirm no production RLS, export, AI, backup, retention, or incident-response claim is overstated.',
      'Confirm screenshots or evidence links are redacted',
      'Confirm the evidence owner and support owner are named for the claim.',
    ]) {
      expect(register).toContain(expected)
    }
  })

  it('does not include obvious credential, token, connection-string, raw ID, or fake evidence material', () => {
    const register = readFileSync(registerPath, 'utf8')

    for (const forbidden of [
      'postgresql://',
      'SUPABASE_SERVICE_ROLE_KEY=',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=',
      'GOOGLE_CLIENT_SECRET=',
      'OPENAI_API_KEY=',
      'access_token=',
      'refresh_token=',
      'sb-',
      'eyJ',
      '00000000-0000-4000-8000-000000000000',
      '00000000-0000-4000-8000-000000000001',
    ]) {
      expect(register).not.toContain(forbidden)
    }
  })
})
