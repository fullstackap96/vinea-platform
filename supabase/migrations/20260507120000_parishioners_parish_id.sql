-- Parish scope: link parishioners to parishes (dashboard filters requests via parishioners.parish_id).
-- requests.waiting_on is tracked separately in 20260504120000_request_waiting_on.sql.
ALTER TABLE public.parishioners
  ADD COLUMN IF NOT EXISTS parish_id uuid REFERENCES public.parishes (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS parishioners_parish_id_idx ON public.parishioners (parish_id);

COMMENT ON COLUMN public.parishioners.parish_id IS
  'Owning parish for staff scoping; nullable for legacy rows before backfill.';
