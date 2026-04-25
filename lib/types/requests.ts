export type { RequestStatus } from '../requestStatus'

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
