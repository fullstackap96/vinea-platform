export type { RequestStatus } from '../requestStatus'

/**
 * Live `public.parishioners` columns used by staff UI (single `full_name`; no `first_name` / `last_name`).
 */
export type ParishionerRow = {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  created_at?: string
  parish_id?: string | null
}

export type ParishionerContactFields = Pick<ParishionerRow, 'full_name' | 'email' | 'phone'>

/** Stored in `public.requests.request_type` (Postgres column name; not `type`). */
export type RequestDiscriminator =
  | 'baptism'
  | 'funeral'
  | 'wedding'
  | 'ocia'
  | 'join_parish'

/** Nullable columns on `public.requests` for V1 assignment (free-text names). */
export type RequestAssignmentColumns = {
  assigned_staff_name: string | null
  assigned_priest_name: string | null
  assigned_deacon_name: string | null
}

export type RequestAssignmentUpdate = {
  assigned_staff_name: string | null
  assigned_priest_name: string | null
  assigned_deacon_name: string | null
}

/** Optional `date` on `public.requests` for staff follow-up scheduling. */
export type RequestNextFollowUpColumns = {
  next_follow_up_date: string | null
}

export type RequestNextFollowUpUpdate = {
  next_follow_up_date: string | null
}
