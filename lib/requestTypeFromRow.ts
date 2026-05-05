/**
 * Normalizes `public.requests.request_type` (baptism, funeral, wedding, ocia, join_parish).
 */
export function requestTypeFromRow(
  row: { request_type?: unknown } | null | undefined,
  fallback = 'baptism'
): string {
  const s = String(row?.request_type ?? '')
    .trim()
    .toLowerCase()
  return s || fallback
}
