-- Replace the parishes read policy with role scoping in the TO clause.
-- Supabase deprecates role checks inside RLS predicates; service_role bypasses
-- RLS through its role privileges, while authenticated users remain restricted
-- to membership-authorized parish rows.

DROP POLICY IF EXISTS "parishes_select_authorized_staff" ON public.parishes;
CREATE POLICY "parishes_select_authorized_staff"
  ON public.parishes
  FOR SELECT
  TO authenticated, service_role
  USING (
    public.is_authorized_for_parish(id)
  );

COMMENT ON POLICY "parishes_select_authorized_staff" ON public.parishes IS
  'Authenticated staff may read only authorized parishes; service role access is scoped by the role grant instead of a role-check predicate.';
