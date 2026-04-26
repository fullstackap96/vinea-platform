export function formatRequestType(requestType: unknown): string {
  const t = String(requestType ?? '').trim().toLowerCase()

  if (t === 'baptism') return 'Baptism'
  if (t === 'funeral') return 'Funeral'
  if (t === 'wedding') return 'Wedding'
  if (t === 'ocia') return 'OCIA'
  if (t === 'join_parish') return 'Parish Inquiry'

  if (!t) return ''
  const withSpaces = t.replace(/_/g, ' ')
  return withSpaces.slice(0, 1).toUpperCase() + withSpaces.slice(1)
}

