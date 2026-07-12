import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

function read(path: string) {
  return readFileSync(join(root, path), 'utf8')
}

describe('core record client safe messages source boundary', () => {
  it('routes People failures through action-specific safe messages', () => {
    const createSource = read('app/dashboard/people/new/NewPersonPage.tsx')
    const updateSource = read('app/dashboard/people/[id]/edit/EditPersonPage.tsx')

    expect(createSource).toContain("coreRecordClientErrorMessage('createPerson', result.error)")
    expect(updateSource).toContain("coreRecordClientErrorMessage('updatePerson', result.error)")
    expect(createSource).not.toContain('setMessage(result.error)')
    expect(updateSource).not.toContain('setMessage(result.error)')
  })

  it('routes Household and member failures through action-specific safe messages', () => {
    const createSource = read('app/dashboard/households/new/NewHouseholdPage.tsx')
    const updateSource = read('app/dashboard/households/[id]/edit/EditHouseholdPage.tsx')

    expect(createSource).toContain("coreRecordClientErrorMessage('createHousehold', result.error)")
    expect(updateSource).toContain(
      "coreRecordClientErrorMessage('addHouseholdMember', result.error)",
    )
    expect(updateSource).toContain(
      "coreRecordClientErrorMessage('updateHousehold', householdResult.error)",
    )
    expect(updateSource).toContain(
      "coreRecordClientErrorMessage('updateHouseholdMember', memberResult.error)",
    )
    expect(createSource).not.toContain('setMessage(result.error)')
    expect(updateSource).not.toContain('setAddMemberMessage(result.error)')
    expect(updateSource).not.toContain('setMessage(householdResult.error)')
    expect(updateSource).not.toContain('setMessage(memberResult.error)')
  })

  it('routes Mass Intention failures through action-specific safe messages', () => {
    const createSource = read('app/dashboard/intentions/new/NewMassIntentionPage.tsx')
    const updateSource = read('app/dashboard/intentions/[id]/edit/EditMassIntentionPage.tsx')

    expect(createSource).toContain(
      "coreRecordClientErrorMessage('createMassIntention', result.error)",
    )
    expect(updateSource).toContain(
      "coreRecordClientErrorMessage('updateMassIntention', result.error)",
    )
    expect(createSource).not.toContain('setMessage(result.error)')
    expect(updateSource).not.toContain('setMessage(result.error)')
  })

  it('keeps the helper and documentation inside the no-runtime-change boundary', () => {
    const helper = read('lib/coreRecordClientMessages.ts')
    const doc = read('docs/CORE_RECORD_CLIENT_SAFE_MESSAGES_20260710.md')
    const buildStatus = read('docs/VINEA_BUILD_STATUS.md')
    const roadmap = read('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = read('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(helper).toContain('allowedMessages[action].has(message)')
    expect(helper).not.toContain('error instanceof Error')
    expect(helper).not.toContain('.message')
    expect(doc).toContain('CORE_RECORD_CLIENT_SAFE_MESSAGES_IMPLEMENTED_20260710')
    expect(doc).toContain('Production-sensitive features approved by this boundary: `NO`')
    expect(buildStatus).toContain('Core Record Client Safe Messages - 2026-07-10')
    expect(roadmap).toContain('Core Record Client Safe Messages boundary')
    expect(sourceOfTruth).toContain('Core Record Client Safe Messages boundary')
  })
})
