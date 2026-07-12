import { afterEach, describe, expect, it, vi } from 'vitest'

const originalApiKey = process.env.OPENAI_API_KEY

afterEach(() => {
  vi.resetModules()
  if (originalApiKey === undefined) {
    delete process.env.OPENAI_API_KEY
  } else {
    process.env.OPENAI_API_KEY = originalApiKey
  }
})

describe('OpenAI build-time initialization boundary', () => {
  it('loads without credentials and fails closed only when runtime provider access is attempted', async () => {
    delete process.env.OPENAI_API_KEY
    vi.resetModules()

    const openAiModule = await import('@/lib/openai')

    expect(openAiModule.openai).toBeDefined()
    expect(() => openAiModule.openai.responses).toThrow(
      'AI provider is not configured.',
    )
  })
})
