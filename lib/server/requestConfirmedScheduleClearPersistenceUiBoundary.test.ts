import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  join(process.cwd(), 'app', 'dashboard', 'requests', '[id]', 'page.tsx'),
  'utf8',
)

const cases = [
  {
    functionName: 'clearConfirmedBaptismDate',
    nextFunction: 'saveFuneralDetails',
    stateClear: "setConfirmedBaptismDate('')",
    action: "action: 'clearConfirmedDate'",
    successMessage: "successMessage: 'Confirmed date cleared.'",
  },
  {
    functionName: 'clearConfirmedFuneralService',
    nextFunction: 'saveWeddingDetails',
    stateClear: "setConfirmedFuneralService('')",
    action: "action: 'clearFuneralService'",
    successMessage: "successMessage: 'Cleared.'",
  },
  {
    functionName: 'clearConfirmedWeddingCeremony',
    nextFunction: 'saveConfirmedOciaSession',
    stateClear: "setConfirmedWeddingCeremony('')",
    action: "action: 'clearWeddingCeremony'",
    successMessage: "successMessage: 'Cleared.'",
  },
  {
    functionName: 'clearConfirmedOciaSession',
    nextFunction: 'logCommunication',
    stateClear: "setConfirmedOciaSession('')",
    action: "action: 'clearOciaSession'",
    successMessage: "successMessage: 'Cleared.'",
  },
] as const

describe('request confirmed schedule clear persistence UI boundary', () => {
  const helperStart = source.indexOf('async function runScheduleMutation')
  const helperEnd = source.indexOf('async function saveSuggestedDates', helperStart)
  const helper = source.slice(helperStart, helperEnd)

  it('runs post-confirmation state changes only after acknowledgement and refresh', () => {
    const responseGuard = helper.indexOf('if (!res.ok || !data?.ok)')
    const refreshGuard = helper.indexOf('if (!(await loadRequest()))')
    const afterConfirmed = helper.indexOf('afterConfirmed?.()')
    const successMessage = helper.indexOf('setMessage(successMessage)')

    expect(helperStart).toBeGreaterThan(-1)
    expect(helperEnd).toBeGreaterThan(helperStart)
    expect(responseGuard).toBeGreaterThan(-1)
    expect(refreshGuard).toBeGreaterThan(responseGuard)
    expect(afterConfirmed).toBeGreaterThan(refreshGuard)
    expect(successMessage).toBeGreaterThan(afterConfirmed)
  })

  for (const testCase of cases) {
    it(`clears visible ${testCase.functionName} state only after confirmed persistence`, () => {
      const start = source.indexOf(`async function ${testCase.functionName}()`)
      const end = source.indexOf(`async function ${testCase.nextFunction}`, start)
      const block = source.slice(start, end)
      expect(start).toBeGreaterThan(-1)
      expect(end).toBeGreaterThan(start)
      expect(block).toContain('await runScheduleMutation({')
      expect(block).toContain(testCase.action)
      expect(block).toContain(`afterConfirmed: () => ${testCase.stateClear}`)
      expect(block).toContain(testCase.successMessage)
      expect(block.split(testCase.stateClear)).toHaveLength(2)
    })
  }
})
