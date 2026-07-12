import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('demo request client safe messages', () => {
  it('routes public demo request failures through the client allowlist helper', () => {
    const source = readRepoFile('app/_components/landing/ScheduleDemoForm.tsx')

    expect(source).toContain(
      "import { demoRequestClientErrorMessage } from '@/lib/demoRequestClientMessages'"
    )
    expect(source).toContain('setStatusMessage(demoRequestClientErrorMessage(payload?.error))')
    expect(source).toContain('setStatusMessage(demoRequestClientErrorMessage(err))')
    expect(source).not.toContain("const err = String(payload?.error || 'Unable to submit demo request.')")
    expect(source).not.toContain("err?.message || 'Unable to submit demo request. Please try again.'")
  })

  it('keeps local validation and success copy intact', () => {
    const source = readRepoFile('app/_components/landing/ScheduleDemoForm.tsx')

    expect(source).toContain("setStatusMessage('Please fill in your name, parish name, and email.')")
    expect(source).toContain('Thank you')
    expect(source).toContain('we')
    expect(source).toContain('ll reach out shortly to schedule your demo.')
  })
})
