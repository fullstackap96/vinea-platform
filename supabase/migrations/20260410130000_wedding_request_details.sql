-- Wedding 1:1 extension for requests. Run in Supabase SQL editor or via CLI.
-- After running: add RLS policies mirroring funeral_request_details / requests.

CREATE TABLE IF NOT EXISTS public.wedding_request_details (
  request_id uuid PRIMARY KEY REFERENCES public.requests (id) ON DELETE CASCADE,
  partner_one_name text NOT NULL,
  partner_two_name text NULL,
  proposed_wedding_date date NULL,
  ceremony_notes text NULL,
  confirmed_ceremony_at timestamptz NULL
);

CREATE INDEX IF NOT EXISTS wedding_request_details_request_id_idx
  ON public.wedding_request_details (request_id);

ALTER TABLE public.wedding_request_details ENABLE ROW LEVEL SECURITY;

-- Example policies (adjust to match your existing policies):
-- CREATE POLICY "wedding_details_select_authenticated" ON public.wedding_request_details
--   FOR SELECT TO authenticated USING (true);
-- CREATE POLICY "wedding_details_insert_authenticated" ON public.wedding_request_details
--   FOR INSERT TO authenticated WITH CHECK (true);
-- CREATE POLICY "wedding_details_update_authenticated" ON public.wedding_request_details
--   FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
-- CREATE POLICY "wedding_details_insert_anon" ON public.wedding_request_details
--   FOR INSERT TO anon WITH CHECK (true);

COMMENT ON TABLE public.wedding_request_details IS 'Type-specific fields for request_type = wedding';
