-- Workflow Templates + Document Portal, Phase 1.
-- Adds parish-configurable workflow templates and request-specific workflow step instances.
-- V1 parish scope matches the existing primary_parish_id()/is_authorized_staff() model.

-- ---------------------------------------------------------------------------
-- workflow_templates
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.workflow_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id uuid NOT NULL REFERENCES public.parishes (id) ON DELETE CASCADE,
  request_type text NOT NULL,
  name text NOT NULL,
  description text NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT workflow_templates_request_type_valid CHECK (
    request_type IN ('baptism', 'wedding', 'funeral', 'ocia')
  ),
  CONSTRAINT workflow_templates_name_not_blank CHECK (char_length(btrim(name)) > 0)
);

CREATE INDEX IF NOT EXISTS workflow_templates_parish_request_type_idx
  ON public.workflow_templates (parish_id, request_type);

CREATE UNIQUE INDEX IF NOT EXISTS workflow_templates_one_active_per_type_idx
  ON public.workflow_templates (parish_id, request_type)
  WHERE active;

COMMENT ON TABLE public.workflow_templates IS
  'Parish-configurable workflow templates for Catholic request types.';

COMMENT ON COLUMN public.workflow_templates.active IS
  'Only one active template per parish/request_type is allowed.';

-- ---------------------------------------------------------------------------
-- workflow_template_steps
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.workflow_template_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES public.workflow_templates (id) ON DELETE CASCADE,
  step_key text NOT NULL,
  phase text NOT NULL,
  title text NOT NULL,
  description text NULL,
  owner_type text NOT NULL DEFAULT 'staff',
  required boolean NOT NULL DEFAULT true,
  due_offset_days integer NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT workflow_template_steps_owner_type_valid CHECK (
    owner_type IN ('staff', 'priest', 'deacon', 'family')
  ),
  CONSTRAINT workflow_template_steps_due_offset_valid CHECK (
    due_offset_days IS NULL OR due_offset_days >= 0
  ),
  CONSTRAINT workflow_template_steps_step_key_not_blank CHECK (char_length(btrim(step_key)) > 0),
  CONSTRAINT workflow_template_steps_phase_not_blank CHECK (char_length(btrim(phase)) > 0),
  CONSTRAINT workflow_template_steps_title_not_blank CHECK (char_length(btrim(title)) > 0),
  CONSTRAINT workflow_template_steps_template_step_key_unique UNIQUE (template_id, step_key)
);

CREATE INDEX IF NOT EXISTS workflow_template_steps_template_sort_idx
  ON public.workflow_template_steps (template_id, sort_order, created_at);

COMMENT ON TABLE public.workflow_template_steps IS
  'Ordered step definitions copied from a workflow template onto each request.';

-- ---------------------------------------------------------------------------
-- request_workflow_steps
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.request_workflow_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id uuid NOT NULL REFERENCES public.parishes (id) ON DELETE CASCADE,
  request_id uuid NOT NULL REFERENCES public.requests (id) ON DELETE CASCADE,
  template_step_id uuid NULL REFERENCES public.workflow_template_steps (id) ON DELETE SET NULL,
  phase text NOT NULL,
  title text NOT NULL,
  description text NULL,
  owner_type text NOT NULL DEFAULT 'staff',
  required boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'not_started',
  due_date date NULL,
  completed_at timestamptz NULL,
  completed_by uuid NULL REFERENCES auth.users (id) ON DELETE SET NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT request_workflow_steps_owner_type_valid CHECK (
    owner_type IN ('staff', 'priest', 'deacon', 'family')
  ),
  CONSTRAINT request_workflow_steps_status_valid CHECK (
    status IN ('not_started', 'in_progress', 'complete', 'skipped')
  ),
  CONSTRAINT request_workflow_steps_phase_not_blank CHECK (char_length(btrim(phase)) > 0),
  CONSTRAINT request_workflow_steps_title_not_blank CHECK (char_length(btrim(title)) > 0),
  CONSTRAINT request_workflow_steps_completed_consistent CHECK (
    (status = 'complete' AND completed_at IS NOT NULL)
    OR (status <> 'complete')
  )
);

CREATE INDEX IF NOT EXISTS request_workflow_steps_parish_request_idx
  ON public.request_workflow_steps (parish_id, request_id, sort_order);

CREATE INDEX IF NOT EXISTS request_workflow_steps_request_status_idx
  ON public.request_workflow_steps (request_id, status);

CREATE UNIQUE INDEX IF NOT EXISTS request_workflow_steps_request_template_step_unique_idx
  ON public.request_workflow_steps (request_id, template_step_id)
  WHERE template_step_id IS NOT NULL;

COMMENT ON TABLE public.request_workflow_steps IS
  'Request-specific workflow step instances copied from the active parish template.';

