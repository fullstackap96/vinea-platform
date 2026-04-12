-- Optional calendar date for staff follow-up (no automations in V1).
ALTER TABLE public.requests
  ADD COLUMN IF NOT EXISTS next_follow_up_date date NULL;
