import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()
const evidenceName = 'RELEASE_INTEGRITY_EXACT_HEAD_PREVIEW_EVIDENCE_20260807.md'
const evidence = readFileSync(resolve(repoRoot, 'docs', evidenceName), 'utf8')

describe('release-integrity exact-head Preview evidence', () => {
  it('binds publication, CI, pull request, and Preview to the exact reviewed head', () => {
    expect(evidence).toContain('a92f6b82a26ef159b8e5e159b1db15594bca7e0f')
    expect(evidence).toContain('GitHub PR `#8`')
    expect(evidence).toContain('31211255259')
    expect(evidence).toContain('dpl_4XR99w6RUyC6MwsQq5mUZjPZdG8p')
    expect(evidence).toContain('Preview only; no production target')
  })

  it('records exact health plus the staff allow/deny smoke', () => {
    expect(evidence).toContain('`/api/health` returns `ok: true` | PASS')
    expect(evidence).toContain('`env`, `supabase`, `parishes`, `schema`, `resend`, and `googleOAuth` all `true`')
    expect(evidence).toContain('Same-parish request detail fixture loads | PASS')
    expect(evidence).toContain('Cross-parish request fixture denies generically | PASS')
    expect(evidence).toContain('**PASS**')
    expect(evidence).not.toContain('remains open')
  })

  it('records the complete local release contract without weakening gate status', () => {
    expect(evidence).toContain('complete 15-command local release')
    expect(evidence).toContain('879 files and 3,775 tests')
    expect(evidence).toContain('zero known vulnerabilities')
    expect(evidence).toContain('56 pages generated')
    expect(evidence).toContain('production approvals remain false')
    expect(evidence).toContain('does not approve those AI gates for production')
  })

  it('keeps production-sensitive actions explicitly out of scope', () => {
    for (const marker of [
      'No merge',
      'production deployment',
      'migration',
      'RLS change',
      'record mutation',
      'production-sensitive flag change',
      'remain `NO-GO`',
    ]) {
      expect(evidence).toContain(marker)
    }
  })

  it('contains no credentials, share tokens, raw UUID fixtures, or email addresses', () => {
    expect(evidence).not.toMatch(/_vercel_share=/i)
    expect(evidence).not.toMatch(/(?:password|service_role|anon_key)\s*[:=]/i)
    expect(evidence).not.toMatch(/eyJ[a-zA-Z0-9_-]{20,}/)
    expect(evidence).not.toMatch(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/)
    expect(evidence).not.toMatch(
      /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i,
    )
  })

  it.each([
    'docs/VINEA_CURRENT_STATUS_20260807.md',
    'docs/VINEA_BUILD_STATUS.md',
    'docs/VINEA_DOCUMENTATION_OPERATIONS_INDEX.md',
  ])('is linked from %s', (path) => {
    expect(readFileSync(resolve(repoRoot, path), 'utf8')).toContain(evidenceName)
  })
})
