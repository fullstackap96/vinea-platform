-- Staff-managed ownership verification metadata for future public intake domains.
--
-- This migration is intentionally additive. It does not wire runtime public
-- intake routing and does not change operational table RLS.

ALTER TABLE public.parish_public_intake_domains
  ADD COLUMN IF NOT EXISTS verification_token text,
  ADD COLUMN IF NOT EXISTS verification_dns_name text,
  ADD COLUMN IF NOT EXISTS verification_dns_value text,
  ADD COLUMN IF NOT EXISTS verification_checked_at timestamptz,
  ADD COLUMN IF NOT EXISTS verification_error text;

CREATE INDEX IF NOT EXISTS parish_public_intake_domains_verification_checked_at_idx
  ON public.parish_public_intake_domains (verification_checked_at);

COMMENT ON COLUMN public.parish_public_intake_domains.verification_token IS
  'Public DNS challenge token for staff-managed public intake domain ownership verification.';

COMMENT ON COLUMN public.parish_public_intake_domains.verification_dns_name IS
  'DNS TXT record name staff should configure to verify ownership of a public intake domain.';

COMMENT ON COLUMN public.parish_public_intake_domains.verification_dns_value IS
  'DNS TXT record value expected during public intake domain ownership verification.';

COMMENT ON COLUMN public.parish_public_intake_domains.verification_checked_at IS
  'Last time Vinea checked DNS ownership verification for this public intake domain.';

COMMENT ON COLUMN public.parish_public_intake_domains.verification_error IS
  'Last safe staff-facing DNS verification failure message for this public intake domain.';
