import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()
const templatePath =
  'docs/NEXT_PROXY_STAFF_AUTH_NONPRODUCTION_QA_EVIDENCE_TEMPLATE_20260708.md'

function read(relativePath: string) {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('Next proxy staff auth non-production QA evidence template', () => {
  it('is explicitly non-production, label-only, and production NO-GO', () => {
    const template = read(templatePath)

    expect(template).toContain('NEXT PROXY STAFF AUTH NON-PRODUCTION QA NOT EXECUTED')
    expect(template).toContain('RUNTIME AUTH BEHAVIOR UNCHANGED')
    expect(template).toContain('PRODUCTION DASHBOARD AUTH CHANGES REMAIN NO-GO')
    expect(template).toContain('Use labels only.')
    expect(template).toContain('Production rollout decision: `NO-GO`')
  })

  it('covers the browser auth smoke and forbidden behavior checks needed after implementation', () => {
    const template = read(templatePath)

    for (const requiredText of [
      '`/api/health`',
      'Signed-out `/dashboard` visit',
      'Allowlisted staff login',
      'Parish A active database staff login',
      'Parish B active database staff login',
      'Inactive staff login',
      'Unauthorized email login',
      'Selected parish switch after login',
      'Service-role client used inside `proxy.ts`',
      '`primary_parish_id()` called from `proxy.ts` after implementation',
      'Exports, AI, storage, signed URLs, communications, certificates, or Google Calendar touched',
    ]) {
      expect(template).toContain(requiredText)
    }
  })

  it('is referenced by the proxy auth implementation approval packet', () => {
    const packet = read('docs/NEXT_PROXY_STAFF_AUTH_MULTI_PARISH_APPROVAL_PACKET_20260708.md')

    expect(packet).toContain(templatePath)
    expect(packet).toContain('Evidence must remain label-only')
  })

  it('does not contain obvious secret-shaped values', () => {
    const template = read(templatePath)

    for (const forbidden of [
      'postgresql://',
      'SUPABASE_SERVICE_ROLE_KEY=',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=',
      'OPENAI_API_KEY=',
      'GOOGLE_CLIENT_SECRET=',
      'Bearer ',
      'sk-',
      'signedUrl',
      'token_hash:',
    ]) {
      expect(template).not.toContain(forbidden)
    }
  })
})
