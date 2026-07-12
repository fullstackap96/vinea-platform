-- Keep current staff management writes in sync with the tenancy foundation.
--
-- Existing staff management still writes public.staff_users. This trigger
-- mirrors those changes into public.parish_memberships so the next tenancy
-- phases can rely on membership data without changing operational RLS yet.

CREATE OR REPLACE FUNCTION public.sync_parish_membership_from_staff_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE public.parish_memberships
    SET active = false,
        updated_at = now()
    WHERE parish_id = OLD.parish_id
      AND email = lower(OLD.email);

    RETURN OLD;
  END IF;

  IF TG_OP = 'UPDATE' AND lower(NEW.email) <> lower(OLD.email) THEN
    UPDATE public.parish_memberships
    SET active = false,
        updated_at = now()
    WHERE parish_id = OLD.parish_id
      AND email = lower(OLD.email);
  END IF;

  INSERT INTO public.parish_memberships (
    parish_id,
    email,
    role,
    active,
    created_at,
    updated_at
  )
  VALUES (
    NEW.parish_id,
    lower(NEW.email),
    NEW.role,
    NEW.active,
    NEW.created_at,
    NEW.updated_at
  )
  ON CONFLICT (parish_id, email) DO UPDATE
  SET
    role = EXCLUDED.role,
    active = EXCLUDED.active,
    updated_at = now();

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.sync_parish_membership_from_staff_user() IS
  'Mirrors staff_users changes into parish_memberships during the tenancy transition.';

DROP TRIGGER IF EXISTS staff_users_sync_parish_membership_trg ON public.staff_users;
CREATE TRIGGER staff_users_sync_parish_membership_trg
  AFTER INSERT OR UPDATE OR DELETE ON public.staff_users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_parish_membership_from_staff_user();

REVOKE EXECUTE ON FUNCTION public.sync_parish_membership_from_staff_user() FROM PUBLIC;
