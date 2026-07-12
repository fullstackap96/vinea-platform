import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const sourcePath = join(process.cwd(), 'app', 'dashboard', 'requests', 'actions.ts')

describe('request action safe errors', () => {
  it('logs unexpected request workflow failures and returns stable staff-safe messages', () => {
    const source = readFileSync(sourcePath, 'utf8')

    expect(source).toContain('logServerError')
    expect(source).toContain('Could not update request status.')
    expect(source).toContain('Could not check required workflow steps.')
    expect(source).toContain('Could not update workflow step.')
    expect(source).toContain('Could not update assignment.')
    expect(source).toContain('Could not update follow-up date.')
    expect(source).toContain('Could not update waiting-for status.')
    expect(source).toContain('Could not add playbook checklist items.')
    expect(source).toContain('Could not add note.')
    expect(source).toContain('Could not save contact information.')
    expect(source).toContain('Contact information was saved, but baptism details were not.')
    expect(source).toContain(
      'Contact information and intake notes were saved, but funeral details were not.'
    )
    expect(source).toContain(
      'Contact information and intake notes were saved, but wedding details were not.'
    )
    expect(source).toContain(
      'Contact information and intake notes were saved, but OCIA details were not.'
    )
    expect(source).toContain('Could not link request to person. Refresh and try again.')
    expect(source).toContain('Could not create person profile.')

    expect(source).not.toMatch(/return\s+\{\s*ok:\s*false,\s*error:\s*[^}]+\.message/)
    expect(source).not.toContain('error: workflowError.message')
    expect(source).not.toContain('error: checklistError.message')
    expect(source).not.toContain('error: insertErr.message')
    expect(source).not.toContain('error: parishionerErr?.message')
  })
})
