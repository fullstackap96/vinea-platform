import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const filledInputsPath = join(
  process.cwd(),
  'docs',
  'NONPRODUCTION_RESTORE_DRILL_FILLED_APPROVAL_INPUTS_20260701.md'
)

describe('non-production restore drill filled approval inputs', () => {
  it('is label-prep only and preserves the no-execution boundary', () => {
    const inputs = readFileSync(filledInputsPath, 'utf8')

    for (const expected of [
      'Status: Prepared as non-secret filled approval inputs only.',
      'This document does not approve execution by itself.',
      'No restore drill was executed',
      'production was not accessed',
      'production flags were not enabled',
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
      'Current decision state: `NON-PRODUCTION RESTORE DRILL FILLED APPROVAL INPUTS PREPARED; RESTORE DRILL NOT APPROVED OR EXECUTED; BACKUP/RESTORE PUBLIC CLAIMS REMAIN NO-GO`',
      'Completion marker: `NONPRODUCTION_RESTORE_DRILL_FILLED_APPROVAL_INPUTS_20260701`',
    ]) {
      expect(inputs).toContain(expected)
    }
  })

  it('links the approval packet, execution packet, and evidence template', () => {
    const inputs = readFileSync(filledInputsPath, 'utf8')

    for (const expected of [
      'docs/NONPRODUCTION_RESTORE_DRILL_EXECUTION_APPROVAL_PACKET_20260701.md',
      'docs/NONPRODUCTION_RESTORE_DRILL_EXECUTION_PACKET_20260701.md',
      'docs/NONPRODUCTION_RESTORE_DRILL_EVIDENCE_TEMPLATE_20260627.md',
      'docs/NONPRODUCTION_RESTORE_DRILL_EVIDENCE_20260701_SAFE_REUSABLE_DISPOSABLE_TARGET.md',
    ]) {
      expect(inputs).toContain(expected)
    }
  })

  it('fills every required target label with a reviewable non-secret value', () => {
    const inputs = readFileSync(filledInputsPath, 'utf8')

    for (const expected of [
      '`RESTORE_DRILL_TARGET_TYPE` | `approved reusable disposable Supabase project` | `READY_FOR_PRODUCT_OWNER_REVIEW`',
      '`RESTORE_DRILL_TARGET_LABEL` | `Safe reusable disposable Supabase restore-drill target` | `READY_FOR_PRODUCT_OWNER_REVIEW`',
      '`RESTORE_DRILL_TARGET_HOST_OR_PROJECT_REF_LABEL` | `Approved reusable disposable Supabase project label: kikqtorplsswepqitjys` | `READY_FOR_PRODUCT_OWNER_REVIEW`',
      '`RESTORE_DRILL_APP_URL_LABEL` | `Local or preview non-production Vinea app label, only if explicitly approved for this drill; otherwise not used` | `READY_FOR_PRODUCT_OWNER_REVIEW`',
      '`RESTORE_DRILL_BACKUP_SOURCE_LABEL` | `Repo-owned schema replay plus approved non-production seed/synthetic fixture source; no raw backup URL` | `READY_FOR_PRODUCT_OWNER_REVIEW`',
      '`RESTORE_DRILL_DATABASE_SCOPE_LABEL` | `Non-production database schema replay and safe fixture verification only` | `READY_FOR_PRODUCT_OWNER_REVIEW`',
      '`RESTORE_DRILL_STORAGE_SCOPE_LABEL` | `excluded unless a separate synthetic-only storage scope is explicitly approved in the future prompt` | `READY_FOR_PRODUCT_OWNER_REVIEW`',
      '`RESTORE_DRILL_AUTH_SCOPE_LABEL` | `Safe non-production staff fixture or service-level substitute; no password/session evidence` | `READY_FOR_PRODUCT_OWNER_REVIEW`',
      '`RESTORE_DRILL_INTEGRATION_SCOPE_LABEL` | `Integrations disabled or degraded; no Google Calendar, email, OpenAI, or external credential use` | `READY_FOR_PRODUCT_OWNER_REVIEW`',
      '`RESTORE_DRILL_CLEANUP_PLAN_LABEL` | `Reset or clean only the approved reusable disposable restore-drill target; no production/shared-QA cleanup` | `READY_FOR_PRODUCT_OWNER_REVIEW`',
      '`RESTORE_DRILL_EVIDENCE_FILE_LABEL` | `docs/NONPRODUCTION_RESTORE_DRILL_EVIDENCE_20260701_SAFE_REUSABLE_DISPOSABLE_TARGET.md` | `READY_FOR_PRODUCT_OWNER_REVIEW`',
    ]) {
      expect(inputs).toContain(expected)
    }
  })

  it('fills recommended owner names and preserves future approval wording', () => {
    const inputs = readFileSync(filledInputsPath, 'utf8')

    for (const expected of [
      '| Product owner | `Alex Perez` | `READY_FOR_PRODUCT_OWNER_REVIEW` |',
      '| Backup owner | `Codex local QA operator` | `READY_FOR_PRODUCT_OWNER_REVIEW` |',
      '| Restore operator | `Codex local QA operator` | `READY_FOR_PRODUCT_OWNER_REVIEW` |',
      '| Security/data owner | `Alex Perez` | `READY_FOR_PRODUCT_OWNER_REVIEW` |',
      '| Environment owner | `Alex Perez` | `READY_FOR_PRODUCT_OWNER_REVIEW` |',
      '| Cleanup owner | `Codex local QA operator` | `READY_FOR_PRODUCT_OWNER_REVIEW` |',
      '| Evidence owner | `Codex local QA operator` | `READY_FOR_PRODUCT_OWNER_REVIEW` |',
      'Do not use this draft until the product owner has reviewed the labels above.',
      'APPROVED_NONPRODUCTION_RESTORE_DRILL_EXECUTION',
      'After execution, update docs/NONPRODUCTION_RESTORE_DRILL_EVIDENCE_20260701_SAFE_REUSABLE_DISPOSABLE_TARGET.md, run checks, and keep public backup/restore readiness claims NO-GO until evidence is reviewed and explicitly approved.',
    ]) {
      expect(inputs).toContain(expected)
    }
  })

  it('does not include obvious credential, token, connection-string, raw ID, or executable-command material', () => {
    const inputs = readFileSync(filledInputsPath, 'utf8')

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
      'supabase db reset',
      'supabase db dump',
      'psql ',
      'pg_restore',
      '00000000-0000-4000-8000-000000000000',
      '00000000-0000-4000-8000-000000000001',
    ]) {
      expect(inputs).not.toContain(forbidden)
    }
  })
})
