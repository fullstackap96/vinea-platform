-- Request detail table RLS for public intake + staff dashboard.
-- Complements P0 core RLS (20260610180000_core_request_rls_and_parish_scope.sql).
-- Requires public.request_belongs_to_primary_parish(uuid).

GRANT EXECUTE ON FUNCTION public.request_belongs_to_primary_parish(uuid) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- funeral_request_details
-- ---------------------------------------------------------------------------
ALTER TABLE public.funeral_request_details ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "funeral_request_details_insert_anon" ON public.funeral_request_details;
DROP POLICY IF EXISTS "funeral_request_details_select_authenticated" ON public.funeral_request_details;
DROP POLICY IF EXISTS "funeral_request_details_insert_authenticated" ON public.funeral_request_details;
DROP POLICY IF EXISTS "funeral_request_details_update_authenticated" ON public.funeral_request_details;
-- Legacy / commented example names (safe no-op if absent)
DROP POLICY IF EXISTS "funeral_details_insert_anon" ON public.funeral_request_details;
DROP POLICY IF EXISTS "funeral_details_select_authenticated" ON public.funeral_request_details;
DROP POLICY IF EXISTS "funeral_details_insert_authenticated" ON public.funeral_request_details;
DROP POLICY IF EXISTS "funeral_details_update_authenticated" ON public.funeral_request_details;

CREATE POLICY "funeral_request_details_insert_anon"
  ON public.funeral_request_details
  FOR INSERT
  TO anon
  WITH CHECK (public.request_belongs_to_primary_parish(request_id));

COMMENT ON POLICY "funeral_request_details_insert_anon" ON public.funeral_request_details IS
  'Public funeral intake inserts detail row after parent request is created. WITH CHECK uses request_belongs_to_primary_parish because intake runs sequential client calls (parishioner → request → details), so the parent row is visible before this insert.';

CREATE POLICY "funeral_request_details_select_authenticated"
  ON public.funeral_request_details
  FOR SELECT
  TO authenticated
  USING (public.request_belongs_to_primary_parish(request_id));

CREATE POLICY "funeral_request_details_insert_authenticated"
  ON public.funeral_request_details
  FOR INSERT
  TO authenticated
  WITH CHECK (public.request_belongs_to_primary_parish(request_id));

CREATE POLICY "funeral_request_details_update_authenticated"
  ON public.funeral_request_details
  FOR UPDATE
  TO authenticated
  USING (public.request_belongs_to_primary_parish(request_id))
  WITH CHECK (public.request_belongs_to_primary_parish(request_id));

-- ---------------------------------------------------------------------------
-- wedding_request_details
-- ---------------------------------------------------------------------------
ALTER TABLE public.wedding_request_details ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wedding_request_details_insert_anon" ON public.wedding_request_details;
DROP POLICY IF EXISTS "wedding_request_details_select_authenticated" ON public.wedding_request_details;
DROP POLICY IF EXISTS "wedding_request_details_insert_authenticated" ON public.wedding_request_details;
DROP POLICY IF EXISTS "wedding_request_details_update_authenticated" ON public.wedding_request_details;
DROP POLICY IF EXISTS "wedding_details_insert_anon" ON public.wedding_request_details;
DROP POLICY IF EXISTS "wedding_details_select_authenticated" ON public.wedding_request_details;
DROP POLICY IF EXISTS "wedding_details_insert_authenticated" ON public.wedding_request_details;
DROP POLICY IF EXISTS "wedding_details_update_authenticated" ON public.wedding_request_details;

CREATE POLICY "wedding_request_details_insert_anon"
  ON public.wedding_request_details
  FOR INSERT
  TO anon
  WITH CHECK (public.request_belongs_to_primary_parish(request_id));

COMMENT ON POLICY "wedding_request_details_insert_anon" ON public.wedding_request_details IS
  'Public wedding intake inserts detail row after parent request is created. WITH CHECK uses request_belongs_to_primary_parish because intake runs sequential client calls (parishioner → request → details), so the parent row is visible before this insert.';

CREATE POLICY "wedding_request_details_select_authenticated"
  ON public.wedding_request_details
  FOR SELECT
  TO authenticated
  USING (public.request_belongs_to_primary_parish(request_id));

CREATE POLICY "wedding_request_details_insert_authenticated"
  ON public.wedding_request_details
  FOR INSERT
  TO authenticated
  WITH CHECK (public.request_belongs_to_primary_parish(request_id));

