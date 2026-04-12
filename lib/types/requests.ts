export type { RequestStatus } from '../requestStatus'

/** Nullable columns on `public.requests` for V1 assignment (free-text names). */
export type RequestAssignmentColumns = {
  assigned_staff_name: string | null
  assigned_priest_name: string | null
}

export type RequestAssignmentUpdate = {
  assigned_staff_name: string | null
  assigned_priest_name: string | null
}
