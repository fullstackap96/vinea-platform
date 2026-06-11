-- People & household profiles (V1): parish-scoped directory linked to requests/records.
-- Requires public.primary_parish_id() from sacramental records migration.

-- ---------------------------------------------------------------------------
-- people
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.people (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id uuid NOT NULL REFERENCES public.parishes (id) ON DELETE CASCADE,
  parishioner_id uuid NULL UNIQUE REFERENCES public.parishioners (id) ON DELETE SET NULL,
  first_name text NOT NULL,
  middle_name text NULL,
  last_name text NOT NULL,
  email text NULL,
  phone text NULL,
  date_of_birth date NULL,
  notes text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT people_first_name_not_blank CHECK (char_length(btrim(first_name)) > 0),
  CONSTRAINT people_last_name_not_blank CHECK (char_length(btrim(last_name)) > 0)
);

CREATE INDEX IF NOT EXISTS people_parish_id_last_first_idx
  ON public.people (parish_id, last_name, first_name);

CREATE INDEX IF NOT EXISTS people_parish_id_email_idx
  ON public.people (parish_id, email);

CREATE INDEX IF NOT EXISTS people_parish_id_phone_idx
  ON public.people (parish_id, phone);

CREATE INDEX IF NOT EXISTS people_parishioner_id_idx
  ON public.people (parishioner_id)
  WHERE parishioner_id IS NOT NULL;

COMMENT ON TABLE public.people IS
  'Structured parishioner profiles (staff directory). Optional link to legacy intake parishioners row.';

-- ---------------------------------------------------------------------------
-- households
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.households (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id uuid NOT NULL REFERENCES public.parishes (id) ON DELETE CASCADE,
  name text NOT NULL,
  address text NULL,
  city text NULL,
  state text NULL,
  postal_code text NULL,
  notes text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT households_name_not_blank CHECK (char_length(btrim(name)) > 0)
);

CREATE INDEX IF NOT EXISTS households_parish_id_name_idx
  ON public.households (parish_id, name);

CREATE INDEX IF NOT EXISTS households_parish_id_city_idx
  ON public.households (parish_id, city);

COMMENT ON TABLE public.households IS
  'Parish household directory entry (address + member roster via household_members).';

