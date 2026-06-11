-- V1 parish sacramental register: sacramental_records + append-only sacramental_record_events.
-- Parish scope matches app helpers (oldest public.parishes row = primary parish).
-- Run via Supabase CLI or SQL editor after public.parishes and public.requests exist.

-- ---------------------------------------------------------------------------
-- Primary parish helper (same ordering as lib/dashboardParishRequestScope.ts)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.primary_parish_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.parishes ORDER BY created_at ASC LIMIT 1;
$$;

COMMENT ON FUNCTION public.primary_parish_id() IS
  'V1 single-parish id: oldest parishes row. Used by sacramental record RLS policies.';

-- ---------------------------------------------------------------------------
-- Sacramental record type (distinct from requests.request_type — e.g. marriage vs wedding)
-- ---------------------------------------------------------------------------
DO $migrate$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'sacramental_record_type'
  ) THEN
    CREATE TYPE public.sacramental_record_type AS ENUM (
      'baptism',
      'marriage',
      'funeral',
      'confirmation',
      'first_communion',
      'ocia',
      'rcic'
    );
  END IF;
END
$migrate$;

COMMENT ON TYPE public.sacramental_record_type IS
  'Sacramental register entry type (V1). Not the same enum as requests.request_type.';

-- ---------------------------------------------------------------------------
-- sacramental_records
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sacramental_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id uuid NOT NULL REFERENCES public.parishes (id) ON DELETE CASCADE,
  request_id uuid NULL REFERENCES public.requests (id) ON DELETE SET NULL,
  record_type public.sacramental_record_type NOT NULL,
  person_name text NOT NULL,
  sacrament_date date NULL,
  place text NULL,
  minister text NULL,
  book text NULL,
  page text NULL,
  line text NULL,
  notes text NULL,
  created_by uuid NULL REFERENCES auth.users (id) ON DELETE SET NULL,
  updated_by uuid NULL REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sacramental_records_person_name_not_blank CHECK (char_length(btrim(person_name)) > 0),
  CONSTRAINT sacramental_records_request_id_unique UNIQUE (request_id)
);

CREATE INDEX IF NOT EXISTS sacramental_records_parish_id_idx
  ON public.sacramental_records (parish_id);

CREATE INDEX IF NOT EXISTS sacramental_records_parish_record_type_idx
  ON public.sacramental_records (parish_id, record_type);

CREATE INDEX IF NOT EXISTS sacramental_records_parish_person_name_idx
  ON public.sacramental_records (parish_id, person_name);

CREATE INDEX IF NOT EXISTS sacramental_records_parish_sacrament_date_idx
  ON public.sacramental_records (parish_id, sacrament_date DESC NULLS LAST);

COMMENT ON TABLE public.sacramental_records IS
  'Parish sacramental register entries. Scoped by parish_id; optionally linked to a completed request.';

COMMENT ON COLUMN public.sacramental_records.request_id IS
  'Optional link to public.requests when the record was created from intake/workflow.';

COMMENT ON COLUMN public.sacramental_records.sacrament_date IS
  'Date of sacrament or service as recorded in the parish register (date only).';

COMMENT ON COLUMN public.sacramental_records.book IS
  'Register book identifier or label (parish-specific).';

COMMENT ON COLUMN public.sacramental_records.page IS
  'Register page reference (stored as text for flexible parish notation).';

COMMENT ON COLUMN public.sacramental_records.line IS
  'Register line reference (stored as text for flexible parish notation).';

-- ---------------------------------------------------------------------------
-- sacramental_record_events (append-only audit)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sacramental_record_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id uuid NOT NULL REFERENCES public.parishes (id) ON DELETE CASCADE,
  sacramental_record_id uuid NOT NULL REFERENCES public.sacramental_records (id) ON DELETE CASCADE,
  action text NOT NULL,
  actor_id uuid NULL REFERENCES auth.users (id) ON DELETE SET NULL,
  actor_email text NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sacramental_record_events_action_not_blank CHECK (char_length(btrim(action)) > 0)
);

CREATE INDEX IF NOT EXISTS sacramental_record_events_record_id_created_at_idx
  ON public.sacramental_record_events (sacramental_record_id, created_at DESC);

