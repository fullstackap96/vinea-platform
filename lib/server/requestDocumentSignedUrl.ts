import 'server-only'

export function confirmedRequestDocumentSignedUrl(data: unknown): string | null {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null

  const signedUrl = String((data as { signedUrl?: unknown }).signedUrl ?? '').trim()
  if (!signedUrl) return null

  try {
    const parsed = new URL(signedUrl)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null
    if (parsed.username || parsed.password) return null
    return signedUrl
  } catch {
    return null
  }
}
