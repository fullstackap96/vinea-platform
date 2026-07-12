-- NON-APPLIED ROLLBACK DRAFT ONLY.
-- Use only in a disposable Supabase branch/project after testing:
-- docs/sql/public_intake_parish_routing_migration_candidate.sql
--
-- Do not apply to the current QA or production database without explicit
-- approval. This rollback removes the public intake parish routing foundation
-- objects created by the candidate.

BEGIN;

DROP POLICY IF EXISTS parish_public_intake_tokens_staff_write
  ON public.parish_public_intake_tokens;
DROP POLICY IF EXISTS parish_public_intake_tokens_staff_select
  ON public.parish_public_intake_tokens;
DROP POLICY IF EXISTS parish_public_intake_domains_staff_write
  ON public.parish_public_intake_domains;
DROP POLICY IF EXISTS parish_public_intake_domains_staff_select
  ON public.parish_public_intake_domains;

DROP TABLE IF EXISTS public.parish_public_intake_tokens;
DROP TABLE IF EXISTS public.parish_public_intake_domains;

DROP INDEX IF EXISTS public.parishes_public_slug_lower_unique;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'parishes_public_slug_format_check'
      AND conrelid = 'public.parishes'::regclass
  ) THEN
    ALTER TABLE public.parishes
      DROP CONSTRAINT parishes_public_slug_format_check;
  END IF;
END $$;

ALTER TABLE public.parishes
  DROP COLUMN IF EXISTS public_intake_enabled,
  DROP COLUMN IF EXISTS public_display_name,
  DROP COLUMN IF EXISTS public_slug;

COMMIT;
