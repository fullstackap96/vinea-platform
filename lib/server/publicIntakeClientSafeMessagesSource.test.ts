import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()
const intakePages = [
  'app/baptism-request/page.tsx',
  'app/wedding-request/page.tsx',
  'app/funeral-request/page.tsx',
  'app/ocia-request/page.tsx',
  'app/join-parish-request/page.tsx',
]

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('public intake client safe messages', () => {
  it('routes public intake failures through the shared fail-safe client helper', () => {
    for (const page of intakePages) {
      const source = readRepoFile(page)

      expect(source).toContain(
        "import { submitPublicIntake } from '@/lib/publicIntakeSubmissionClient'"
      )
      expect(source).toContain('const intakeResult = await submitPublicIntake({')
      expect(source).toContain('setMessage(intakeResult.error)')
      expect(source).toContain('const requestId = intakeResult.requestId')
      expect(source).not.toContain("fetch('/api/intake'")
      expect(source).not.toContain("String(intakeData?.error || 'Error saving request.')")
    }
  })

  it('keeps expected local public validation and success messages intact', () => {
    const ocia = readRepoFile('app/ocia-request/page.tsx')
    const baptism = readRepoFile('app/baptism-request/page.tsx')

    expect(ocia).toContain(
      "setMessage('Please provide either a date of birth or your age (in the text field).')"
    )
    expect(baptism).toContain("setMessage('Request submitted successfully.')")
  })
})
