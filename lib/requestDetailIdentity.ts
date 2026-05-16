import { requestTypeFromRow } from '@/lib/requestTypeFromRow'

export type RequestDetailIdentityInput = {
  request_type?: unknown
  child_name?: unknown
  parishioner?: { full_name?: unknown } | null
  funeralDetail?: { deceased_name?: unknown } | null
  weddingDetail?: {
    partner_one_name?: unknown
    partner_two_name?: unknown
  } | null
}

function trimOrEmpty(value: unknown): string {
  return String(value ?? '').trim()
}

/**
 * Primary title for the request detail header (sacrament subject, then contact fallback).
 */
export function getRequestDetailPrimaryHeading(input: RequestDetailIdentityInput): string {
  const contactName =
    trimOrEmpty(input.parishioner?.full_name) || 'Unnamed contact'
  const requestType = requestTypeFromRow({ request_type: input.request_type })

  switch (requestType) {
    case 'funeral': {
      const deceased = trimOrEmpty(input.funeralDetail?.deceased_name)
      return deceased || contactName
    }
    case 'wedding': {
      const a = trimOrEmpty(input.weddingDetail?.partner_one_name)
      const b = trimOrEmpty(input.weddingDetail?.partner_two_name)
      const couple = [a, b].filter(Boolean).join(' & ')
      return couple || contactName
    }
    case 'baptism': {
      const child = trimOrEmpty(input.child_name)
      return child || contactName
    }
    case 'ocia':
    case 'join_parish':
    default:
      return contactName
  }
}
