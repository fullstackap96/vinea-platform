import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const scriptPath = join(
  process.cwd(),
  'scripts',
  'run-membership-aware-rls-shared-qa-route-smoke.mjs'
)

describe('membership-aware RLS shared QA route smoke runner', () => {
  it('requires explicit confirmation and only permits shared QA app credentials', () => {
    const script = readFileSync(scriptPath, 'utf8')

    for (const expected of [
      'VINEA_MEMBERSHIP_RLS_SHARED_QA_ROUTE_SMOKE_CONFIRM',
      'MEMBERSHIP_AWARE_RLS_SHARED_QA_ROUTE_SMOKE',
      'gnfomgsuottcuueasfvi',
      'Refusing non-shared-QA app host',
      'kikqtorplsswepqitjys',
      'vinea_active_parish_id',
      'activeParishCookieUsed',
    ]) {
      expect(script).toContain(expected)
    }
  })

  it('covers health, staff workflow updates, request detail, documents, storage privacy, family portal, and audit events', () => {
    const script = readFileSync(scriptPath, 'utf8')

    for (const expected of [
      '/api/health',
      'authenticated_request_status_assignment_followup_update',
      'authenticated_request_note_insert',
      'authenticated_workflow_step_update',
      '/detail-access',
      'staff_document_upload',
      'staff_signed_url_route',
      'direct_storage_privacy',
      'staff_document_review',
      'staff_portal_token_create',
      'family_portal_page_safety',
      'family_portal_document_upload',
      'audit_events_for_document_and_portal_actions',
    ]) {
      expect(script).toContain(expected)
    }
  })

  it('does not expose token hashes or internal staff-only notes through the family portal assertion', () => {
    const script = readFileSync(scriptPath, 'utf8')

    expect(script).toContain('tokenHashExposed')
    expect(script).toContain('token.text.includes')
    expect(script).toContain('unsafeMarkers')
    expect(script).toContain('private staff note')
    expect(script).toContain('Internal Notes')
    expect(script).toContain('token_hash')
  })
})
