-- Prevent staff from saving past suggested/confirmed schedule values.
-- IMPORTANT: This is implemented as triggers (not CHECK constraints) so that:
-- - historical past values can still exist
-- - unrelated updates on old requests do not break
-- - only changing these specific fields to a past value is blocked

CREATE OR REPLACE FUNCTION public.vinea_validate_schedule_not_past()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  now_ts timestamptz := now();
  today date := (now())::date;
BEGIN
  -- requests.suggested_date_{1,2,3}: validate by DATE only (today or later)
  IF TG_TABLE_NAME = 'requests' THEN
    IF NEW.suggested_date_1 IS DISTINCT FROM OLD.suggested_date_1
       AND NEW.suggested_date_1 IS NOT NULL
       AND (NEW.suggested_date_1)::date < today THEN
      RAISE EXCEPTION 'Suggested dates must be today or later.';
    END IF;

    IF NEW.suggested_date_2 IS DISTINCT FROM OLD.suggested_date_2
       AND NEW.suggested_date_2 IS NOT NULL
       AND (NEW.suggested_date_2)::date < today THEN
      RAISE EXCEPTION 'Suggested dates must be today or later.';
    END IF;

    IF NEW.suggested_date_3 IS DISTINCT FROM OLD.suggested_date_3
       AND NEW.suggested_date_3 IS NOT NULL
       AND (NEW.suggested_date_3)::date < today THEN
      RAISE EXCEPTION 'Suggested dates must be today or later.';
    END IF;

    -- requests.confirmed_baptism_date: validate by timestamp (now or later)
    IF NEW.confirmed_baptism_date IS DISTINCT FROM OLD.confirmed_baptism_date
       AND NEW.confirmed_baptism_date IS NOT NULL
       AND NEW.confirmed_baptism_date < now_ts THEN
      RAISE EXCEPTION 'Please choose a future date and time before saving.';
    END IF;

    RETURN NEW;
  END IF;

  -- funeral_request_details.confirmed_service_at: validate by timestamp (now or later)
  IF TG_TABLE_NAME = 'funeral_request_details' THEN
    IF NEW.confirmed_service_at IS DISTINCT FROM OLD.confirmed_service_at
       AND NEW.confirmed_service_at IS NOT NULL
       AND NEW.confirmed_service_at < now_ts THEN
      RAISE EXCEPTION 'Please choose a future date and time before saving.';
    END IF;
    RETURN NEW;
  END IF;

  -- wedding_request_details.confirmed_ceremony_at: validate by timestamp (now or later)
  IF TG_TABLE_NAME = 'wedding_request_details' THEN
    IF NEW.confirmed_ceremony_at IS DISTINCT FROM OLD.confirmed_ceremony_at
       AND NEW.confirmed_ceremony_at IS NOT NULL
       AND NEW.confirmed_ceremony_at < now_ts THEN
      RAISE EXCEPTION 'Please choose a future date and time before saving.';
    END IF;
    RETURN NEW;
  END IF;

  -- ocia_request_details.confirmed_session_at: validate by timestamp (now or later)
  IF TG_TABLE_NAME = 'ocia_request_details' THEN
    IF NEW.confirmed_session_at IS DISTINCT FROM OLD.confirmed_session_at
       AND NEW.confirmed_session_at IS NOT NULL
       AND NEW.confirmed_session_at < now_ts THEN
      RAISE EXCEPTION 'Please choose a future date and time before saving.';
    END IF;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

-- Triggers (BEFORE UPDATE so we can compare OLD vs NEW)
DROP TRIGGER IF EXISTS vinea_requests_schedule_not_past ON public.requests;
CREATE TRIGGER vinea_requests_schedule_not_past
BEFORE UPDATE ON public.requests
FOR EACH ROW
EXECUTE FUNCTION public.vinea_validate_schedule_not_past();

DROP TRIGGER IF EXISTS vinea_funeral_schedule_not_past ON public.funeral_request_details;
CREATE TRIGGER vinea_funeral_schedule_not_past
BEFORE UPDATE ON public.funeral_request_details
FOR EACH ROW
EXECUTE FUNCTION public.vinea_validate_schedule_not_past();

DROP TRIGGER IF EXISTS vinea_wedding_schedule_not_past ON public.wedding_request_details;
CREATE TRIGGER vinea_wedding_schedule_not_past
BEFORE UPDATE ON public.wedding_request_details
FOR EACH ROW
EXECUTE FUNCTION public.vinea_validate_schedule_not_past();

DROP TRIGGER IF EXISTS vinea_ocia_schedule_not_past ON public.ocia_request_details;
CREATE TRIGGER vinea_ocia_schedule_not_past
BEFORE UPDATE ON public.ocia_request_details
FOR EACH ROW
EXECUTE FUNCTION public.vinea_validate_schedule_not_past();

