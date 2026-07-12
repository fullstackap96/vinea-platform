import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const runbookPath = join(process.cwd(), 'docs', 'BACKUP_RESTORE_RUNBOOK_20260627.md')
const evidencePath = join(
  process.cwd(),
  'docs',
  'NONPRODUCTION_RESTORE_DRILL_EVIDENCE_TEMPLATE_20260627.md'
)
const trustCenterPath = join(process.cwd(), 'docs', 'TRUST_CENTER_READINESS_PACKET_20260627.md')

describe('backup and restore readiness docs', () => {
  it('keeps the backup/restore runbook non-production and non-runtime', () => {
    const runbook = readFileSync(runbookPath, 'utf8')

    for (const expected of [
      'Status: Prepared as a backup/restore readiness runbook only.',
      'Production was not accessed',
      'no migrations were applied',
      'runtime behavior was not changed',
      'operational RLS was not changed',
      'Current backup/restore readiness: `RUNBOOK PREPARED, NON-PRODUCTION DISPOSABLE DATABASE REPLAY AND APP/AUTH SMOKE RECORDED, STORAGE-EXCLUDED WORDING APPROVED FOR LIMITED INTERNAL/SALES-SUPPORT USE, SYNTHETIC STORAGE/DOCUMENT SMOKE EVIDENCE RECORDED, STRONGER LIMITED NON-PRODUCTION WORDING APPROVED, PRODUCTION RESTORE DRILL NOT YET EXECUTED`',
      'Current execution support: `NON-PRODUCTION RESTORE DRILL EXECUTION PACKET AND APPROVAL PACKET PREPARED`',
      'Do not claim production restore readiness until this runbook has been executed in a disposable or explicitly approved non-production environment',
      'Do not run restore commands against production from this runbook without a separate explicit production incident approval.',
      'Do not claim production restore readiness until this runbook has been executed in a disposable or explicitly approved non-production environment and evidence has been recorded.',
      'Non-production restore-drill execution packet: `docs/NONPRODUCTION_RESTORE_DRILL_EXECUTION_PACKET_20260701.md`',
      'Non-production restore-drill execution approval packet: `docs/NONPRODUCTION_RESTORE_DRILL_EXECUTION_APPROVAL_PACKET_20260701.md`',
      'Non-production restore-drill filled approval inputs: `docs/NONPRODUCTION_RESTORE_DRILL_FILLED_APPROVAL_INPUTS_20260701.md`',
      'Non-production restore-drill disposable database replay and app/auth smoke evidence: `docs/NONPRODUCTION_RESTORE_DRILL_EVIDENCE_20260701_SAFE_REUSABLE_DISPOSABLE_TARGET.md`',
      'Storage-excluded restore-readiness decision packet: `docs/STORAGE_EXCLUDED_RESTORE_READINESS_DECISION_PACKET_20260701.md`',
      'Synthetic storage/document restore smoke approval packet: `docs/SYNTHETIC_STORAGE_DOCUMENT_RESTORE_SMOKE_APPROVAL_PACKET_20260701.md`',
      'Synthetic storage/document restore smoke evidence: `docs/SYNTHETIC_STORAGE_DOCUMENT_RESTORE_SMOKE_EVIDENCE_20260701_APPROVED_DISPOSABLE_TARGET.md`',
      'Synthetic storage/document restore owner review packet: `docs/SYNTHETIC_STORAGE_DOCUMENT_RESTORE_OWNER_REVIEW_PACKET_20260702.md`',
      'Current outcome: `Backup/restore runbook prepared; disposable database replay and app/auth smoke evidence recorded; storage-excluded wording approved for limited internal/sales-support use; synthetic storage/document smoke evidence recorded; stronger limited non-production wording approved; production restore evidence pending`',
    ]) {
      expect(runbook).toContain(expected)
    }
  })

  it('defines data coverage, roles, objectives, drill scope, verification, cleanup, and publication gates', () => {
    const runbook = readFileSync(runbookPath, 'utf8')

    for (const expected of [
      '## Roles',
      '| Backup owner | Owns backup/restore runbook and evidence | `PENDING` |',
      '## Data Coverage',
      'Supabase Postgres database',
      'Supabase Storage',
      'Supabase Auth',
      'Environment configuration',
      'External integrations',
      '## Recovery Objectives',
      'Recovery point objective',
      'Recovery time objective',
      '## Non-Production Restore Drill Scope',
      'Verify request/detail/document/family portal smoke only with safe synthetic records.',
      'Use `docs/NONPRODUCTION_RESTORE_DRILL_EXECUTION_PACKET_20260701.md` to guide the drill only after an explicitly approved disposable or non-production target is selected and the approval gate in `docs/NONPRODUCTION_RESTORE_DRILL_EXECUTION_APPROVAL_PACKET_20260701.md` is complete.',
      '## Production Incident Restore Approval Gates',
      '## Verification Checklist',
      'Direct storage access is denied.',
      'Family portal does not expose internal notes, AI notes, audit logs, token hashes, or private parish data.',
      '## Cleanup Requirements',
      '## Trust-Center Publication Gate',
    ]) {
      expect(runbook).toContain(expected)
    }
  })

  it('provides a non-production restore-drill evidence template with privacy and cleanup checks', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Status: Template prepared only.',
      'No restore drill was executed while preparing this template.',
      'Non-production restore-drill execution packet: `docs/NONPRODUCTION_RESTORE_DRILL_EXECUTION_PACKET_20260701.md`',
      'Production was not accessed',
      'no migrations were applied',
      'runtime behavior was not changed',
      'operational RLS was not changed',
      'Confirmed not production',
      'Production credentials used? | `No`',
      'Production private documents restored? | `No`',
      '## Pre-Restore Baseline',
      '## Restore Execution',
      '## Post-Restore Verification',
      'Staff authorization limits parish scope',
      'Direct storage access denied',
      'Family portal safe page does not expose internal data',
      '## Privacy And Data Handling Review',
      'No secrets in evidence',
      '## Cleanup Confirmation',
      'Restore readiness claim allowed? | `No`',
      'Current outcome: `Evidence template prepared; non-production restore drill not executed`',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('updates the trust-center packet without allowing backup/restore overclaims', () => {
    const trustCenter = readFileSync(trustCenterPath, 'utf8')

    for (const expected of [
      'Backup/restore runbook: `docs/BACKUP_RESTORE_RUNBOOK_20260627.md`',
      'Non-production restore-drill evidence template: `docs/NONPRODUCTION_RESTORE_DRILL_EVIDENCE_TEMPLATE_20260627.md`',
      'Non-production restore-drill execution packet: `docs/NONPRODUCTION_RESTORE_DRILL_EXECUTION_PACKET_20260701.md`',
      'Non-production restore-drill execution approval packet: `docs/NONPRODUCTION_RESTORE_DRILL_EXECUTION_APPROVAL_PACKET_20260701.md`',
      'Non-production restore-drill filled approval inputs: `docs/NONPRODUCTION_RESTORE_DRILL_FILLED_APPROVAL_INPUTS_20260701.md`',
      'Non-production restore-drill disposable database replay and app/auth smoke evidence: `docs/NONPRODUCTION_RESTORE_DRILL_EVIDENCE_20260701_SAFE_REUSABLE_DISPOSABLE_TARGET.md`',
      'Storage-excluded restore-readiness decision packet: `docs/STORAGE_EXCLUDED_RESTORE_READINESS_DECISION_PACKET_20260701.md`',
      'Synthetic storage/document restore smoke approval packet: `docs/SYNTHETIC_STORAGE_DOCUMENT_RESTORE_SMOKE_APPROVAL_PACKET_20260701.md`',
      'Synthetic storage/document restore smoke evidence: `docs/SYNTHETIC_STORAGE_DOCUMENT_RESTORE_SMOKE_EVIDENCE_20260701_APPROVED_DISPOSABLE_TARGET.md`',
      'Synthetic storage/document restore owner review packet: `docs/SYNTHETIC_STORAGE_DOCUMENT_RESTORE_OWNER_REVIEW_PACKET_20260702.md`',
      '| Backups | Backup/restore runbook, non-production restore-drill evidence template, non-production restore-drill execution packet, product-owner execution approval packet, filled non-secret approval inputs, approved reusable disposable database reset/replay evidence, app/auth smoke evidence, storage-excluded restore-readiness decision packet, synthetic storage/document restore smoke approval packet, synthetic storage/document restore smoke evidence, and synthetic storage/document owner review packet exist, but production restore drills are not complete | `RUNBOOK, EXECUTION PACKET, APPROVAL PACKET, FILLED INPUTS, DISPOSABLE DATABASE REPLAY, APP/AUTH SMOKE EVIDENCE, STORAGE-EXCLUDED WORDING APPROVED FOR LIMITED INTERNAL/SALES-SUPPORT USE, SYNTHETIC STORAGE/DOCUMENT SMOKE EVIDENCE RECORDED, AND STRONGER LIMITED NON-PRODUCTION WORDING APPROVED` | Production restore, real document recovery, signed URL restore behavior, production RPO/RTO, and public trust-center backup/restore claims remain blocked |',
      'Current status: `RUNBOOK, EXECUTION PACKET, APPROVAL PACKET, FILLED INPUTS, DISPOSABLE DATABASE REPLAY, APP/AUTH SMOKE EVIDENCE, STORAGE-EXCLUDED WORDING APPROVED FOR LIMITED INTERNAL/SALES-SUPPORT USE, SYNTHETIC STORAGE/DOCUMENT SMOKE EVIDENCE RECORDED, STRONGER LIMITED NON-PRODUCTION WORDING APPROVED, PRODUCTION RESTORE DRILL NOT YET EXECUTED`',
      'Do not claim backup/restore readiness until this is documented and tested.',
      'Execute a non-production restore drill and record evidence using `docs/NONPRODUCTION_RESTORE_DRILL_EVIDENCE_TEMPLATE_20260627.md`.',
      'Backup restore drills have been completed and documented.',
    ]) {
      expect(trustCenter).toContain(expected)
    }
  })
})
