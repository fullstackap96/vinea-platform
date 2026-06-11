-- Mass intentions V1: staff-tracked intention requests (no payments/accounting).
-- Requires public.primary_parish_id() from sacramental records migration.

CREATE TABLE IF NOT EXISTS public.mass_intentions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id uuid NOT NULL REFERENCES public.parishes (id) ON DELETE CASCADE,
  requester_name text NOT NULL,
  intention_text text NOT NULL,
  requested_date date NULL,
  assigned_mass_date date NULL,
  assigned_priest_name text NULL,
  stipend_received boolean NOT NULL DEFAULT false,
  is_fulfilled boolean NOT NULL DEFAULT false,
  notes text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT mass_intentions_requester_name_not_blank CHECK (char_length(btrim(requester_name)) > 0),
  CONSTRAINT mass_intentions_intention_text_not_blank CHECK (char_length(btrim(intention_text)) > 0)
);

CREATE INDEX IF NOT EXISTS mass_intentions_parish_fulfilled_mass_date_idx
  ON public.mass_intentions (parish_id, is_fulfilled, assigned_mass_date);

CREATE INDEX IF NOT EXISTS mass_intentions_parish_assigned_mass_date_idx
  ON public.mass_intentions (parish_id, assigned_mass_date);

CREATE INDEX IF NOT EXISTS mass_intentions_parish_requester_name_idx
  ON public.mass_intentions (parish_id, requester_name);

COMMENT ON TABLE public.mass_intentions IS
  'Parish Mass intention requests (V1). Staff entry only; stipend is yes/no flag only.';

COMMENT ON COLUMN public.mass_intentions.requested_date IS
  'Date requested by the petitioner (preference; may be open-ended).';

COMMENT ON COLUMN public.mass_intentions.assigned_mass_date IS
  'Date of the Mass where this intention is scheduled to be offered.';

COMMENT ON COLUMN public.mass_intentions.stipend_received IS
  'Whether a stipend was received (boolean only; no amount in V1).';

DROP TRIGGER IF EXISTS mass_intentions_before_write_trg ON public.mass_intentions;
CREATE TRIGGER mass_intentions_before_write_trg
  BEFORE INSERT OR UPDATE ON public.mass_intentions
  FOR EACH ROW
  EXECUTE FUNCTION public.people_households_before_write();

ALTER TABLE public.mass_intentions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mass_intentions_select_authenticated" ON public.mass_intentions;
CREATE POLICY "mass_intentions_select_authenticated"
  ON public.mass_intentions
  FOR SELECT
  TO authenticated
  USING (parish_id = public.primary_parish_id());

DROP POLICY IF EXISTS "mass_intentions_insert_authenticated" ON public.mass_intentions;
CREATE POLICY "mass_intentions_insert_authenticated"
  ON public.mass_intentions
  FOR INSERT
  TO authenticated
  WITH CHECK (parish_id = public.primary_parish_id());

DROP POLICY IF EXISTS "mass_intentions_update_authenticated" ON public.mass_intentions;
CREATE POLICY "mass_intentions_update_authenticated"
  ON public.mass_intentions
  FOR UPDATE
  TO authenticated
  USING (parish_id = public.primary_parish_id())
  WITH CHECK (parish_id = public.primary_parish_id());
