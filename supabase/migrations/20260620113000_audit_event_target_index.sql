-- Faster request-level activity lookups.

CREATE INDEX IF NOT EXISTS audit_events_target_created_at_idx
  ON public.audit_events (target_type, target_id, created_at DESC);
