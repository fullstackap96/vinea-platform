import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const filledInputsPath = join(
  process.cwd(),
  'docs',
  'EXPORT_AUDIT_REVIEW_NONPRODUCTION_DRILL_FILLED_INPUTS_20260630.md',
)
const trustCenterPath = join(process.cwd(), 'docs', 'TRUST_CENTER_READINESS_PACKET_20260627.md')

describe('export audit review non-production drill filled inputs', () => {
  it('fills non-secret labels while keeping the drill unexecuted', () => {
    const filledInputs = readFileSync(filledInputsPath, 'utf8')

    for (const expected of [
      'Status: Filled as non-secret drill input labels only.',
      'Production was not accessed',
      'production export flags were not enabled',
      'staff-facing production export UI was not added',
      'migrations were not applied',
      'runtime behavior was not changed',
      'operational RLS was not changed',
      'Google Calendar data was not touched',
      'records were not mutated',
      'export routes were not called',
      'audit metadata was not written',
      'no secrets were exposed',
      'Current decision state: `EXPORT AUDIT REVIEW NON-PRODUCTION DRILL INPUTS FILLED; DRILL NOT EXECUTED; PRODUCTION EXPORTS REMAIN NO-GO`',
      'Completion marker: `EXPORT_AUDIT_REVIEW_NONPRODUCTION_DRILL_FILLED_INPUTS_20260630`',
    ]) {
      expect(filledInputs).toContain(expected)
    }
  })

  it('derives labels from completed live non-production smoke evidence', () => {
    const filledInputs = readFileSync(filledInputsPath, 'utf8')

    for (const expected of [
      '`docs/REQUEST_LIST_BASIC_EXPORT_LIVE_NONPRODUCTION_SMOKE_EVIDENCE_20260630.md`',
      '`docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_LIVE_NONPRODUCTION_SMOKE_EVIDENCE_20260630.md`',
      'NON_PRODUCTION_APP_URL=localhost non-production',
      'SAFE_EXPORT_QA_STAFF=Existing non-production QA staff environment values, not printed',
      'SAFE_EXPORT_PARISH_A=Derived active parish from QA staff active parish memberships',
      'SAFE_EXPORT_SAME_PARISH_REQUEST=Derived same-parish request from QA staff active parish memberships',
      'SAFE_EXPORT_CROSS_PARISH_DENIED_REQUEST=Forged unauthorized active parish cookie denial against authenticated QA staff session',
      'SAFE_DOCUMENT_MANIFEST_EXPORT_DOCUMENT_SET=Derived same-parish request-document metadata from QA staff active parish memberships',
      'EXPORT_DRILL_FAMILY_OR_UNAUTH_DENIAL_METHOD=Unauthenticated direct route access as family-facing substitute',
      'ROLLBACK_OWNER_NAME=Codex local QA operator',
    ]) {
      expect(filledInputs).toContain(expected)
    }
  })

  it('keeps execution boundaries and flag requirements explicit', () => {
    const filledInputs = readFileSync(filledInputsPath, 'utf8')

    for (const expected of [
      'These labels are enough to prepare a drill execution request, but they are not proof that a live drill has been executed today.',
      'The local non-production app target is running.',
      'The local app is backed by the approved non-production/shared-QA environment.',
      '`QA_STAFF_EMAIL` and `QA_STAFF_PASSWORD` are present by name only.',
      'Export runtime flags are off before baseline.',
      '`VINEA_EXPORT_RUNTIME=ENABLED`',
      '`VINEA_EXPORT_RUNTIME_ACK=APPROVED_EXPORT_RUNTIME_QA`',
      '`VINEA_EXPORT_RUNTIME_ENV=NON_PRODUCTION`',
      'Runtime flags are disabled again for rollback verification.',
      'Any safe audit metadata written by the drill is expected and recorded in the evidence template.',
    ]) {
      expect(filledInputs).toContain(expected)
    }
  })

  it('excludes secrets and sensitive fixture identifiers', () => {
    const filledInputs = readFileSync(filledInputsPath, 'utf8')

    for (const expected of [
      'They do not include raw parish ids',
      'request ids',
      'document ids',
      'passwords',
      'session cookies',
      'Supabase keys',
      'database URLs',
      'Google OAuth tokens',
      'OpenAI keys',
      'family portal tokens',
      'signed URLs',
      'storage paths',
      'original filenames',
      'raw CSV contents',
      'raw manifests',
      'notes',
      'communications',
      'AI material',
      'sacramental/canonical details',
    ]) {
      expect(filledInputs).toContain(expected)
    }

    for (const forbidden of [
      'postgresql://',
      'SUPABASE_SERVICE_ROLE_KEY=',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=',
      'GOOGLE_CLIENT_SECRET=',
      'OPENAI_API_KEY=',
      'access_token=',
      'refresh_token=',
      'sb_secret_',
      'eyJ',
    ]) {
      expect(filledInputs).not.toContain(forbidden)
    }
  })

  it('is linked from the trust-center readiness packet as filled but unexecuted', () => {
    const trustCenter = readFileSync(trustCenterPath, 'utf8')

    for (const expected of [
      'Export audit review non-production drill filled inputs: `docs/EXPORT_AUDIT_REVIEW_NONPRODUCTION_DRILL_FILLED_INPUTS_20260630.md`',
      'The filled drill inputs convert the prior live non-production export smoke evidence into non-secret labels for a future drill execution request.',
      'These export audit review documents do not enable production exports, add runtime monitoring, or approve staff-facing export UI.',
    ]) {
      expect(trustCenter).toContain(expected)
    }
  })
})
