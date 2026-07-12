-- Resolve Supabase advisor issue rls_disabled_in_public for the base parishes table.
--
-- public.parishes started as a V1 single-parish compatibility table before the
-- multi-parish membership model existed. It now participates in tenant scope
-- and must have RLS enabled. Staff reads are limited to active parish
-- memberships; privileged server-side service-role access is unchanged.

ALTER TABLE public.parishes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "parishes_select_authorized_staff" ON public.parishes;
CREATE POLICY "parishes_select_authorized_staff"
  ON public.parishes
  FOR SELECT
  TO authenticated, service_role
  USING (
    auth.role() = 'service_role'
    OR public.is_authorized_for_parish(id)
  );

COMMENT ON POLICY "parishes_select_authorized_staff" ON public.parishes IS
  'Authenticated staff may read only authorized parishes; service role remains available for server-side health and admin workflows.';
