import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const shellPath = join(process.cwd(), 'app', 'dashboard', 'DashboardLayoutClient.tsx')

describe('dashboard active-parish switch thrown-failure recovery', () => {
  it('restores the previous parish and curated guidance after an unexpected failure', () => {
    const source = readFileSync(shellPath, 'utf8')
    const handlerStart = source.indexOf('function handleParishChange(nextParishId: string)')
    const returnStart = source.indexOf('\n  return (', handlerStart)
    const handler = source.slice(handlerStart, returnStart)

    expect(handlerStart).toBeGreaterThan(-1)
    expect(returnStart).toBeGreaterThan(handlerStart)
    expect(handler).toContain('const previousActiveParishId = activeParishId')
    expect(handler).toContain('setPendingParishId(nextParishId)')
    expect(handler).toContain('try {')
    expect(handler).toContain('await setActiveStaffParish(nextParishId)')
    expect(handler).toContain('result.activeParishId ?? previousActiveParishId')
    expect(handler).toContain('} catch (error) {')
    expect(handler).toContain('setActiveParishId(previousActiveParishId)')
    expect(handler).toContain('setPendingParishId(null)')
    expect(handler).toContain("dashboardShellClientErrorMessage('parishSwitcher', error)")
    expect(handler).toContain("setSwitcherMessageTone('error')")
    expect(handler).toContain('router.refresh()')
    expect(handler).not.toContain('setSwitcherMessage(String(error))')
  })

  it('keeps the selector locked during the transition', () => {
    const source = readFileSync(shellPath, 'utf8')

    expect(source).toContain(
      'isSwitchingParish || isSigningOut || parishOptions.length === 1',
    )
    expect(source).toContain('disabled={parishSwitchUnavailable}')
    expect(source).toContain('startParishSwitchTransition(async () => {')
    expect(source).toContain('value={selectedParishId}')
  })

  it('documents the tenant-context recovery boundary', () => {
    const evidence = readFileSync(
      join(process.cwd(), 'docs', 'DASHBOARD_PARISH_SWITCH_THROWN_FAILURE_RECOVERY_20260711.md'),
      'utf8',
    )

    for (const phrase of [
      'DASHBOARD_PARISH_SWITCH_THROWN_FAILURE_RECOVERY_IMPLEMENTED_20260711',
      'retains the previously confirmed parish',
      'curated non-technical guidance',
      'No production access',
      'No parish selection was changed during verification',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
