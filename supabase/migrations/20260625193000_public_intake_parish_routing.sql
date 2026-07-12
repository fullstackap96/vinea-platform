-- Public intake parish routing schema foundation.
--
-- Promoted after disposable QA evidence and product-owner approval.
-- Rollback reference:
-- docs/sql/public_intake_parish_routing_rollback_draft.sql
--
-- This migration adds only schema needed for future public intake parish
-- routing. Runtime intake routing remains unwired in this phase, and
-- operational RLS policies are intentionally not changed.

BEGIN;

ALTER TABLE public.parishes
  ADD COLUMN IF NOT EXISTS public_slug text,
  ADD COLUMN IF NOT EXISTS public_display_name text,
  ADD COLUMN IF NOT EXISTS public_intake_enabled boolean NOT NULL DEFAULT false;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'parishes_public_slug_format_check'
      AND conrelid = 'public.parishes'::regclass
  ) THEN
    ALTER TABLE public.parishes
      ADD CONSTRAINT parishes_public_slug_format_check
      CHECK (
        public_slug IS NULL
        OR (
          public_slug = lower(public_slug)
          AND public_slug ~ '^[a-z0-9][a-z0-9-]{1,78}[a-z0-9]$'
        )
      );
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS parishes_public_slug_lower_unique
  ON public.parishes (lower(public_slug))
  WHERE public_slug IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.parish_public_intake_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id uuid NOT NULL REFERENCES public.parishes(id) ON DELETE CASCADE,
  hostname text NOT NULL,
  verified_at timestamptz,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT parish_public_intake_domains_hostname_format_check
    CHECK (hostname = lower(hostname) AND hostname !~ '\s')
);

CREATE UNIQUE INDEX IF NOT EXISTS parish_public_intake_domains_hostname_lower_unique
  ON public.parish_public_intake_domains (lower(hostname));

CREATE INDEX IF NOT EXISTS parish_public_intake_domains_parish_id_idx
  ON public.parish_public_intake_domains (parish_id);

CREATE TABLE IF NOT EXISTS public.parish_public_intake_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id uuid NOT NULL REFERENCES public.parishes(id) ON DELETE CASCADE,
  token_hash text NOT NULL,
  label text NOT NULL,
  request_type text,
  expires_at timestamptz,
  active boolean NOT NULL DEFAULT true,
  last_used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT parish_public_intake_tokens_request_type_check
    CHECK (
      request_type IS NULL
      OR request_type IN ('baptism', 'funeral', 'wedding', 'ocia', 'join_parish')
    )
);

CREATE UNIQUE INDEX IF NOT EXISTS parish_public_intake_tokens_token_hash_unique
  ON public.parish_public_intake_tokens (token_hash);

CREATE INDEX IF NOT EXISTS parish_public_intake_tokens_parish_id_idx
  ON public.parish_public_intake_tokens (parish_id);

ALTER TABLE public.parish_public_intake_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parish_public_intake_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS parish_public_intake_domains_staff_select
  ON public.parish_public_intake_domains;
CREATE POLICY parish_public_intake_domains_staff_select
  ON public.parish_public_intake_domains
  FOR SELECT
  TO authenticated
  USING (public.is_authorized_for_parish(parish_id));

DROP POLICY IF EXISTS parish_public_intake_domains_staff_write
  ON public.parish_public_intake_domains;
CREATE POLICY parish_public_intake_domains_staff_write
  ON public.parish_public_intake_domains
  FOR ALL
  TO authenticated
  USING (public.is_authorized_for_parish(parish_id))
  WITH CHECK (public.is_authorized_for_parish(parish_id));

DROP POLICY IF EXISTS parish_public_intake_tokens_staff_select
  ON public.parish_public_intake_tokens;
CREATE POLICY parish_public_intake_tokens_staff_select
  ON public.parish_public_intake_tokens
  FOR SELECT
  TO authenticated
  USING (public.is_authorized_for_parish(parish_id));

DROP POLICY IF EXISTS parish_public_intake_tokens_staff_write
  ON public.parish_public_intake_tokens;
CREATE POLICY parish_public_intake_tokens_staff_write
  ON public.parish_public_intake_tokens
  FOR ALL
  TO authenticated
  USING (public.is_authorized_for_parish(parish_id))
  WITH CHECK (public.is_authorized_for_parish(parish_id));

-- Intentionally no anon policies. Public intake should continue through
-- controlled server routes and service-role writes.

COMMIT;
