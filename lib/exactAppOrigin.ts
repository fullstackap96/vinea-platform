export type ExactAppOriginOptions = {
  requireHttps?: boolean
}

export function parseExactAppOrigin(
  value: string | undefined,
  options: ExactAppOriginOptions = {},
): URL | null {
  const candidate = value?.trim()
  if (!candidate) return null

  try {
    const url = new URL(candidate)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    if (options.requireHttps && url.protocol !== 'https:') return null
    if (url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
      return null
    }
    return url
  } catch {
    return null
  }
}
