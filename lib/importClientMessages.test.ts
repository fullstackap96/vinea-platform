import { describe, expect, it } from 'vitest'
import { importClientErrorMessage, importClientFallbacks } from './importClientMessages'

describe('import client messages', () => {
  it('replaces unexpected backend details with safe preview and commit fallbacks', () => {
    for (const action of ['preview', 'commit'] as const) {
      const message = importClientErrorMessage(
        action,
        'postgresql://secret@host raw-import-row provider failure',
      )
      expect(message).toBe(importClientFallbacks[action])
      expect(message).not.toContain('postgresql://')
      expect(message).not.toContain('raw-import-row')
    }
  })

  it('preserves approved import correction guidance', () => {
    expect(importClientErrorMessage('preview', 'No spreadsheet rows were found.')).toBe(
      'No spreadsheet rows were found.',
    )
    expect(
      importClientErrorMessage(
        'commit',
        'Import request is too large. Split the spreadsheet into smaller batches.',
      ),
    ).toBe('Import request is too large. Split the spreadsheet into smaller batches.')
  })
})
