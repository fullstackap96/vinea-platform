import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

describe('dashboard detail partial-data source wiring', () => {
  it('warns on secondary Person detail query failures from the server loader without blocking the main record', () => {
    const loader = readRepoFile('lib/server/loadPersonDetail.ts')
    const page = readRepoFile('app/dashboard/people/[id]/PersonDetailPage.tsx')

    expect(loader).toContain("from '@/lib/dashboardDetailClientMessages'")
    expect(loader).toContain('dashboardDetailPartialDataMessage(')
    expect(loader).toContain('noteLinkedDataError(')
    expect(loader).toContain('warningMessage: linkedDataHadError')
    expect(page).toContain('role="status"')

    for (const forbidden of [
      'warningMessage: error.message',
      'warningMessage: String(error',
      'warningMessage: memberRowsError.message',
      'warningMessage: recordRowsError.message',
      'warningMessage: requestRowsError.message',
      'warningMessage: commRowsError.message',
    ]) {
      expect(loader).not.toContain(forbidden)
    }
  })

  it('warns on secondary Household detail query failures without blocking the main record', () => {
    const loader = readRepoFile('lib/server/loadHouseholdDetail.ts')
    const page = readRepoFile('app/dashboard/households/[id]/HouseholdDetailPage.tsx')

    expect(loader).toContain("from '@/lib/dashboardDetailClientMessages'")
    expect(loader).toContain('dashboardDetailPartialDataMessage(')
    expect(loader).toContain('noteLinkedDataError(')
    expect(loader).toContain('warningMessage: linkedDataHadError')
    expect(page).toContain('role="status"')

    for (const forbidden of [
      'warningMessage: error.message',
      'warningMessage: String(error',
      'warningMessage: memberRowsError.message',
      'warningMessage: recordRowsError.message',
      'warningMessage: requestRowsError.message',
      'warningMessage: commRowsError.message',
    ]) {
      expect(loader).not.toContain(forbidden)
    }
  })

  it('keeps sacramental record certificate cues behind loaded event metadata', () => {
    const loader = readRepoFile('lib/server/loadSacramentalRecordDetail.ts')
    const page = readRepoFile('app/dashboard/records/[id]/RecordDetailPage.tsx')

    expect(loader).toContain("from '@/lib/dashboardDetailClientMessages'")
    expect(loader).toContain('dashboardDetailPartialDataMessage(')
    expect(loader).toContain('noteLinkedDataError(')
    expect(loader).toContain('certificateEventMetadataLoaded: !eventRowsError')
    expect(loader).toContain('warningMessage: linkedDataHadError')
    expect(page).toContain('certificateEventMetadataLoaded ? (')
    expect(page).toContain('<RecordCertificateSuggestion')
    expect(page).toContain('role="status"')

    for (const forbidden of [
      'warningMessage: error.message',
      'warningMessage: String(error',
      'warningMessage: personError.message',
      'warningMessage: eventRowsError.message',
    ]) {
      expect(loader).not.toContain(forbidden)
    }
  })
})
