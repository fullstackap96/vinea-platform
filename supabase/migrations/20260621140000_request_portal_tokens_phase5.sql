-- Phase 5: secure-token family portal access for request documents.
-- Raw tokens are never stored; only SHA-256 token hashes are persisted.

CREATE TABLE IF NOT EXISTS public.request_portal_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id uuid NOT NULL REFERENCES public.parishes (id) ON DELETE CASCADE,
  request_id uuid NOT NULL REFERENCES public.requests (id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  purpose text NOT NULL DEFAULT 'documents',
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  revoked_at timestamptz NULL,
  created_by uuid NULL REFERENCES auth.users (id) ON DELETE SET NULL,
  created_by_email text NULL,
  last_used_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT request_portal_tokens_hash_not_blank CHECK (char_length(btrim(token_hash)) > 0),
  CONSTRAINT request_portal_tokens_purpose_valid CHECK (purpose IN ('documents')),
  CONSTRAINT request_portal_tokens_expiry_after_create CHECK (expires_at > created_at)
);

CREATE INDEX IF NOT EXISTS request_portal_tokens_request_active_idx
  ON public.request_portal_tokens (parish_id, request_id, expires_at DESC)
  WHERE revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS request_portal_tokens_hash_active_idx
  ON public.request_portal_tokens (token_hash)
  WHERE revoked_at IS NULL;

COMMENT ON TABLE public.request_portal_tokens IS
  'Hashed, revocable, expiring tokens that grant limited family-facing access to request documents.';

ALTER TABLE public.request_portal_tokens ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS request_portal_tokens_touch_updated_at_trg ON public.request_portal_tokens;
CREATE TRIGGER request_portal_tokens_touch_updated_at_trg
  BEFORE UPDATE ON public.request_portal_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.workflow_templates_touch_updated_at();

-- No anon/authenticated policies are created. Staff and family portal access are mediated by
-- server-side route handlers using the service role after explicit authorization/token checks.
