-- Staff-confirmed OCIA meeting/session time (Google Calendar + dashboard schedule helpers).
ALTER TABLE public.ocia_request_details
  ADD COLUMN IF NOT EXISTS confirmed_session_at timestamptz NULL;

COMMENT ON COLUMN public.ocia_request_details.confirmed_session_at IS
  'Staff-confirmed OCIA meeting/session start time; used for Google Calendar sync.';
