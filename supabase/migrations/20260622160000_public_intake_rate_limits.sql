-- Durable public intake rate limiting.
--
-- Public request forms are intentionally open to families, so abuse protection
-- should survive serverless instance churn. The application calls the RPC below
-- through the service role before creating parishioners/requests.

CREATE TABLE IF NOT EXISTS public.rate_limit_buckets (
  key text PRIMARY KEY,
  request_count integer NOT NULL DEFAULT 0,
  window_started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT rate_limit_buckets_key_not_blank CHECK (char_length(btrim(key)) > 0),
  CONSTRAINT rate_limit_buckets_request_count_nonnegative CHECK (request_count >= 0)
);

CREATE INDEX IF NOT EXISTS rate_limit_buckets_expires_at_idx
  ON public.rate_limit_buckets (expires_at);

COMMENT ON TABLE public.rate_limit_buckets IS
  'Durable abuse-protection buckets for public server-side routes such as intake.';

ALTER TABLE public.rate_limit_buckets ENABLE ROW LEVEL SECURITY;

-- No anon/authenticated policies. Server route handlers mediate access through
-- the service role and the RPC below.

CREATE OR REPLACE FUNCTION public.check_public_intake_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
)
RETURNS TABLE(ok boolean, retry_after_seconds integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now timestamptz := now();
  v_window interval;
  v_existing public.rate_limit_buckets%ROWTYPE;
BEGIN
  IF p_key IS NULL OR char_length(btrim(p_key)) = 0 THEN
    RAISE EXCEPTION 'Rate-limit key is required.';
  END IF;

  IF p_limit IS NULL OR p_limit < 1 THEN
    RAISE EXCEPTION 'Rate-limit limit must be positive.';
  END IF;

  IF p_window_seconds IS NULL OR p_window_seconds < 1 THEN
    RAISE EXCEPTION 'Rate-limit window must be positive.';
  END IF;

  v_window := make_interval(secs => p_window_seconds);

  DELETE FROM public.rate_limit_buckets
  WHERE expires_at < (v_now - interval '5 minutes');

  INSERT INTO public.rate_limit_buckets (
    key,
    request_count,
    window_started_at,
    expires_at,
    updated_at
  )
  VALUES (
    p_key,
    0,
    v_now,
    v_now + v_window,
    v_now
  )
  ON CONFLICT (key) DO NOTHING;

  SELECT *
  INTO v_existing
  FROM public.rate_limit_buckets
  WHERE key = p_key
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Could not create rate-limit bucket.';
  END IF;

  IF v_existing.expires_at <= v_now THEN
    UPDATE public.rate_limit_buckets
    SET request_count = 1,
        window_started_at = v_now,
        expires_at = v_now + v_window,
        updated_at = v_now
    WHERE key = p_key;

    RETURN QUERY SELECT true, 0;
    RETURN;
  END IF;

  IF v_existing.request_count >= p_limit THEN
    RETURN QUERY SELECT
      false,
      GREATEST(1, CEIL(EXTRACT(EPOCH FROM (v_existing.expires_at - v_now)))::integer);
    RETURN;
  END IF;

  UPDATE public.rate_limit_buckets
  SET request_count = request_count + 1,
      updated_at = v_now
  WHERE key = p_key;

  RETURN QUERY SELECT true, 0;
END;
$$;

COMMENT ON FUNCTION public.check_public_intake_rate_limit(text, integer, integer) IS
  'Atomically checks and increments a durable rate-limit bucket for public intake.';

REVOKE ALL ON FUNCTION public.check_public_intake_rate_limit(text, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_public_intake_rate_limit(text, integer, integer) TO service_role;