COMMENT ON COLUMN public.request_workflow_steps.parish_id IS
  'Denormalized parish scope for RLS and faster request workflow queries.';

-- ---------------------------------------------------------------------------
-- updated_at helpers
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.workflow_templates_touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS workflow_templates_touch_updated_at_trg ON public.workflow_templates;
CREATE TRIGGER workflow_templates_touch_updated_at_trg
  BEFORE UPDATE ON public.workflow_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.workflow_templates_touch_updated_at();

DROP TRIGGER IF EXISTS workflow_template_steps_touch_updated_at_trg ON public.workflow_template_steps;
CREATE TRIGGER workflow_template_steps_touch_updated_at_trg
  BEFORE UPDATE ON public.workflow_template_steps
  FOR EACH ROW
  EXECUTE FUNCTION public.workflow_templates_touch_updated_at();

DROP TRIGGER IF EXISTS request_workflow_steps_touch_updated_at_trg ON public.request_workflow_steps;
CREATE TRIGGER request_workflow_steps_touch_updated_at_trg
  BEFORE UPDATE ON public.request_workflow_steps
  FOR EACH ROW
  EXECUTE FUNCTION public.workflow_templates_touch_updated_at();

-- ---------------------------------------------------------------------------
-- Default Catholic workflow templates
-- ---------------------------------------------------------------------------
WITH default_templates(request_type, name, description) AS (
  VALUES
    ('baptism', 'Default baptism preparation workflow', 'Family intake, paperwork, godparents, prep class, scheduling, and records.'),
    ('wedding', 'Default wedding preparation workflow', 'Couple contact, date and clergy coordination, preparation documents, liturgy planning, and final confirmation.'),
    ('funeral', 'Default funeral pastoral care workflow', 'Immediate family care, clergy and funeral home coordination, liturgy planning, service details, and post-funeral follow-up.'),
    ('ocia', 'Default OCIA inquiry workflow', 'Inquiry response, first meeting, sacramental background, accompaniment, and next session planning.')
)
INSERT INTO public.workflow_templates (parish_id, request_type, name, description, active)
SELECT p.id, dt.request_type, dt.name, dt.description, true
FROM public.parishes p
CROSS JOIN default_templates dt
ON CONFLICT DO NOTHING;

