import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const checklistPath = join(
  process.cwd(),
  'docs',
  'MEMBERSHIP_AWARE_RLS_PRODUCTION_HUMAN_INTAKE_CHECKLIST_20260629.md'
)

describe('membership-aware RLS production human intake checklist', () => {
  it('is explicitly non-executing and keeps production RLS blocked', () => {
    const checklist = readFileSync(checklistPath, 'utf8')

    for (const expected of [
      'Status: Human-fillable checklist prepared only.',
      'Production was not accessed',
      'no migrations were applied',
      'runtime behavior was not changed',
      'operational RLS was not changed',
      'Google Calendar data was not touched',
      'Current decision: `GO_READY_FOR_PRODUCT_OWNER_APPROVAL`',
      'Checklist decision: `GO_READY_FOR_PRODUCT_OWNER_APPROVAL`',
      'This decision means the non-secret intake values are filled enough to ask for a separate explicit product-owner production approval prompt.',
    ]) {
      expect(checklist).toContain(expected)
    }
  })

  it('links the readiness packet, capture form, and blocker register', () => {
    const checklist = readFileSync(checklistPath, 'utf8')

    for (const expected of [
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_READINESS_PACKET_20260629.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_OWNER_FIXTURE_CAPTURE_FORM_20260629.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_BLOCKER_REGISTER_20260628.md',
    ]) {
      expect(checklist).toContain(expected)
    }
  })

  it('asks for all required owner roles in plain operator-friendly language', () => {
    const checklist = readFileSync(checklistPath, 'utf8')

    for (const expected of [
      '| Product owner |',
      '| Technical owner |',
      '| QA owner |',
      '| Security/data owner |',
      '| Rollback owner |',
      '| Monitoring owner |',
      '| Support owner |',
      '| Evidence storage owner |',
      'Owner roll call status: `COMPLETE`',
      'Alex Perez - Product Owner',
      'Alex Perez - Technical Owner',
      'Alex Perez - QA Owner',
      'Alex Perez - Security/Data Owner',
      'Alex Perez - Rollback Owner - available during rollout window',
      'Alex Perez - Monitoring Owner',
      'Alex Perez - Support Owner',
      'Alex Perez - Evidence Owner',
    ]) {
      expect(checklist).toContain(expected)
    }
  })

  it('asks for safe fixture labels without requiring raw secrets or private data', () => {
    const checklist = readFileSync(checklistPath, 'utf8')

    for (const expected of [
      '| Staff account |',
      '| Active parish |',
      '| Active parish id |',
      '| Cross-parish denial parish or substitute |',
      '| Same-parish request |',
      '| Cross-parish denied request |',
      '| Workflow step |',
      '| Staff test document |',
      '| Family test document |',
      '| Family portal token plan |',
      '| Cleanup plan |',
      'Safe smoke fixture status: `COMPLETE`',
      'Production RLS Smoke Staff Account - no password recorded',
      'Production RLS Smoke Parish A',
      'Production RLS Denial Parish B',
      'Production RLS Smoke Request A - non-sensitive',
      'Production RLS Denied Request B - generic denial expected',
      'Production RLS Smoke Workflow Step - document safe',
      'Vinea production RLS smoke test staff document - synthetic file only',
      'Vinea production RLS smoke test family document - synthetic file only',
    ]) {
      expect(checklist).toContain(expected)
    }
  })

  it('captures rollout, rollback, monitoring, support, evidence, and final approval requirements', () => {
    const checklist = readFileSync(checklistPath, 'utf8')

    for (const expected of [
      '| Proposed production rollout window |',
      '| Rollback decision deadline |',
      '| Rollback owner availability |',
      '| Monitoring channel |',
      '| Support escalation path |',
      '| Evidence storage location |',
      'Final approval prompt status: `REQUIRED_SEPARATELY`',
      '2026-07-01 8:00-8:30 PM Central',
      '2026-07-01 8:20 PM Central',
      'Alex Perez confirmed available during rollout window',
      'Local Codex session and Vercel/Supabase dashboards',
      'Alex Perez reviews issues and pauses rollout if needed',
      'Production target app host without credentials.',
      'Production target database host without connection string.',
      'Production-intended commit or release label.',
    ]) {
      expect(checklist).toContain(expected)
    }
  })

  it('forbids secrets, raw tokens, signed URLs, and sensitive parish data', () => {
    const checklist = readFileSync(checklistPath, 'utf8')

    for (const expected of [
      'Passwords.',
      'Database URLs or connection strings.',
      'Supabase service-role keys or anon keys.',
      'OAuth secrets, access tokens, refresh tokens, or authorization codes.',
      'OpenAI API keys.',
      'Raw family portal tokens or token hashes.',
      'Signed document URLs.',
      'Private document contents.',
      'Internal note bodies.',
      'AI prompts, raw AI outputs, or private AI audit payloads.',
      'Sensitive parishioner names',
      'Google Calendar event ids, calendar ids, or real parish calendar data.',
    ]) {
      expect(checklist).toContain(expected)
    }
  })

  it('does not contain credential-like values, raw tokens, signed URLs, or known QA fixture ids', () => {
    const checklist = readFileSync(checklistPath, 'utf8')

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
      expect(checklist).not.toContain(forbidden)
    }
  })
})