CREATE INDEX IF NOT EXISTS sacramental_record_events_parish_id_created_at_idx
  ON public.sacramental_record_events (parish_id, created_at DESC);

COMMENT ON TABLE public.sacramental_record_events IS
  'Append-only audit trail for sacramental_records (created/updated).';

-- ---------------------------------------------------------------------------
-- Audit triggers: stamp auth user + write events
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sacramental_records_before_write()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.created_by := COALESCE(NEW.created_by, auth.uid());
    NEW.updated_by := COALESCE(NEW.updated_by, auth.uid());
    NEW.updated_at := now();
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    NEW.updated_by := auth.uid();
    NEW.updated_at := now();
    NEW.parish_id := OLD.parish_id;
    NEW.created_by := OLD.created_by;
    NEW.created_at := OLD.created_at;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.sacramental_record_events_after_write()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_action text;
  v_metadata jsonb := '{}'::jsonb;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_action := 'created';
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'updated';
    v_metadata := jsonb_build_object(
      'record_type', NEW.record_type::text,
      'person_name', NEW.person_name
    );
  ELSE
    RETURN NULL;
  END IF;

  INSERT INTO public.sacramental_record_events (
    parish_id,
    sacramental_record_id,
    action,
    actor_id,
    actor_email,
    metadata
  )
  VALUES (
    NEW.parish_id,
    NEW.id,
    v_action,
    auth.uid(),
    COALESCE(auth.jwt() ->> 'email', NULL),
    v_metadata
  );

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS sacramental_records_before_write_trg ON public.sacramental_records;
CREATE TRIGGER sacramental_records_before_write_trg
  BEFORE INSERT OR UPDATE ON public.sacramental_records
  FOR EACH ROW
  EXECUTE FUNCTION public.sacramental_records_before_write();

DROP TRIGGER IF EXISTS sacramental_record_events_after_write_trg ON public.sacramental_records;
CREATE TRIGGER sacramental_record_events_after_write_trg
  AFTER INSERT OR UPDATE ON public.sacramental_records
  FOR EACH ROW
  EXECUTE FUNCTION public.sacramental_record_events_after_write();

-- ---------------------------------------------------------------------------
-- Row level security — authenticated staff; no cross-parish access
-- ---------------------------------------------------------------------------
ALTER TABLE public.sacramental_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sacramental_record_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sacramental_records_select_authenticated" ON public.sacramental_records;
CREATE POLICY "sacramental_records_select_authenticated"
  ON public.sacramental_records
  FOR SELECT
  TO authenticated
  USING (parish_id = public.primary_parish_id());

DROP POLICY IF EXISTS "sacramental_records_insert_authenticated" ON public.sacramental_records;
CREATE POLICY "sacramental_records_insert_authenticated"
  ON public.sacramental_records
  FOR INSERT
  TO authenticated
  WITH CHECK (parish_id = public.primary_parish_id());

DROP POLICY IF EXISTS "sacramental_records_update_authenticated" ON public.sacramental_records;
CREATE POLICY "sacramental_records_update_authenticated"
  ON public.sacramental_records
  FOR UPDATE
  TO authenticated
  USING (parish_id = public.primary_parish_id())
  WITH CHECK (parish_id = public.primary_parish_id());

DROP POLICY IF EXISTS "sacramental_record_events_select_authenticated" ON public.sacramental_record_events;
CREATE POLICY "sacramental_record_events_select_authenticated"
  ON public.sacramental_record_events
  FOR SELECT
  TO authenticated
  USING (parish_id = public.primary_parish_id());

DROP POLICY IF EXISTS "sacramental_record_events_insert_authenticated" ON public.sacramental_record_events;
CREATE POLICY "sacramental_record_events_insert_authenticated"
  ON public.sacramental_record_events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    parish_id = public.primary_parish_id()
    AND EXISTS (
      SELECT 1
      FROM public.sacramental_records r
      WHERE r.id = sacramental_record_id
        AND r.parish_id = public.primary_parish_id()
    )
  );

-- No UPDATE/DELETE policies on sacramental_record_events (append-only via trigger + optional app inserts).
