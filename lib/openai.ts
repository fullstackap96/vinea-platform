import OpenAI from 'openai'

let client: OpenAI | undefined

function getOpenAiClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey) {
    throw new Error('AI provider is not configured.')
  }

  client ??= new OpenAI({ apiKey })
  return client
}

export const openai: Pick<OpenAI, 'responses'> = {
  get responses() {
    return getOpenAiClient().responses
  },
}
