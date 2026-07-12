-- Disposable Supabase base schema bootstrap candidate for Vinea.
--
-- STATUS: NOT APPLIED.
--
-- This file is a disposable-only candidate for blank Supabase branches,
-- throwaway Supabase projects, or local Supabase databases used for QA.
--
-- DO NOT apply this file to production.
-- DO NOT apply this file to shared QA.
-- DO NOT move this file into supabase/migrations.
-- DO NOT treat this file as an operational RLS migration.
--
-- Purpose:
-- The current supabase/migrations folder is incremental and assumes the
-- original Vinea intake tables already exist. This candidate creates only
-- those original base tables so a blank disposable database can then run the
-- normal repo migrations in sorted filename order.
--
-- Approved base tables only:
-- - public.parishioners
-- - public.requests
-- - public.checklist_items
-- - public.request_communications
--
-- Expected disposable sequence:
-- 1. Verify the target is disposable and not production/shared QA.
-- 2. Apply this candidate.
-- 3. Apply all files in supabase/migrations in sorted filename order.
-- 4. Verify /api/health returns checks.schema: true.
-- 5. Run public intake regression and durable 429 checks.
-- 6. Destroy or clean up the disposable target.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.parishioners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NULL,
  phone text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT parishioners_full_name_not_blank CHECK (char_length(btrim(full_name)) > 0)
);

CREATE TABLE IF NOT EXISTS public.requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parishioner_id uuid NOT NULL REFERENCES public.parishioners (id) ON DELETE CASCADE,
  request_type text NOT NULL,
  child_name text NULL,
  preferred_dates text NULL,
  suggested_date_1 timestamptz NULL,
  suggested_date_2 timestamptz NULL,
  suggested_date_3 timestamptz NULL,
  confirmed_baptism_date timestamptz NULL,
  notes text NULL,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT requests_request_type_not_blank CHECK (char_length(btrim(request_type)) > 0),
  CONSTRAINT requests_status_not_blank CHECK (char_length(btrim(status)) > 0)
);

CREATE INDEX IF NOT EXISTS requests_parishioner_id_idx
  ON public.requests (parishioner_id);

CREATE INDEX IF NOT EXISTS requests_request_type_created_at_idx
  ON public.requests (request_type, created_at DESC);

CREATE TABLE IF NOT EXISTS public.checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.requests (id) ON DELETE CASCADE,
  item_name text NOT NULL,
  is_completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT checklist_items_item_name_not_blank CHECK (char_length(btrim(item_name)) > 0)
);

CREATE INDEX IF NOT EXISTS checklist_items_request_id_idx
  ON public.checklist_items (request_id);

CREATE TABLE IF NOT EXISTS public.request_communications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.requests (id) ON DELETE CASCADE,
  contacted_at timestamptz NOT NULL DEFAULT now(),
  method text NULL,
  notes text NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS request_communications_request_id_contacted_at_idx
  ON public.request_communications (request_id, contacted_at DESC);

COMMENT ON TABLE public.parishioners IS
  'Disposable bootstrap only: original Vinea intake contact table required before current migrations run on a blank test database.';

COMMENT ON TABLE public.requests IS
  'Disposable bootstrap only: original Vinea request table required before current migrations run on a blank test database.';

COMMENT ON TABLE public.checklist_items IS
  'Disposable bootstrap only: original Vinea checklist table required before current migrations run on a blank test database.';

COMMENT ON TABLE public.request_communications IS
  'Disposable bootstrap only: original Vinea communication history table required before current migrations run on a blank test database.';

COMMIT;
