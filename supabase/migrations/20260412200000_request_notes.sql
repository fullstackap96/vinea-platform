-- Append-only internal notes per request (dashboard staff; not exposed on public intake).

CREATE TABLE IF NOT EXISTS public.request_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.requests (id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS request_notes_request_id_created_at_idx
  ON public.request_notes (request_id, created_at DESC);

ALTER TABLE public.request_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "request_notes_select_authenticated"
  ON public.request_notes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "request_notes_insert_authenticated"
  ON public.request_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

COMMENT ON TABLE public.request_notes IS 'Append-only staff notes timeline; one row per note.';
