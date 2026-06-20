-- Parish data import history for spreadsheet onboarding.

CREATE TABLE IF NOT EXISTS public.import_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id uuid NOT NULL REFERENCES public.parishes (id) ON DELETE CASCADE,
  import_kind text NOT NULL,
  original_filename text NULL,
  status text NOT NULL DEFAULT 'completed',
  total_rows integer NOT NULL DEFAULT 0,
  created_count integer NOT NULL DEFAULT 0,
  skipped_count integer NOT NULL DEFAULT 0,
  warning_count integer NOT NULL DEFAULT 0,
  error_count integer NOT NULL DEFAULT 0,
  actor_email text NULL,
  summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT import_batches_kind_valid CHECK (
    import_kind IN ('people', 'households', 'sacramental_records')
  ),
  CONSTRAINT import_batches_status_valid CHECK (
    status IN ('previewed', 'completed', 'completed_with_warnings', 'failed')
  )
);

CREATE INDEX IF NOT EXISTS import_batches_parish_created_at_idx
  ON public.import_batches (parish_id, created_at DESC);

COMMENT ON TABLE public.import_batches IS
  'Staff-visible history for people, household, and sacramental record spreadsheet imports.';

ALTER TABLE public.import_batches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "import_batches_select_staff" ON public.import_batches;
CREATE POLICY "import_batches_select_staff"
  ON public.import_batches
  FOR SELECT
  TO authenticated
  USING (
    public.is_authorized_staff()
    AND parish_id = public.primary_parish_id()
  );
