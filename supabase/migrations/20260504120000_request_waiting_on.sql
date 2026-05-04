-- Operational "waiting on" tag for parish staff (orthogonal to requests.status).
ALTER TABLE public.requests
  ADD COLUMN IF NOT EXISTS waiting_on text;

COMMENT ON COLUMN public.requests.waiting_on IS
  'What this open request is waiting on (family, documents, priest availability, etc.). Nullable when not tagged.';

ALTER TABLE public.requests DROP CONSTRAINT IF EXISTS requests_waiting_on_check;

ALTER TABLE public.requests
  ADD CONSTRAINT requests_waiting_on_check CHECK (
    waiting_on IS NULL
    OR waiting_on IN (
      'family_response',
      'priest_availability',
      'documents',
      'date_confirmation',
      'parish_staff_action',
      'payment_or_stipend',
      'godparent_paperwork',
      'marriage_prep_documents',
      'other'
    )
  );
