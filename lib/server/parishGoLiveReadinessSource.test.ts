import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

describe('parish go-live readiness onboarding source', () => {
  it('renders read-only go-live and migration readiness from the onboarding page', () => {
    const page = readRepoFile('app/dashboard/onboarding/ParishOnboardingPage.tsx')
    const helper = readRepoFile('lib/parishGoLiveReadiness.ts')

    expect(page).toContain('buildParishGoLiveReadiness({ setupReadiness: readiness })')
    expect(page).toContain('Go-live readiness')
    expect(page).toContain('Migration source prep')
    expect(page).toContain('Before real parish use')
    expect(helper).toContain('ready_for_supervised_pilot')
    expect(helper).toContain('setup_in_progress')

    for (const expected of [
      'ParishSOFT or ParishStaq/Pushpay',
      'PDS, eCatholic, Planning Center, Breeze, or Servant Keeper',
      'Spreadsheets or paper trackers',
      'Verify sacramental record fields manually',
      'not as final sacramental register authority',
    ]) {
      expect(helper).toContain(expected)
    }
  })

  it('does not add import execution, migrations, production claims, or external integrations', () => {
    const page = readRepoFile('app/dashboard/onboarding/ParishOnboardingPage.tsx')
    const helper = readRepoFile('lib/parishGoLiveReadiness.ts')
    const onboardingHelper = readRepoFile('lib/parishOnboardingReadiness.ts')
    const boundaryDoc = readRepoFile('docs/ONBOARDING_READINESS_SAFE_LINK_BOUNDARY_20260708.md')
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(onboardingHelper).toContain('safeDashboardHrefOrFallback')
    expect(onboardingHelper).toContain('settingsHref()')
    expect(boundaryDoc).toContain('read-only onboarding/go-live readiness')
    expect(buildStatus).toContain('Onboarding Readiness Safe Link Boundary')
    expect(roadmap).toContain('Onboarding Readiness safe link boundary')
    expect(sourceOfTruth).toContain('Onboarding Readiness safe link boundary')

    for (const forbidden of [
      ".from('",
      '.from("',
      'insert(',
      'update(',
      'upsert(',
      'delete(',
      'createSignedUrl(',
      'OPENAI_API_KEY',
      'GOOGLE_CLIENT_SECRET',
      'production ready',
      'public trust claim',
    ]) {
      expect(helper.toLowerCase()).not.toContain(forbidden.toLowerCase())
    }

    expect(page).not.toContain('commitImport')
    expect(page).not.toContain('runMigration')
    expect(page).not.toContain('executeMigration')
  })
})
