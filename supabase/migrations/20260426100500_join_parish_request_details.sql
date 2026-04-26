-- Join Parish request type support.
-- - Adds enum value for requests.request_type if the column is backed by an enum.
-- - Creates join_parish_request_details table for type-specific fields.

DO $$
DECLARE
  request_type_regtype regtype;
  request_type_typname text;
  request_type_typtype "char";
BEGIN
  -- Determine the underlying type of public.requests.request_type (enum vs text).
  SELECT a.atttypid::regtype
    INTO request_type_regtype
  FROM pg_attribute a
  JOIN pg_class c ON c.oid = a.attrelid
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relname = 'requests'
    AND a.attname = 'request_type'
    AND a.attnum > 0
    AND NOT a.attisdropped;

  IF request_type_regtype IS NULL THEN
    -- requests table may not exist in this migration context; skip safely.
    RETURN;
  END IF;

  SELECT t.typname, t.typtype
    INTO request_type_typname, request_type_typtype
  FROM pg_type t
  WHERE t.oid = request_type_regtype::oid;

  IF request_type_typtype = 'e' THEN
    -- Add enum value if missing (Postgres supports IF NOT EXISTS on ALTER TYPE ADD VALUE).
    EXECUTE format('ALTER TYPE %s ADD VALUE IF NOT EXISTS %L', request_type_regtype, 'join_parish');
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS public.join_parish_request_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES public.requests (id) ON DELETE CASCADE,
  moving_into_parish text,
  address text,
  household_members text,
  baptized text,
  confirmed text,
  first_communion text,
  already_catholic text,
  interested_in_ocia text,
  reason text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS join_parish_request_details_request_id_idx
  ON public.join_parish_request_details (request_id);

ALTER TABLE public.join_parish_request_details ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.join_parish_request_details IS 'Type-specific fields for request_type = join_parish';

