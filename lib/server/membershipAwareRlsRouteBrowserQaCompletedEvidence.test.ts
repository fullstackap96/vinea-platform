import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const evidencePath = join(
  process.cwd(),
  'docs',
  'MEMBERSHIP_AWARE_RLS_ROUTE_BROWSER_QA_EVIDENCE_20260626_COMPLETED.md'
)
const scriptPath = join(process.cwd(), 'scripts', 'run-membership-aware-rls-route-browser-qa.mjs')

describe('membership-aware RLS route/browser QA completed evidence', () => {
  it('records disposable-only safety boundaries and avoids operational RLS promotion', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Target app host: `kikqtorplsswepqitjys.supabase.co`',
      'Shared QA project `gnfomgsuottcuueasfvi` touched: `No`',
      'Operational RLS applied to shared QA or production: `No`',
      'Operational RLS candidate moved into `supabase/migrations`: `No`',
      'Secret printed or committed: `No`',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('records health, document, storage, family portal, and audit pass evidence', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      '"check": "api_health"',
      '"schema": true',
      '"check": "request_detail_access_api"',
      '"check": "staff_document_upload"',
      '"check": "staff_signed_url_route"',
      '"check": "direct_storage_privacy"',
      '"denied": true',
      '"check": "family_portal_page_safety"',
      '"unsafeMarkerFound": null',
      '"check": "family_portal_document_upload"',
      '"check": "audit_events_for_document_and_portal_actions"',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('keeps the route QA runner guarded to the approved disposable project', () => {
    const script = readFileSync(scriptPath, 'utf8')

    for (const expected of [
      'MEMBERSHIP_AWARE_RLS_ROUTE_BROWSER_QA',
      'gnfomgsuottcuueasfvi',
      'kikqtorplsswepqitjys',
      'Refusing shared QA project',
      'Refusing non-disposable app host',
      'tokenHashExposed',
      'direct storage download unexpectedly succeeded',
    ]) {
      expect(script).toContain(expected)
    }
  })
})
