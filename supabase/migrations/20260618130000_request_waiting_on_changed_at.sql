-- Track when the current operational blocker was set.
-- This lets the staff command center distinguish a fresh blocker from one that is aging.

ALTER TABLE public.requests
  ADD COLUMN IF NOT EXISTS waiting_on_changed_at timestamptz NULL;

COMMENT ON COLUMN public.requests.waiting_on_changed_at IS
  'Timestamp when requests.waiting_on was last set or changed.';
