import { describe, expect, it } from 'vitest'

import {
  isProbablyBinary,
  scanTextForRepositorySecrets,
} from '../../scripts/repository-secret-scan-rules.mjs'

describe('repository secret scan rules', () => {
  it('detects credential-shaped values without returning their contents', () => {
    const jwt = ['eyJ' + 'a'.repeat(24), 'b'.repeat(24), 'c'.repeat(24)].join('.')
    const openAiKey = ['sk-proj-', 'd'.repeat(32)].join('')
    const databaseUrl = [
      'postgresql://staff:',
      'A7z9Q2m4L8p6N3r5',
      '@db.vendor.net:5432/postgres',
    ].join('')
    const privateKeyHeader = ['-----BEGIN ', 'PRIVATE KEY-----'].join('')
    const text = [jwt, openAiKey, databaseUrl, privateKeyHeader].join('\n')

    const findings = scanTextForRepositorySecrets(text)

    expect(findings.map((finding) => finding.ruleId)).toEqual([
      'JWT_THREE_SEGMENT',
      'OPENAI_SECRET_KEY',
      'DATABASE_URL_WITH_PASSWORD',
      'PRIVATE_KEY_MATERIAL',
    ])
    expect(JSON.stringify(findings)).not.toContain('A7z9Q2m4L8p6N3r5')
    expect(findings.every((finding) => Number.isInteger(finding.line))).toBe(true)
  })

  it('allows documented placeholders and short redaction examples', () => {
    const text = [
      'postgresql://postgres:[YOUR-PASSWORD]@db.example.invalid:5432/postgres',
      'postgresql://postgres:<REDACTED>@db.example.invalid:5432/postgres',
      'OPENAI_API_KEY=[PASTE_APPROVED_KEY]',
      'Resend provider rejected key re_123',
      'Bearer [REDACTED]',
      'sk-super-secret-provider-key-used-in-a-test',
      'postgresql://staff:synthetic-secret@db.fixture.invalid:5432/postgres',
    ].join('\n')

    expect(scanTextForRepositorySecrets(text)).toEqual([])
  })

  it('keeps obvious binary files outside the text scanner', () => {
    expect(isProbablyBinary(Buffer.from([0x25, 0x50, 0x44, 0x46, 0x00, 0xff]))).toBe(true)
    expect(isProbablyBinary(Buffer.from('plain text\nwith another line'))).toBe(false)
  })
})