-- ---------------------------------------------------------------------------
-- household_members
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.household_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id uuid NOT NULL REFERENCES public.parishes (id) ON DELETE CASCADE,
  household_id uuid NOT NULL REFERENCES public.households (id) ON DELETE CASCADE,
  person_id uuid NOT NULL REFERENCES public.people (id) ON DELETE CASCADE,
  relationship text NOT NULL DEFAULT 'member',
  is_primary_contact boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT household_members_relationship_not_blank CHECK (char_length(btrim(relationship)) > 0),
  CONSTRAINT household_members_household_person_unique UNIQUE (household_id, person_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS household_members_one_primary_per_household_idx
  ON public.household_members (household_id)
  WHERE is_primary_contact = true;

CREATE INDEX IF NOT EXISTS household_members_person_id_idx
  ON public.household_members (person_id);

CREATE INDEX IF NOT EXISTS household_members_household_id_idx
  ON public.household_members (household_id);

COMMENT ON TABLE public.household_members IS
  'Membership of a person in a household (relationship + primary contact flag).';

-- ---------------------------------------------------------------------------
-- Link columns on existing tables
-- ---------------------------------------------------------------------------
ALTER TABLE public.requests
  ADD COLUMN IF NOT EXISTS person_id uuid NULL REFERENCES public.people (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS requests_person_id_idx
  ON public.requests (person_id)
  WHERE person_id IS NOT NULL;

ALTER TABLE public.sacramental_records
  ADD COLUMN IF NOT EXISTS person_id uuid NULL REFERENCES public.people (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS sacramental_records_person_id_idx
  ON public.sacramental_records (person_id)
  WHERE person_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- updated_at + household_members.parish_id sync
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.people_households_before_write()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.updated_at := now();
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    NEW.updated_at := now();
    NEW.parish_id := OLD.parish_id;
    NEW.created_at := OLD.created_at;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.household_members_before_write()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_parish_id uuid;
BEGIN
  SELECT h.parish_id INTO v_parish_id
  FROM public.households h
  WHERE h.id = NEW.household_id;

  IF v_parish_id IS NULL THEN
    RAISE EXCEPTION 'household not found for household_members insert/update';
  END IF;

  NEW.parish_id := v_parish_id;

  IF TG_OP = 'UPDATE' THEN
    NEW.household_id := OLD.household_id;
    NEW.person_id := OLD.person_id;
    NEW.created_at := OLD.created_at;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS people_before_write_trg ON public.people;
CREATE TRIGGER people_before_write_trg
  BEFORE INSERT OR UPDATE ON public.people
  FOR EACH ROW
  EXECUTE FUNCTION public.people_households_before_write();

DROP TRIGGER IF EXISTS households_before_write_trg ON public.households;
CREATE TRIGGER households_before_write_trg
  BEFORE INSERT OR UPDATE ON public.households
  FOR EACH ROW
  EXECUTE FUNCTION public.people_households_before_write();

DROP TRIGGER IF EXISTS household_members_before_write_trg ON public.household_members;
CREATE TRIGGER household_members_before_write_trg
  BEFORE INSERT OR UPDATE ON public.household_members
  FOR EACH ROW
  EXECUTE FUNCTION public.household_members_before_write();

-- ---------------------------------------------------------------------------
-- Row level security (no DELETE policies in V1)
-- ---------------------------------------------------------------------------
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "people_select_authenticated" ON public.people;
CREATE POLICY "people_select_authenticated"
  ON public.people
  FOR SELECT
  TO authenticated
  USING (parish_id = public.primary_parish_id());

DROP POLICY IF EXISTS "people_insert_authenticated" ON public.people;
CREATE POLICY "people_insert_authenticated"
  ON public.people
  FOR INSERT
  TO authenticated
  WITH CHECK (parish_id = public.primary_parish_id());

DROP POLICY IF EXISTS "people_update_authenticated" ON public.people;
CREATE POLICY "people_update_authenticated"
  ON public.people
  FOR UPDATE
  TO authenticated
  USING (parish_id = public.primary_parish_id())
  WITH CHECK (parish_id = public.primary_parish_id());

DROP POLICY IF EXISTS "households_select_authenticated" ON public.households;
CREATE POLICY "households_select_authenticated"
  ON public.households
  FOR SELECT
  TO authenticated
  USING (parish_id = public.primary_parish_id());

DROP POLICY IF EXISTS "households_insert_authenticated" ON public.households;
CREATE POLICY "households_insert_authenticated"
  ON public.households
  FOR INSERT
  TO authenticated
  WITH CHECK (parish_id = public.primary_parish_id());

DROP POLICY IF EXISTS "households_update_authenticated" ON public.households;
CREATE POLICY "households_update_authenticated"
  ON public.households
  FOR UPDATE
  TO authenticated
  USING (parish_id = public.primary_parish_id())
  WITH CHECK (parish_id = public.primary_parish_id());

DROP POLICY IF EXISTS "household_members_select_authenticated" ON public.household_members;
CREATE POLICY "household_members_select_authenticated"
  ON public.household_members
  FOR SELECT
  TO authenticated
  USING (parish_id = public.primary_parish_id());

DROP POLICY IF EXISTS "household_members_insert_authenticated" ON public.household_members;
CREATE POLICY "household_members_insert_authenticated"
  ON public.household_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    parish_id = public.primary_parish_id()
    AND EXISTS (
      SELECT 1
      FROM public.households h
      WHERE h.id = household_id
        AND h.parish_id = public.primary_parish_id()
    )
    AND EXISTS (
      SELECT 1
      FROM public.people p
      WHERE p.id = person_id
        AND p.parish_id = public.primary_parish_id()
    )
  );

DROP POLICY IF EXISTS "household_members_update_authenticated" ON public.household_members;
CREATE POLICY "household_members_update_authenticated"
  ON public.household_members
  FOR UPDATE
  TO authenticated
  USING (parish_id = public.primary_parish_id())
  WITH CHECK (parish_id = public.primary_parish_id());
