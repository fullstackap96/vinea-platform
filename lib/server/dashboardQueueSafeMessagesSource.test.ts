import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('dashboard queue safe messages', () => {
  it('keeps communications mutations on the request API with curated client messages', () => {
    const route = readRepoFile('app/api/requests/[id]/communications/route.ts')
    const client = readRepoFile(
      'app/dashboard/communications/DashboardCommunicationsPageClient.tsx',
    )

    expect(
      existsSync(join(repoRoot, 'app/dashboard/communications/actions.ts')),
    ).toBe(false)
    expect(client).toContain('dashboardQueueClientErrorMessage')
    expect(client).toContain("credentials: 'include'")
    expect(client).toContain("source: 'communications_center'")
    expect(client).not.toContain("from './actions'")
    expect(route).not.toContain('error: insertRes.error.message')
    expect(route).not.toContain('error: updateRes.error.message')
    expect(route).toContain("error: 'Invalid follow-up date.'")
  })

  it('keeps intake mutations on scoped APIs with curated client messages', () => {
    const requestRoute = readRepoFile('app/api/requests/[id]/intake-triage/route.ts')
    const intentionRoute = readRepoFile(
      'app/api/mass-intentions/[id]/intake-triage/route.ts',
    )
    const client = readRepoFile('app/dashboard/intake/DashboardIntakePageClient.tsx')

    expect(existsSync(join(repoRoot, 'app/dashboard/intake/actions.ts'))).toBe(false)
    expect(client).not.toContain("from './actions'")
    expect(client).toContain("credentials: 'include'")
    expect(client).toContain('/api/requests/${encodeURIComponent(item.sourceId)}/intake-triage')
    expect(client).toContain(
      '/api/mass-intentions/${encodeURIComponent(item.sourceId)}/intake-triage',
    )
    expect(requestRoute).toContain("dashboardQueueFailureMessage('intakeRequestTriage')")
    expect(intentionRoute).toContain(
      "dashboardQueueFailureMessage('intakeMassIntentionTriage')",
    )
    expect(requestRoute).not.toContain('error: insertRes.error.message')
    expect(requestRoute).not.toContain('error: updateRes.error.message')
    expect(intentionRoute).not.toContain('error: updateError.message')
    expect(requestRoute).toContain("? 'Invalid follow-up date.'")
    expect(intentionRoute).toContain("? 'Invalid Mass date.'")
  })

  it('applies client allowlists to curated action result messages', () => {
    const communications = readRepoFile(
      'app/dashboard/communications/DashboardCommunicationsPageClient.tsx'
    )
    const intake = readRepoFile('app/dashboard/intake/DashboardIntakePageClient.tsx')

    for (const source of [communications, intake]) {
      expect(source).toContain('dashboardQueueClientErrorMessage')
      expect(source).not.toContain('setItemMessage(item.id, result.error)')
      expect(source).not.toContain('`Could not save: ${result.error}`')
    }
  })
})
