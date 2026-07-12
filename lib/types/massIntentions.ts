export type MassIntentionFulfilledFilter = 'all' | 'unfulfilled' | 'fulfilled'

export type MassIntentionRow = {
  id: string
  parish_id: string
  requester_name: string
  intention_text: string
  requested_date: string | null
  assigned_mass_date: string | null
  assigned_priest_name: string | null
  stipend_received: boolean
  is_fulfilled: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export type MassIntentionListItem = Pick<
  MassIntentionRow,
  | 'id'
  | 'requester_name'
  | 'intention_text'
  | 'requested_date'
  | 'assigned_mass_date'
  | 'assigned_priest_name'
  | 'stipend_received'
  | 'is_fulfilled'
>

export type MassIntentionWriteInput = {
  requesterName: unknown
  intentionText: unknown
  requestedDate: unknown
  assignedMassDate: unknown
  assignedPriestName: unknown
  stipendReceived: unknown
  isFulfilled: unknown
  notes: unknown
}
