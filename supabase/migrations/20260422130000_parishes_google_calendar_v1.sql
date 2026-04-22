-- V1 parish-level Google Calendar: core tables and single-parish seed.
-- parish_google_integrations has RLS enabled with no anon/authenticated policies so
-- only server-side access via service role (PostgREST bypass) or direct privileged SQL can read/write secrets.

CREATE TABLE IF NOT EXISTS public.parishes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.parishes IS 'Parish records; V1 expects a single row.';

INSERT INTO public.parishes (name)
SELECT 'Default Parish'
WHERE NOT EXISTS (SELECT 1 FROM public.parishes);

CREATE TABLE IF NOT EXISTS public.parish_google_integrations (
  parish_id uuid PRIMARY KEY REFERENCES public.parishes (id) ON DELETE CASCADE,
  refresh_token text NULL,
  calendar_id text NULL,
  google_account_email text NULL,
  status text NULL,
  last_error text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.parish_google_integrations IS
  'Google OAuth + calendar binding for a parish; access via service role only (RLS, no end-user policies).';

ALTER TABLE public.parish_google_integrations ENABLE ROW LEVEL SECURITY;