WITH default_steps(request_type, step_key, phase, title, description, owner_type, required, due_offset_days, sort_order) AS (
  VALUES
    ('baptism', 'family-contact', 'Family intake', 'Contact family and confirm baptism preparation steps', 'Give parents a clear path for documents, prep class, godparents, and scheduling.', 'staff', true, 1, 10),
    ('baptism', 'birth-certificate', 'Documentation', 'Collect child birth certificate', 'Protect sacramental record accuracy before the baptism date is finalized.', 'family', true, 7, 20),
    ('baptism', 'godparent-info', 'Documentation', 'Collect godparent information and eligibility paperwork', 'Keep sponsor requirements visible before the baptism date.', 'family', true, 7, 30),
    ('baptism', 'prep-class', 'Preparation', 'Confirm parent baptism preparation class completion', 'Record whether the family has completed the parish preparation requirement.', 'staff', true, 14, 40),
    ('baptism', 'date-confirmed', 'Scheduling', 'Record confirmed baptism date and time', 'Create one source of truth for the baptism schedule.', 'staff', true, 14, 50),
    ('baptism', 'certificate-record', 'Records', 'Prepare sacramental record and certificate details', 'Connect preparation work to the sacramental register and certificate path.', 'staff', true, 21, 60),

    ('wedding', 'initial-couple-contact', 'Inquiry', 'Contact couple and log initial wedding inquiry follow-up', 'Make sure the couple receives parish guidance from the first response.', 'staff', true, 2, 10),
    ('wedding', 'date-availability', 'Scheduling', 'Review requested date for parish and clergy availability', 'Avoid promising a date before staff confirms calendar and clergy constraints.', 'staff', true, 7, 20),
    ('wedding', 'assign-clergy', 'Internal coordination', 'Confirm priest or deacon for marriage preparation', 'Create a clear pastoral owner for preparation and ceremony coordination.', 'staff', true, 14, 30),
    ('wedding', 'prep-documents', 'Documentation', 'Collect marriage preparation documents and certificates', 'Keep canonical and parish-required paperwork visible.', 'family', true, 30, 40),
    ('wedding', 'prep-sessions', 'Preparation', 'Track required marriage preparation sessions', 'Help staff know whether the couple is progressing through preparation.', 'staff', true, 45, 50),
    ('wedding', 'ceremony-planning', 'Ceremony planning', 'Finalize liturgy, readings, music, and rehearsal details', 'Reduce last-week ceremony coordination stress.', 'staff', true, 60, 60),
    ('wedding', 'final-confirmation', 'Final confirmation', 'Send final confirmation to couple and internal staff', 'Ensure everyone has the same final plan.', 'staff', true, 75, 70),

    ('funeral', 'first-family-contact', 'Immediate care', 'Call family and log first pastoral contact', 'Prevent a grieving family from waiting without a clear parish contact.', 'staff', true, 0, 10),
    ('funeral', 'assign-clergy', 'Internal coordination', 'Confirm priest or deacon assignment', 'Clarify who will shepherd the liturgy and family communication.', 'staff', true, 0, 20),
    ('funeral', 'funeral-home', 'Scheduling', 'Coordinate date, time, and logistics with funeral home', 'Keep parish, family, and funeral home aligned.', 'staff', true, 1, 30),
    ('funeral', 'confirm-service', 'Scheduling', 'Record confirmed funeral service date and location', 'Give staff one reliable source of truth for the service.', 'staff', true, 1, 40),
    ('funeral', 'readings-music', 'Liturgy planning', 'Collect readings, music, and worship aid details', 'Reduce last-minute liturgy planning gaps.', 'family', true, 2, 50),
    ('funeral', 'committal', 'Liturgy planning', 'Confirm cemetery, cremation, or committal arrangements', 'Ensure clergy and staff understand the full funeral day plan.', 'staff', false, 2, 60),
    ('funeral', 'post-care', 'Pastoral follow-up', 'Schedule post-funeral family follow-up', 'Turn funeral ministry into ongoing pastoral care.', 'staff', true, 7, 70),

    ('ocia', 'first-inquiry-contact', 'Inquiry', 'Contact inquirer and log first OCIA conversation', 'Respond personally while interest is fresh.', 'staff', true, 2, 10),
    ('ocia', 'first-meeting', 'Accompaniment', 'Schedule first meeting with OCIA coordinator', 'Turn an inquiry into a real pastoral relationship.', 'staff', true, 7, 20),
    ('ocia', 'background-review', 'Discernment', 'Review sacramental background and current parish status', 'Help the team understand the right path for the person.', 'staff', true, 14, 30),
    ('ocia', 'materials-shared', 'Accompaniment', 'Share inquiry or evangelization materials', 'Give the inquirer a clear next step for reading, prayer, or preparation.', 'staff', false, 14, 40),
    ('ocia', 'team-sponsor', 'Team coordination', 'Identify sponsor, mentor, or team member for follow-up', 'Keep accompaniment from depending on one busy coordinator.', 'staff', false, 21, 50),
    ('ocia', 'next-session', 'Next step', 'Set next OCIA session or follow-up meeting', 'Keep momentum visible after the first conversation.', 'staff', true, 21, 60)
)
INSERT INTO public.workflow_template_steps (
  template_id,
  step_key,
  phase,
  title,
  description,
  owner_type,
  required,
  due_offset_days,
  sort_order
)
SELECT
  wt.id,
  ds.step_key,
  ds.phase,
  ds.title,
  ds.description,
  ds.owner_type,
  ds.required,
  ds.due_offset_days,
  ds.sort_order
