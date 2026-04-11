-- Funeral 1:1 extension for requests. Run in Supabase SQL editor or via CLI.
-- After running: add RLS policies mirroring `requests` / `checklist_items` (INSERT for anon intake, staff read/update).

CREATE TABLE IF NOT EXISTS public.funeral_request_details (
  request_id uuid PRIMARY KEY REFERENCES public.requests (id) ON DELETE CASCADE,
  deceased_name text NOT NULL,
  date_of_death date NULL,
  funeral_home_or_location text NULL,
  preferred_service_notes text NULL,
  confirmed_service_at timestamptz NULL
);

CREATE INDEX IF NOT EXISTS funeral_request_details_request_id_idx
  ON public.funeral_request_details (request_id);

ALTER TABLE public.funeral_request_details ENABLE ROW LEVEL SECURITY;

-- Example policies (adjust to match your existing `requests` table policies):
-- CREATE POLICY "funeral_details_select_authenticated" ON public.funeral_request_details
--   FOR SELECT TO authenticated USING (true);
-- CREATE POLICY "funeral_details_insert_authenticated" ON public.funeral_request_details
--   FOR INSERT TO authenticated WITH CHECK (true);
-- CREATE POLICY "funeral_details_update_authenticated" ON public.funeral_request_details
--   FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
-- CREATE POLICY "funeral_details_insert_anon" ON public.funeral_request_details
--   FOR INSERT TO anon WITH CHECK (true);

COMMENT ON TABLE public.funeral_request_details IS 'Type-specific fields for request_type = funeral';
