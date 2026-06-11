-- P0: parish scoping for intake + core request table RLS (single-parish V1).
-- Requires public.primary_parish_id() from sacramental records migration.
-- Run after public.parishes and core intake tables exist.

-- ---------------------------------------------------------------------------
-- Grants + parishioner parish_id on insert + backfill
-- ---------------------------------------------------------------------------
GRANT EXECUTE ON FUNCTION public.primary_parish_id() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.parishioners_set_parish_id_before_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.parish_id IS NULL THEN
    NEW.parish_id := public.primary_parish_id();
  END IF;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.parishioners_set_parish_id_before_insert() IS
  'Sets parishioners.parish_id to primary parish on insert when omitted (public intake).';

DROP TRIGGER IF EXISTS parishioners_set_parish_id_before_insert_trg ON public.parishioners;
CREATE TRIGGER parishioners_set_parish_id_before_insert_trg
  BEFORE INSERT ON public.parishioners
  FOR EACH ROW
  EXECUTE FUNCTION public.parishioners_set_parish_id_before_insert();

UPDATE public.parishioners
SET parish_id = public.primary_parish_id()
WHERE parish_id IS NULL
  AND public.primary_parish_id() IS NOT NULL;

-- ---------------------------------------------------------------------------
-- Helper: request belongs to primary parish (via parishioner.parish_id)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.request_belongs_to_primary_parish(p_request_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.requests r
    JOIN public.parishioners p ON p.id = r.parishioner_id
    WHERE r.id = p_request_id
      AND p.parish_id = public.primary_parish_id()
  );
$$;

COMMENT ON FUNCTION public.request_belongs_to_primary_parish(uuid) IS
  'True when the request parishioner belongs to primary_parish_id() (V1 parish scope).';

-- ---------------------------------------------------------------------------
-- parishioners
-- ---------------------------------------------------------------------------
ALTER TABLE public.parishioners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "parishioners_update_authenticated" ON public.parishioners;
DROP POLICY IF EXISTS "parishioners_select_authenticated" ON public.parishioners;
DROP POLICY IF EXISTS "parishioners_insert_anon" ON public.parishioners;
DROP POLICY IF EXISTS "parishioners_insert_authenticated" ON public.parishioners;

CREATE POLICY "parishioners_insert_anon"
  ON public.parishioners
  FOR INSERT
  TO anon
  WITH CHECK (parish_id IS NULL OR parish_id = public.primary_parish_id());

CREATE POLICY "parishioners_select_authenticated"
  ON public.parishioners
  FOR SELECT
  TO authenticated
  USING (parish_id = public.primary_parish_id());

CREATE POLICY "parishioners_update_authenticated"
  ON public.parishioners
  FOR UPDATE
  TO authenticated
  USING (parish_id = public.primary_parish_id())
  WITH CHECK (parish_id = public.primary_parish_id());

-- ---------------------------------------------------------------------------
-- requests
-- ---------------------------------------------------------------------------
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "requests_insert_anon" ON public.requests;
DROP POLICY IF EXISTS "requests_select_authenticated" ON public.requests;
DROP POLICY IF EXISTS "requests_update_authenticated" ON public.requests;

CREATE POLICY "requests_insert_anon"
  ON public.requests
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "requests_select_authenticated"
  ON public.requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.parishioners p
      WHERE p.id = parishioner_id
        AND p.parish_id = public.primary_parish_id()
    )
  );

CREATE POLICY "requests_update_authenticated"
  ON public.requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.parishioners p
      WHERE p.id = parishioner_id
        AND p.parish_id = public.primary_parish_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.parishioners p
      WHERE p.id = parishioner_id
        AND p.parish_id = public.primary_parish_id()
    )
  );

-- ---------------------------------------------------------------------------
-- checklist_items
-- ---------------------------------------------------------------------------
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "checklist_items_insert_anon" ON public.checklist_items;
DROP POLICY IF EXISTS "checklist_items_select_authenticated" ON public.checklist_items;
DROP POLICY IF EXISTS "checklist_items_update_authenticated" ON public.checklist_items;

CREATE POLICY "checklist_items_insert_anon"
  ON public.checklist_items
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "checklist_items_select_authenticated"
  ON public.checklist_items
  FOR SELECT
  TO authenticated
  USING (public.request_belongs_to_primary_parish(request_id));

CREATE POLICY "checklist_items_update_authenticated"
  ON public.checklist_items
  FOR UPDATE
  TO authenticated
  USING (public.request_belongs_to_primary_parish(request_id))
  WITH CHECK (public.request_belongs_to_primary_parish(request_id));

-- ---------------------------------------------------------------------------
-- request_communications (staff only — no anon insert)
-- ---------------------------------------------------------------------------
ALTER TABLE public.request_communications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "request_communications_select_authenticated" ON public.request_communications;
DROP POLICY IF EXISTS "request_communications_insert_authenticated" ON public.request_communications;

CREATE POLICY "request_communications_select_authenticated"
  ON public.request_communications
  FOR SELECT
  TO authenticated
  USING (public.request_belongs_to_primary_parish(request_id));

CREATE POLICY "request_communications_insert_authenticated"
  ON public.request_communications
  FOR INSERT
  TO authenticated
  WITH CHECK (public.request_belongs_to_primary_parish(request_id));
