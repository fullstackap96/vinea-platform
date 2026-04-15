-- OCIA (Order of Christian Initiation of Adults) 1:1 extension for requests.
-- Run via Supabase CLI or SQL editor. Add RLS policies mirroring other *_request_details tables.

CREATE TABLE IF NOT EXISTS public.ocia_request_details (
  request_id uuid PRIMARY KEY REFERENCES public.requests (id) ON DELETE CASCADE,
  date_of_birth date NULL,
  age_or_dob_note text NULL,
  sacramental_background text NOT NULL,
  seeking text NOT NULL,
  parishioner_status text NOT NULL,
  preferred_contact_method text NOT NULL,
  availability text NULL
);

CREATE INDEX IF NOT EXISTS ocia_request_details_request_id_idx
  ON public.ocia_request_details (request_id);

ALTER TABLE public.ocia_request_details ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.ocia_request_details IS 'Type-specific fields for request_type = ocia';
