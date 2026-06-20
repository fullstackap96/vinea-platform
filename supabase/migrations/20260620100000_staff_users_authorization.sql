-- Staff authorization for parish dashboard/API access.

CREATE TABLE IF NOT EXISTS public.staff_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id uuid NOT NULL REFERENCES public.parishes (id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (parish_id, email)
);

CREATE INDEX IF NOT EXISTS staff_users_email_active_idx
  ON public.staff_users (lower(email), active);

COMMENT ON TABLE public.staff_users IS
  'Authorized Vinea staff login emails for a parish workspace.';

ALTER TABLE public.staff_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staff_users_select_self" ON public.staff_users;

CREATE POLICY "staff_users_select_self"
  ON public.staff_users
  FOR SELECT
  TO authenticated
  USING (
    active = true
    AND lower(email) = lower(COALESCE(auth.jwt() ->> 'email', ''))
  );