FROM public.workflow_templates wt
JOIN default_steps ds ON ds.request_type = wt.request_type
ON CONFLICT (template_id, step_key) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Template instantiation RPC
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_request_workflow_steps_from_active_template(p_request_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_parish_id uuid;
  v_request_type text;
  v_inserted integer := 0;
BEGIN
  SELECT p.parish_id, r.request_type::text
  INTO v_parish_id, v_request_type
  FROM public.requests r
  JOIN public.parishioners p ON p.id = r.parishioner_id
  WHERE r.id = p_request_id;

  IF v_parish_id IS NULL OR v_request_type IS NULL THEN
    RETURN 0;
  END IF;

  INSERT INTO public.request_workflow_steps (
    parish_id,
    request_id,
    template_step_id,
    phase,
    title,
    description,
    owner_type,
    required,
    due_date,
    sort_order
  )
  SELECT
    v_parish_id,
    p_request_id,
    wts.id,
    wts.phase,
    wts.title,
    wts.description,
    wts.owner_type,
    wts.required,
    CASE
      WHEN wts.due_offset_days IS NULL THEN NULL
      ELSE (CURRENT_DATE + wts.due_offset_days)
    END,
    wts.sort_order
  FROM public.workflow_templates wt
  JOIN public.workflow_template_steps wts ON wts.template_id = wt.id
  WHERE wt.parish_id = v_parish_id
    AND wt.request_type = v_request_type
    AND wt.active = true
    AND NOT EXISTS (
      SELECT 1
      FROM public.request_workflow_steps existing
      WHERE existing.request_id = p_request_id
        AND existing.template_step_id = wts.id
    )
  ORDER BY wts.sort_order, wts.created_at;

  GET DIAGNOSTICS v_inserted = ROW_COUNT;
  RETURN v_inserted;
END;
$$;

COMMENT ON FUNCTION public.create_request_workflow_steps_from_active_template(uuid) IS
  'Copies the active workflow template steps for a request type onto a request. Idempotent per template step.';

REVOKE ALL ON FUNCTION public.create_request_workflow_steps_from_active_template(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_request_workflow_steps_from_active_template(uuid) TO service_role;

-- Backfill supported existing requests once. This is additive and leaves checklist_items unchanged.
SELECT public.create_request_workflow_steps_from_active_template(r.id)
FROM public.requests r
WHERE r.request_type::text IN ('baptism', 'wedding', 'funeral', 'ocia')
  AND NOT EXISTS (
    SELECT 1
    FROM public.request_workflow_steps rws
    WHERE rws.request_id = r.id
  );

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_template_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_workflow_steps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "workflow_templates_select_staff" ON public.workflow_templates;
CREATE POLICY "workflow_templates_select_staff"
  ON public.workflow_templates
  FOR SELECT
  TO authenticated
  USING (
    public.is_authorized_staff()
    AND parish_id = public.primary_parish_id()
  );

DROP POLICY IF EXISTS "workflow_templates_insert_staff" ON public.workflow_templates;
CREATE POLICY "workflow_templates_insert_staff"
  ON public.workflow_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_authorized_staff()
    AND parish_id = public.primary_parish_id()
  );

DROP POLICY IF EXISTS "workflow_templates_update_staff" ON public.workflow_templates;
CREATE POLICY "workflow_templates_update_staff"
  ON public.workflow_templates
  FOR UPDATE
  TO authenticated
  USING (
    public.is_authorized_staff()
    AND parish_id = public.primary_parish_id()
  )
  WITH CHECK (
    public.is_authorized_staff()
    AND parish_id = public.primary_parish_id()
  );

DROP POLICY IF EXISTS "workflow_template_steps_select_staff" ON public.workflow_template_steps;
CREATE POLICY "workflow_template_steps_select_staff"
  ON public.workflow_template_steps
  FOR SELECT
  TO authenticated
  USING (
    public.is_authorized_staff()
    AND EXISTS (
      SELECT 1
      FROM public.workflow_templates wt
      WHERE wt.id = template_id
        AND wt.parish_id = public.primary_parish_id()
    )
  );

DROP POLICY IF EXISTS "workflow_template_steps_insert_staff" ON public.workflow_template_steps;
CREATE POLICY "workflow_template_steps_insert_staff"
  ON public.workflow_template_steps
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_authorized_staff()
    AND EXISTS (
      SELECT 1
      FROM public.workflow_templates wt
      WHERE wt.id = template_id
        AND wt.parish_id = public.primary_parish_id()
    )
  );

DROP POLICY IF EXISTS "workflow_template_steps_update_staff" ON public.workflow_template_steps;
CREATE POLICY "workflow_template_steps_update_staff"
  ON public.workflow_template_steps
  FOR UPDATE
  TO authenticated
  USING (
    public.is_authorized_staff()
    AND EXISTS (
      SELECT 1
      FROM public.workflow_templates wt
      WHERE wt.id = template_id
        AND wt.parish_id = public.primary_parish_id()
    )
  )
  WITH CHECK (
    public.is_authorized_staff()
    AND EXISTS (
      SELECT 1
      FROM public.workflow_templates wt
      WHERE wt.id = template_id
        AND wt.parish_id = public.primary_parish_id()
    )
  );

DROP POLICY IF EXISTS "request_workflow_steps_select_staff" ON public.request_workflow_steps;
CREATE POLICY "request_workflow_steps_select_staff"
  ON public.request_workflow_steps
  FOR SELECT
  TO authenticated
  USING (
    public.is_authorized_staff()
    AND parish_id = public.primary_parish_id()
    AND public.request_belongs_to_primary_parish(request_id)
  );

DROP POLICY IF EXISTS "request_workflow_steps_insert_staff" ON public.request_workflow_steps;
CREATE POLICY "request_workflow_steps_insert_staff"
  ON public.request_workflow_steps
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_authorized_staff()
    AND parish_id = public.primary_parish_id()
    AND public.request_belongs_to_primary_parish(request_id)
  );

DROP POLICY IF EXISTS "request_workflow_steps_update_staff" ON public.request_workflow_steps;
CREATE POLICY "request_workflow_steps_update_staff"
  ON public.request_workflow_steps
  FOR UPDATE
  TO authenticated
  USING (
    public.is_authorized_staff()
    AND parish_id = public.primary_parish_id()
    AND public.request_belongs_to_primary_parish(request_id)
  )
  WITH CHECK (
    public.is_authorized_staff()
    AND parish_id = public.primary_parish_id()
    AND public.request_belongs_to_primary_parish(request_id)
  );
