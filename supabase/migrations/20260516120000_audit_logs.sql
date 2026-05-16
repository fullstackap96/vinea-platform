-- Append-only staff action audit trail (server-side writes; no UI reader yet).
-- Application must not store secrets, OAuth refresh tokens, API keys, or full email bodies in metadata.

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id uuid REFERENCES public.parishes (id) ON DELETE SET NULL,
  actor_email text,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT audit_logs_action_nonempty CHECK (char_length(trim(action)) > 0),
  CONSTRAINT audit_logs_entity_type_nonempty CHECK (char_length(trim(entity_type)) > 0)
);

CREATE INDEX IF NOT EXISTS audit_logs_parish_id_created_at_idx
  ON public.audit_logs (parish_id, created_at DESC);

CREATE INDEX IF NOT EXISTS audit_logs_entity_created_at_idx
  ON public.audit_logs (entity_type, entity_id, created_at DESC);

CREATE INDEX IF NOT EXISTS audit_logs_action_created_at_idx
  ON public.audit_logs (action, created_at DESC);

COMMENT ON TABLE public.audit_logs IS
  'Append-only audit log for parish staff actions. Inserts are intended via service role from the app. Do not put secrets or full email bodies in metadata.';

COMMENT ON COLUMN public.audit_logs.parish_id IS
  'Parish scope for filtering; SET NULL if parish row is deleted.';

COMMENT ON COLUMN public.audit_logs.actor_email IS
  'Normalized staff email at time of action (from Supabase Auth session).';

COMMENT ON COLUMN public.audit_logs.action IS
  'Stable event name, e.g. parish_settings.updated, request.status_changed.';

COMMENT ON COLUMN public.audit_logs.entity_type IS
  'Resource kind, e.g. parish, request, request_note, google_calendar_event.';

COMMENT ON COLUMN public.audit_logs.entity_id IS
  'Primary key of the affected resource when applicable.';

COMMENT ON COLUMN public.audit_logs.metadata IS
  'Small JSON context (diffs, ids, counts). Never tokens, env secrets, or email body text.';

-- RLS: deferred until parish_staff and read policies are defined (see docs/RLS_POLICY_PLAN.md).
