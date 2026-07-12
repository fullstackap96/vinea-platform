import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

function read(path: string) {
  return readFileSync(join(root, path), 'utf8')
}

describe('sacramental record client safe messages source boundary', () => {
  it('routes new-record prefill and create failures through the safe helper', () => {
    const source = read('app/dashboard/records/new/NewSacramentalRecordPage.tsx')

    expect(source).toContain("sacramentalRecordClientErrorMessage('loadPrefill', result.error)")
    expect(source).toContain("sacramentalRecordClientErrorMessage('createRecord', result.error)")
    expect(source).not.toContain('setMessage(result.error)')
  })

  it('routes record and person-link update failures through action-specific safe messages', () => {
    const source = read(
      'app/dashboard/records/[id]/edit/EditSacramentalRecordPage.tsx',
    )

    expect(source).toContain(
      "sacramentalRecordClientErrorMessage('updateRecord', recordResult.error)",
    )
    expect(source).toContain(
      "sacramentalRecordClientErrorMessage('updatePersonLink', linkResult.error)",
    )
    expect(source).not.toContain('setMessage(recordResult.error)')
    expect(source).not.toContain('setMessage(linkResult.error)')
  })

  it('keeps the client helper free of raw identifiers, contacts, and token material', () => {
    const source = read('lib/sacramentalRecordClientMessages.ts')

    expect(source).toContain('allowedMessages[action].has(message)')
    expect(source).toContain('fallbackMessages[action]')
    expect(source).not.toContain('error instanceof Error')
    expect(source).not.toContain('.message')
  })

  it('documents the client redaction and production no-go boundary', () => {
    const doc = read('docs/SACRAMENTAL_RECORD_CLIENT_SAFE_MESSAGES_20260710.md')
    const buildStatus = read('docs/VINEA_BUILD_STATUS.md')
    const roadmap = read('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = read('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(doc).toContain('SACRAMENTAL_RECORD_CLIENT_SAFE_MESSAGES_IMPLEMENTED_20260710')
    expect(doc).toContain('Unexpected database constraints')
    expect(doc).toContain('Production-sensitive features approved by this boundary: `NO`')
    expect(buildStatus).toContain('Sacramental Record Client Safe Messages - 2026-07-10')
    expect(roadmap).toContain('Sacramental Record Client Safe Messages boundary')
    expect(sourceOfTruth).toContain('Sacramental Record Client Safe Messages boundary')
  })
})
