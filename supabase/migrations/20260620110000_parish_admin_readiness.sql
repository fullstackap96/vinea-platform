-- Parish readiness controls: onboarding status, configurable care windows, and audit events.

ALTER TABLE public.parishes
  ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS workflow_sla_rules jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.parishes.onboarding_completed_at IS
  'Set when the parish admin completes the initial Vinea setup checklist.';

COMMENT ON COLUMN public.parishes.workflow_sla_rules IS
  'Configurable first-contact and owner assignment day targets by request type.';

CREATE TABLE IF NOT EXISTS public.audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id uuid NULL REFERENCES public.parishes (id) ON DELETE SET NULL,
  actor_email text NULL,
  action text NOT NULL,
  target_type text NOT NULL,
  target_id text NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_events_parish_created_at_idx
  ON public.audit_events (parish_id, created_at DESC);

COMMENT ON TABLE public.audit_events IS
  'Append-only audit trail for sensitive parish operations and configuration changes.';

ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_events_select_staff" ON public.audit_events;

CREATE POLICY "audit_events_select_staff"
  ON public.audit_events
  FOR SELECT
  TO authenticated
  USING (
    public.is_authorized_staff()
    AND (parish_id IS NULL OR parish_id = public.primary_parish_id())
  );
