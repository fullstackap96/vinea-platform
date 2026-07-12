import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import { confirmedRequestDocumentSignedUrl } from './requestDocumentSignedUrl'

describe('confirmedRequestDocumentSignedUrl', () => {
  it('returns a trimmed non-empty signed URL', () => {
    expect(
      confirmedRequestDocumentSignedUrl({ signedUrl: '  https://storage.example.test/signed  ' }),
    ).toBe('https://storage.example.test/signed')
  })

  it('allows an absolute local HTTP storage URL without rewriting its signature', () => {
    const value = 'http://127.0.0.1:54321/storage/v1/object/sign/private?token=safe-test'
    expect(confirmedRequestDocumentSignedUrl({ signedUrl: value })).toBe(value)
  })

  it.each([
    null,
    undefined,
    [],
    {},
    { signedUrl: null },
    { signedUrl: '' },
    { signedUrl: '   ' },
    { signedUrl: '/relative/storage/object' },
    { signedUrl: '//storage.example.test/object' },
    { signedUrl: 'javascript:alert(1)' },
    { signedUrl: 'data:text/html,unsafe' },
    { signedUrl: 'ftp://storage.example.test/object' },
    { signedUrl: 'https://user:password@storage.example.test/object' },
  ])('rejects missing or empty signed URL data %#', (data) => {
    expect(confirmedRequestDocumentSignedUrl(data)).toBeNull()
  })
})
