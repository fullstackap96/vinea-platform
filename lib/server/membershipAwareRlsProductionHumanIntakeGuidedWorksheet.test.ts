import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const worksheetPath = join(
  process.cwd(),
  'docs',
  'MEMBERSHIP_AWARE_RLS_PRODUCTION_HUMAN_INTAKE_GUIDED_WORKSHEET_20260629.md'
)

describe('membership-aware RLS production human intake guided worksheet', () => {
  it('is explicitly non-executing and keeps sensitive systems untouched', () => {
    const worksheet = readFileSync(worksheetPath, 'utf8')

    for (const expected of [
      'Status: Product-owner worksheet prepared only.',
      'Production was not accessed',
      'no migrations were applied',
      'runtime behavior was not changed',
      'operational RLS was not changed',
      'Google Calendar data was not touched',
      'records were not mutated',
      'no secrets were exposed',
    ]) {
      expect(worksheet).toContain(expected)
    }
  })

  it('links the checklist and validation gate that govern the worksheet', () => {
    const worksheet = readFileSync(worksheetPath, 'utf8')

    for (const expected of [
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_HUMAN_INTAKE_CHECKLIST_20260629.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_HUMAN_INTAKE_VALIDATION_GATE_20260629.md',
    ]) {
      expect(worksheet).toContain(expected)
    }
  })

  it('asks product-owner-friendly questions for every required owner role', () => {
    const worksheet = readFileSync(worksheetPath, 'utf8')

    for (const expected of [
      '| Product owner | Who can approve or stop the production rollout?',
      '| Technical owner | Who will run or supervise the migration, health checks, and rollback mechanics?',
      '| QA owner | Who will run and review the production-safe smoke tests?',
      '| Security/data owner | Who is responsible for privacy, redaction, and cross-parish safety approval?',
      '| Rollback owner | Who can make and execute the rollback decision during the rollout window?',
      '| Monitoring owner | Who will watch health, auth, storage, family portal, and error signals?',
      '| Support owner | Who handles support or customer communication escalation?',
      '| Evidence storage owner | Who stores and redacts rollout evidence?',
    ]) {
      expect(worksheet).toContain(expected)
    }
  })

  it('asks for safe fixture labels and explicit cleanup planning', () => {
    const worksheet = readFileSync(worksheetPath, 'utf8')

    for (const expected of [
      '| Staff account | Which staff account label will be used for smoke testing?',
      '| Active parish | Which parish label should be selected during smoke testing?',
      '| Active parish id | Is the id safe to record? If not, use redaction.',
      '| Cross-parish denial parish or substitute | What safe parish/request label should prove cross-parish denial?',
      '| Same-parish request | Which non-sensitive same-parish request label should load successfully?',
      '| Cross-parish denied request | Which request label should return generic denied/not-found behavior?',
      '| Workflow step | Which workflow step label belongs to the same-parish request?',
      '| Staff test document | What synthetic staff-facing document label should be used?',
      '| Family test document | What synthetic family-facing document label should be used?',
      '| Family portal token plan | How will a portal token be created and cleaned up without recording it?',
      '| Cleanup plan | How will documents, tokens, and changed request state be cleaned up?',
    ]) {
      expect(worksheet).toContain(expected)
    }
  })

  it('includes a fill-in prompt that preserves the separate production approval boundary', () => {
    const worksheet = readFileSync(worksheetPath, 'utf8')

    for (const expected of [
      'Copy-Paste Prompt For The Product Owner',
      'Replace bracketed placeholders with safe, non-secret values only.',
      'Preserve any unknown value as UNKNOWN.',
      'After filling the checklist, validate it using docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_HUMAN_INTAKE_VALIDATION_GATE_20260629.md',
      'keep production RLS NO-GO unless every required field is complete',
      'a separate final product-owner approval prompt is provided',
    ]) {
      expect(worksheet).toContain(expected)
    }
  })

  it('records the current validation result as ready for separate product-owner approval', () => {
    const worksheet = readFileSync(worksheetPath, 'utf8')

    for (const expected of [
      'Current decision: `GO_READY_FOR_PRODUCT_OWNER_APPROVAL`',
      'The source checklist now contains safe owner names, safe fixture labels, rollout timing, rollback timing, monitoring notes, support notes, and evidence-storage notes.',
      'The source checklist does not contain passwords, database URLs, service-role keys, raw portal tokens, token hashes, signed URLs, private document contents, or private parish data.',
      'Production remains blocked until the product owner provides a separate explicit production approval prompt.',
    ]) {
      expect(worksheet).toContain(expected)
    }
  })

  it('forbids secrets, private parish data, and production-ready overstatements', () => {
    const worksheet = readFileSync(worksheetPath, 'utf8')

    for (const expected of [
      'Passwords.',
      'Database URLs or connection strings.',
      'Supabase service-role keys or anon keys.',
      'OAuth secrets, access tokens, refresh tokens, authorization codes, or Google Calendar ids.',
      'OpenAI API keys.',
      'Raw family portal tokens, token hashes, or signed document URLs.',
      'Sensitive parishioner names',
    ]) {
      expect(worksheet).toContain(expected)
    }

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
      'GO_READY_FOR_PRODUCTION_EXECUTION',
      'PRODUCTION_APPROVED',
      'apply production RLS now',
      'service_role:',
      'Bearer ',
      'sk-',
    ]) {
      expect(worksheet).not.toContain(forbidden)
    }
  })
})
