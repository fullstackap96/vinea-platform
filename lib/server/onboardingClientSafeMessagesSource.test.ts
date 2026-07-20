import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('onboarding client safe messages', () => {
  it('routes setup load and completion failures through client allowlist helpers', () => {
    const source = readRepoFile('app/dashboard/onboarding/ParishOnboardingPage.tsx')

    expect(source).toContain("from '@/lib/onboardingClientMessages'")
    expect(source).toContain('onboardingLoadErrorMessage')
    expect(source).toContain('onboardingSaveErrorMessage')
    expect(source).toContain('setError(onboardingLoadErrorMessage(settingsData?.error))')
    expect(source).toContain('setError(onboardingLoadErrorMessage(err))')
    expect(source).toContain('setError(onboardingSaveErrorMessage(data?.error))')
    expect(source).toContain('setError(ONBOARDING_COMPLETION_REFRESH_REQUIRED_MESSAGE)')
    expect(source).not.toContain("String(settingsData?.error || 'Could not load parish setup.')")
    expect(source).not.toContain("String(data?.error || 'Could not mark onboarding complete.')")
    expect(source).not.toContain('function messageFromUnknown')
  })

  it('keeps selected parish setup copy and completion behavior intact', () => {
    const source = readRepoFile('app/dashboard/onboarding/ParishOnboardingPage.tsx')

    expect(source).toContain('Onboarding is scoped to {activeParishName}.')
    expect(source).toContain("setMessage('Parish onboarding marked complete.')")
    expect(source).toContain('href="/dashboard/settings"')
  })
})
