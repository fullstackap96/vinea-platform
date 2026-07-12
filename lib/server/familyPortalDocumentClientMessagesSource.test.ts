import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

describe('family portal document client messages', () => {
  it('renders family upload failures through the safe allowlist helper', () => {
    const component = readRepoFile('app/family/request/[token]/FamilyRequestDocumentsPortal.tsx')
    const helper = readRepoFile('lib/familyPortalDocumentClientMessages.ts')

    expect(component).toContain(
      "} from '@/lib/familyPortalDocumentClientMessages'",
    )
    expect(component).toContain('safeFamilyPortalDocumentUploadMessage(payload?.error)')
    expect(component).toContain('safeFamilyPortalDocumentUploadMessage(')
    expect(component).toContain('familyPortalDocumentUploadUnconfirmedMessage')
    expect(component).not.toContain("throw new Error(payload?.error || 'Could not upload document.')")
    expect(component).not.toContain(
      "setMessage(error instanceof Error ? error.message : 'Could not upload document.')",
    )

    expect(helper).toContain('safeFamilyPortalDocumentMessages')
    expect(helper).toContain('familyPortalDocumentUploadGenericMessage')
    expect(helper).not.toContain('return message ||')
  })
})
