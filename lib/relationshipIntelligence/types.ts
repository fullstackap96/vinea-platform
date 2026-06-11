export type ConfidenceLevel = 'certain' | 'high' | 'medium' | 'low'

export type PersonCandidate = {
  id: string
  parishioner_id: string | null
  first_name: string
  middle_name: string | null
  last_name: string
  email: string | null
  phone: string | null
}

export type ParishionerContact = {
  id: string
  full_name: string
  email: string | null
  phone: string | null
}

export type PersonMatchSuggestion = {
  kind: 'person_match'
  personId: string
  personDisplayName: string
  confidence: ConfidenceLevel
  reason: string
  requestId: string
  householdNames: string[]
}

export type RecordCreationSuggestion = {
  kind: 'record_creation'
  requestId: string
  requestType: string
  recordType: string
  label: string
}

export type CertificateSuggestion = {
  kind: 'certificate'
  recordId: string
  personName: string
  label: string
}

export type DashboardSuggestedAction =
  | PersonMatchSuggestion
  | RecordCreationSuggestion
  | CertificateSuggestion

export const DASHBOARD_SUGGESTED_ACTIONS_CAP = 8
