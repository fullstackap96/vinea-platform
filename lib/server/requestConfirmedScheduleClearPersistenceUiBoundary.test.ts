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
    successMessage: "setConfirmedMessage('Confirmed date cleared.')",
  },
  {
    functionName: 'clearConfirmedFuneralService',
    nextFunction: 'saveWeddingDetails',
    stateClear: "setConfirmedFuneralService('')",
    successMessage: "setFuneralConfirmedMessage('Cleared.')",
  },
  {
    functionName: 'clearConfirmedWeddingCeremony',
    nextFunction: 'saveConfirmedOciaSession',
    stateClear: "setConfirmedWeddingCeremony('')",
    successMessage: "setWeddingConfirmedMessage('Cleared.')",
  },
  {
    functionName: 'clearConfirmedOciaSession',
    nextFunction: 'logCommunication',
    stateClear: "setConfirmedOciaSession('')",
    successMessage: "setOciaSessionMessage('Cleared.')",
  },
] as const

describe('request confirmed schedule clear persistence UI boundary', () => {
  for (const testCase of cases) {
    it(`clears visible ${testCase.functionName} state only after confirmed persistence`, () => {
      const start = source.indexOf(`async function ${testCase.functionName}()`)
      const end = source.indexOf(`async function ${testCase.nextFunction}`, start)
      const block = source.slice(start, end)
      const responseGuard = block.indexOf('if (!res.ok || !data?.ok)')
      const stateClear = block.indexOf(testCase.stateClear)
      const successMessage = block.indexOf(testCase.successMessage)

      expect(start).toBeGreaterThan(-1)
      expect(end).toBeGreaterThan(start)
      expect(responseGuard).toBeGreaterThan(-1)
      expect(stateClear).toBeGreaterThan(responseGuard)
      expect(successMessage).toBeGreaterThan(stateClear)
      expect(block.slice(0, responseGuard)).not.toContain(testCase.stateClear)
    })
  }
})
