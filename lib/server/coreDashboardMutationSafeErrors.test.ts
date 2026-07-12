import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const actionFiles = [
  {
    label: 'people actions',
    path: join(process.cwd(), 'app', 'dashboard', 'people', 'actions.ts'),
    safeMessages: ['Could not create person.', 'Could not update person.'],
  },
  {
    label: 'household actions',
    path: join(process.cwd(), 'app', 'dashboard', 'households', 'actions.ts'),
    safeMessages: [
      'Could not create household.',
      'Could not update household.',
      'Could not add household member.',
      'Could not update household member.',
    ],
  },
  {
    label: 'mass intention actions',
    path: join(process.cwd(), 'app', 'dashboard', 'intentions', 'actions.ts'),
    safeMessages: ['Could not create Mass intention.', 'Could not update Mass intention.'],
  },
] as const

describe('core dashboard mutation safe errors', () => {
  for (const actionFile of actionFiles) {
    it(`${actionFile.label} log unexpected database failures and return stable staff messages`, () => {
      const source = readFileSync(actionFile.path, 'utf8')

      expect(source).toContain('logServerError')
      for (const safeMessage of actionFile.safeMessages) {
        expect(source).toContain(safeMessage)
      }

      expect(source).not.toMatch(/return\s+\{\s*ok:\s*false,\s*error:\s*error\??\.message/)
      expect(source).not.toMatch(/return\s+\{\s*ok:\s*false,\s*error:\s*[^}]+Error\.message/)
      expect(source).not.toMatch(/return\s+\{\s*ok:\s*false,\s*error:\s*[^}]+Err\.message/)
    })
  }
})
