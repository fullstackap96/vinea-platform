import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

describe('AI source path safe link boundary', () => {
  it('keeps AI summary and reply source paths on the shared request detail helper', () => {
    const files = [
      join(root, 'lib', 'server', 'aiSummarySafetyChainAdapter.ts'),
      join(root, 'lib', 'server', 'aiReplySafetyChainAdapter.ts'),
    ]

    for (const file of files) {
      const source = readFileSync(file, 'utf8')

      expect(source).toContain("import { requestDetailHref } from '@/lib/dashboardRequestNavigation'")
      expect(source).toContain('const requestSourcePath = requestDetailHref(input.requestId)')
      expect(source).not.toContain('sourcePath: `/dashboard/requests/${input.requestId}`')
    }
  })
})
