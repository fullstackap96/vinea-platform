import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const templatePath = join(
  process.cwd(),
  'docs',
  'PUBLIC_INTAKE_ROUTING_DISPOSABLE_QA_EVIDENCE_TEMPLATE.md'
)

describe('public intake routing disposable QA evidence template', () => {
  it('keeps evidence collection limited to disposable environments', () => {
    const template = readFileSync(templatePath, 'utf8')

    for (const expected of [
      'Status: Blank evidence template.',
      'Disposable environment only: `Yes / No`',
      'Not production: `Yes / No`',
      'No real parishioner data copied into this environment: `Yes / No`',
      'Runtime public intake was not wired to the resolver during this evidence run: `Yes / No`',
      'Operational RLS was not changed during this evidence run: `Yes / No`',
    ]) {
      expect(template).toContain(expected)
    }
  })

  it('captures environment identity, forward apply, rollback, and health evidence', () => {
    const template = readFileSync(templatePath, 'utf8')

    for (const expected of [
      '## Environment Identity',
      'Supabase project reference:',
      'Git commit SHA:',
      'Execution packet followed: `Yes / No`',
      '## Forward Migration Candidate Apply Results',
      'docs/sql/public_intake_parish_routing_migration_candidate.sql',
      '## Future `/api/health` Expectations',
      'public intake parish routing columns',
      'public intake domain routing table',
      'public intake token routing table',
      '## Rollback Results',
      'docs/sql/public_intake_parish_routing_rollback_draft.sql',
    ]) {
      expect(template).toContain(expected)
    }
  })

  it('captures resolver cases and public intake regression results', () => {
    const template = readFileSync(templatePath, 'utf8')

    for (const expected of [
      '## Resolver Case Results',
      'Valid active token for active parish returns `token`',
      'Expired token fails closed',
      'Verified active hostname returns `domain`',
      'Valid enabled slug returns `slug`',
      'Forged staff active parish cookie has no effect',
      '## Public Intake Regression Results',
      'Baptism public intake',
      'Durable public intake 429 behavior',
      'Runtime forms still use legacy route behavior',
    ]) {
      expect(template).toContain(expected)
    }
  })

  it('captures automated checks, unresolved risks, cleanup, and sign-off', () => {
    const template = readFileSync(templatePath, 'utf8')

    for (const expected of [
      '## Automated Check Outputs',
      'Targeted validation tests:',
      'Full test suite:',
      'Build:',
      'Lint:',
      '## Unresolved Risks',
      '## Cleanup Confirmation',
      'Temporary Supabase branch/project destroyed: `Yes / No`',
      '## Sign-Off',
      '## Final Decision',
      'Rollback owner:',
      'Promotion readiness checklist completed: `Yes / No`',
      'Promotion readiness checklist location:',
    ]) {
      expect(template).toContain(expected)
    }
  })
})
