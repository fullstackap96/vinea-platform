import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

function read(relativePath: string): string {
  return readFileSync(join(root, relativePath), 'utf8')
}

describe('Onboarding latest-response boundary', () => {
  const card = read('app/dashboard/DashboardOnboardingCard.tsx')
  const page = read('app/dashboard/onboarding/ParishOnboardingPage.tsx')

  it('gives each onboarding surface abortable newest-load ownership', () => {
    for (const source of [card, page]) {
      expect(source).toContain('const loadSequenceRef = useRef(0)')
      expect(source).toContain('const loadAbortRef = useRef<AbortController | null>(null)')
      expect(source).toContain('const loadSequence = ++loadSequenceRef.current')
      expect(source).toContain('loadAbortRef.current?.abort()')
      expect(source).toContain('signal: controller.signal')
      expect(source).toContain('const isLatestLoad = () => loadSequence === loadSequenceRef.current')
      expect(source).toContain('if (!isLatestLoad()) return')
      expect(source).toContain('if (isLatestLoad()) setLoading(false)')
      expect(source).toMatch(/instanceof DOMException && \w+\.name === 'AbortError'/)
    }
  })

  it('invalidates owned work on selected-parish shell remount', () => {
    for (const source of [card, page]) {
      expect(source).toContain('loadSequenceRef.current += 1')
      expect(source).toContain('loadAbortRef.current?.abort()')
      expect(source).toContain('loadAbortRef.current = null')
    }
  })

  it('requires validated settings and staff evidence before calculating readiness', () => {
    for (const source of [card, page]) {
      expect(source).toContain('parseOnboardingSettingsResponse')
      expect(source).toContain('parseOnboardingStaffResponse')
      expect(source).toContain('setParish(null)')
      expect(source).toContain('setStaffUsers([])')
      expect(source).not.toContain('Array.isArray(staffData.staff) ? staffData.staff : []')
    }
    expect(card).toContain('if (!nextParish || !nextStaff)')
    expect(card).toContain('Setup status is temporarily unavailable.')
    expect(page).toContain('if (!staffRes.ok || !staffData?.ok)')
    expect(page).toContain('if (!nextParish || !nextStaff)')
  })

  it('documents fail-closed readiness and unchanged production boundaries', () => {
    const evidence = read('docs/ONBOARDING_READINESS_LATEST_RESPONSE_BOUNDARY_20260711.md')
    for (const phrase of [
      'ONBOARDING_READINESS_LATEST_RESPONSE_IMPLEMENTED_20260711',
      'latest-request-wins',
      'does not masquerade as zero staff',
      'No onboarding or settings mutation',
      'No production or shared-QA access',
      'No migration or operational RLS change',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