CREATE POLICY "wedding_request_details_update_authenticated"
  ON public.wedding_request_details
  FOR UPDATE
  TO authenticated
  USING (public.request_belongs_to_primary_parish(request_id))
  WITH CHECK (public.request_belongs_to_primary_parish(request_id));

-- ---------------------------------------------------------------------------
-- ocia_request_details
-- ---------------------------------------------------------------------------
ALTER TABLE public.ocia_request_details ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ocia_request_details_insert_anon" ON public.ocia_request_details;
DROP POLICY IF EXISTS "ocia_request_details_select_authenticated" ON public.ocia_request_details;
DROP POLICY IF EXISTS "ocia_request_details_insert_authenticated" ON public.ocia_request_details;
DROP POLICY IF EXISTS "ocia_request_details_update_authenticated" ON public.ocia_request_details;
DROP POLICY IF EXISTS "ocia_details_insert_anon" ON public.ocia_request_details;
DROP POLICY IF EXISTS "ocia_details_select_authenticated" ON public.ocia_request_details;
DROP POLICY IF EXISTS "ocia_details_insert_authenticated" ON public.ocia_request_details;
DROP POLICY IF EXISTS "ocia_details_update_authenticated" ON public.ocia_request_details;

CREATE POLICY "ocia_request_details_insert_anon"
  ON public.ocia_request_details
  FOR INSERT
  TO anon
  WITH CHECK (public.request_belongs_to_primary_parish(request_id));

COMMENT ON POLICY "ocia_request_details_insert_anon" ON public.ocia_request_details IS
  'Public OCIA intake inserts detail row after parent request is created. WITH CHECK uses request_belongs_to_primary_parish because intake runs sequential client calls (parishioner → request → details), so the parent row is visible before this insert.';

CREATE POLICY "ocia_request_details_select_authenticated"
  ON public.ocia_request_details
  FOR SELECT
  TO authenticated
  USING (public.request_belongs_to_primary_parish(request_id));

CREATE POLICY "ocia_request_details_insert_authenticated"
  ON public.ocia_request_details
  FOR INSERT
  TO authenticated
  WITH CHECK (public.request_belongs_to_primary_parish(request_id));

CREATE POLICY "ocia_request_details_update_authenticated"
  ON public.ocia_request_details
  FOR UPDATE
  TO authenticated
  USING (public.request_belongs_to_primary_parish(request_id))
  WITH CHECK (public.request_belongs_to_primary_parish(request_id));

-- ---------------------------------------------------------------------------
-- join_parish_request_details
-- ---------------------------------------------------------------------------
ALTER TABLE public.join_parish_request_details ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "join_parish_request_details_insert_anon" ON public.join_parish_request_details;
DROP POLICY IF EXISTS "join_parish_request_details_select_authenticated" ON public.join_parish_request_details;
DROP POLICY IF EXISTS "join_parish_request_details_insert_authenticated" ON public.join_parish_request_details;
DROP POLICY IF EXISTS "join_parish_request_details_update_authenticated" ON public.join_parish_request_details;
DROP POLICY IF EXISTS "join_parish_details_insert_anon" ON public.join_parish_request_details;
DROP POLICY IF EXISTS "join_parish_details_select_authenticated" ON public.join_parish_request_details;
DROP POLICY IF EXISTS "join_parish_details_insert_authenticated" ON public.join_parish_request_details;
DROP POLICY IF EXISTS "join_parish_details_update_authenticated" ON public.join_parish_request_details;

CREATE POLICY "join_parish_request_details_insert_anon"
  ON public.join_parish_request_details
  FOR INSERT
  TO anon
  WITH CHECK (public.request_belongs_to_primary_parish(request_id));

COMMENT ON POLICY "join_parish_request_details_insert_anon" ON public.join_parish_request_details IS
  'Public join-parish intake inserts detail row after parent request is created. WITH CHECK uses request_belongs_to_primary_parish because intake runs sequential client calls (parishioner → request → details), so the parent row is visible before this insert.';

CREATE POLICY "join_parish_request_details_select_authenticated"
  ON public.join_parish_request_details
  FOR SELECT
  TO authenticated
  USING (public.request_belongs_to_primary_parish(request_id));

CREATE POLICY "join_parish_request_details_insert_authenticated"
  ON public.join_parish_request_details
  FOR INSERT
  TO authenticated
  WITH CHECK (public.request_belongs_to_primary_parish(request_id));

CREATE POLICY "join_parish_request_details_update_authenticated"
  ON public.join_parish_request_details
  FOR UPDATE
  TO authenticated
  USING (public.request_belongs_to_primary_parish(request_id))
  WITH CHECK (public.request_belongs_to_primary_parish(request_id));
