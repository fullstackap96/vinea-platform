import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { sanitizeEvidenceError } from '../../scripts/sanitize-evidence-error.mjs'

const scripts = [
  'scripts/run-export-audit-reviewer-api-live-smoke.mjs',
  'scripts/run-export-audit-review-nonproduction-drill.mjs',
  'scripts/run-nonproduction-restore-app-auth-smoke.mjs',
  'scripts/run-synthetic-storage-document-restore-smoke.mjs',
]

describe('export evidence runner fatal error redaction', () => {
  it('preserves actionable guardrail text without secret material', () => {
    expect(
      sanitizeEvidenceError(
        new Error('Missing required environment variable: NON_PRODUCTION_APP_URL'),
      ),
    ).toBe('Missing required environment variable: NON_PRODUCTION_APP_URL')
  })

  it('redacts connection URLs, web URLs, identifiers, JWTs, tokens, bearer values, and emails', () => {
    const unsafe = [
      'postgresql://postgres:secret@db.example.test:5432/postgres',
      'https://example.test/path?token=secret',
      '123e4567-e89b-42d3-a456-426614174000',
      'eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYW5vbiJ9.signature_value',
      'sk_test_1234567890abcdef',
      'Bearer secret.jwt.value',
      'owner@example.test',
    ].join(' ')

    const sanitized = sanitizeEvidenceError(new Error(unsafe))

    for (const secret of ['postgres:secret', 'token=secret', '123e4567-e89b-42d3-a456-426614174000', 'signature_value', 'sk_test_', 'secret.jwt.value', 'owner@example.test']) {
      expect(sanitized).not.toContain(secret)
    }
    expect(sanitized).toContain('[redacted')
  })

  it('bounds fatal output length', () => {
    expect(sanitizeEvidenceError(new Error('x'.repeat(1_000)))).toHaveLength(500)
  })

  for (const script of scripts) {
    it(`${script} sanitizes fatal stderr output`, () => {
      const source = readFileSync(join(process.cwd(), script), 'utf8')
      expect(source).toContain("import { sanitizeEvidenceError } from './sanitize-evidence-error.mjs'")
      expect(source).toContain('error: sanitizeEvidenceError(error)')
      expect(source).not.toContain('error: error.message')
      expect(source).toContain('process.exitCode = 1')
    })
  }
})
