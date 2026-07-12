-- Multi-parish tenancy foundation.
--
-- This migration adds durable user-to-parish membership primitives without
-- rewriting existing V1 RLS policies. Existing primary_parish_id()-scoped
-- policies remain in place until a later, reviewable RLS migration.

CREATE TABLE IF NOT EXISTS public.parish_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id uuid NOT NULL REFERENCES public.parishes (id) ON DELETE CASCADE,
  user_id uuid NULL REFERENCES auth.users (id) ON DELETE SET NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT parish_memberships_email_not_blank CHECK (char_length(btrim(email)) > 0),
  CONSTRAINT parish_memberships_email_lowercase CHECK (email = lower(email)),
  CONSTRAINT parish_memberships_parish_email_unique UNIQUE (parish_id, email)
);

CREATE INDEX IF NOT EXISTS parish_memberships_user_active_idx
  ON public.parish_memberships (user_id, active)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS parish_memberships_email_active_idx
  ON public.parish_memberships (email, active);

CREATE UNIQUE INDEX IF NOT EXISTS parish_memberships_parish_user_unique_idx
  ON public.parish_memberships (parish_id, user_id)
  WHERE user_id IS NOT NULL;

COMMENT ON TABLE public.parish_memberships IS
  'Future multi-parish staff membership table. This is the foundation for replacing V1 primary_parish_id() scoping.';

COMMENT ON COLUMN public.parish_memberships.user_id IS
  'Optional Supabase Auth user link. Email remains the compatibility key for current staff authorization.';

INSERT INTO public.parish_memberships (
  parish_id,
  email,
  role,
  active,
  created_at,
  updated_at
)
SELECT
  su.parish_id,
  lower(su.email),
  su.role,
  su.active,
  su.created_at,
  su.updated_at
FROM public.staff_users su
ON CONFLICT (parish_id, email) DO UPDATE
SET
  role = EXCLUDED.role,
  active = EXCLUDED.active,
  updated_at = now();

ALTER TABLE public.parish_memberships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "parish_memberships_select_self" ON public.parish_memberships;
CREATE POLICY "parish_memberships_select_self"
  ON public.parish_memberships
  FOR SELECT
  TO authenticated
  USING (
    active = true
    AND (
      user_id = auth.uid()
      OR email = lower(COALESCE(auth.jwt() ->> 'email', ''))
    )
  );

CREATE OR REPLACE FUNCTION public.current_staff_parish_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT pm.parish_id
  FROM public.parish_memberships pm
  WHERE pm.active = true
    AND (
      pm.user_id = auth.uid()
      OR pm.email = lower(COALESCE(auth.jwt() ->> 'email', ''))
    )

  UNION

  SELECT DISTINCT su.parish_id
  FROM public.staff_users su
  WHERE su.active = true
    AND lower(su.email) = lower(COALESCE(auth.jwt() ->> 'email', ''));
$$;

COMMENT ON FUNCTION public.current_staff_parish_ids() IS
  'Returns parish ids the current authenticated staff user belongs to. Includes staff_users as a V1 compatibility source.';

CREATE OR REPLACE FUNCTION public.current_staff_primary_parish_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id
  FROM public.parishes p
  WHERE p.id IN (SELECT public.current_staff_parish_ids())
  ORDER BY p.created_at ASC
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.current_staff_primary_parish_id() IS
  'Returns the first parish visible to the current staff user. Future replacement for primary_parish_id()-only app scope.';

CREATE OR REPLACE FUNCTION public.is_authorized_for_parish(p_parish_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p_parish_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.current_staff_parish_ids() scoped(parish_id)
      WHERE scoped.parish_id = p_parish_id
    );
$$;

COMMENT ON FUNCTION public.is_authorized_for_parish(uuid) IS
  'True when the current authenticated staff user is an active member of the requested parish.';

REVOKE EXECUTE ON FUNCTION public.current_staff_parish_ids() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.current_staff_primary_parish_id() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_authorized_for_parish(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.current_staff_parish_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_staff_primary_parish_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_authorized_for_parish(uuid) TO authenticated;
