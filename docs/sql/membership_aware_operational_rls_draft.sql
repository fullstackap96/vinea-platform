-- DRAFT ONLY - NOT A SUPABASE MIGRATION.
-- Purpose: define the next membership-aware operational RLS contract before
-- any production/QA policy migration is added to supabase/migrations.
--
-- Preconditions before converting this draft into an applied migration:
-- 1. App read paths have been intentionally wired to active parish context.
-- 2. Selected create paths use resolveStaffWriteParishContext().
-- 3. QA has multi-parish staff memberships that can prove cross-parish access.
-- 4. A rollback plan exists for restoring V1 policies if needed.

-- Request-scoped helper for operational child tables.
CREATE OR REPLACE FUNCTION public.request_belongs_to_staff_parish(p_request_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.requests r
    JOIN public.parishioners p ON p.id = r.parishioner_id
    WHERE r.id = p_request_id
      AND public.is_authorized_for_parish(p.parish_id)
  );
$$;

COMMENT ON FUNCTION public.request_belongs_to_staff_parish(uuid) IS
  'Draft helper for membership-aware request scoping through parishioners.parish_id.';

REVOKE EXECUTE ON FUNCTION public.request_belongs_to_staff_parish(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.request_belongs_to_staff_parish(uuid) TO authenticated;

-- Direct parish-scoped operational tables.
ALTER POLICY "parishioners_select_authenticated" ON public.parishioners
  USING (public.is_authorized_for_parish(parish_id));
ALTER POLICY "parishioners_update_authenticated" ON public.parishioners
  USING (public.is_authorized_for_parish(parish_id))
  WITH CHECK (public.is_authorized_for_parish(parish_id));

ALTER POLICY "people_select_authenticated" ON public.people
  USING (public.is_authorized_for_parish(parish_id));
ALTER POLICY "people_insert_authenticated" ON public.people
  WITH CHECK (public.is_authorized_for_parish(parish_id));
ALTER POLICY "people_update_authenticated" ON public.people
  USING (public.is_authorized_for_parish(parish_id))
  WITH CHECK (public.is_authorized_for_parish(parish_id));

ALTER POLICY "households_select_authenticated" ON public.households
  USING (public.is_authorized_for_parish(parish_id));
ALTER POLICY "households_insert_authenticated" ON public.households
  WITH CHECK (public.is_authorized_for_parish(parish_id));
ALTER POLICY "households_update_authenticated" ON public.households
  USING (public.is_authorized_for_parish(parish_id))
  WITH CHECK (public.is_authorized_for_parish(parish_id));

ALTER POLICY "household_members_select_authenticated" ON public.household_members
  USING (public.is_authorized_for_parish(parish_id));
ALTER POLICY "household_members_insert_authenticated" ON public.household_members
  WITH CHECK (public.is_authorized_for_parish(parish_id));
ALTER POLICY "household_members_update_authenticated" ON public.household_members
  USING (public.is_authorized_for_parish(parish_id))
  WITH CHECK (public.is_authorized_for_parish(parish_id));

ALTER POLICY "sacramental_records_select_authenticated" ON public.sacramental_records
  USING (public.is_authorized_for_parish(parish_id));
ALTER POLICY "sacramental_records_insert_authenticated" ON public.sacramental_records
  WITH CHECK (public.is_authorized_for_parish(parish_id));
ALTER POLICY "sacramental_records_update_authenticated" ON public.sacramental_records
  USING (public.is_authorized_for_parish(parish_id))
  WITH CHECK (public.is_authorized_for_parish(parish_id));

ALTER POLICY "sacramental_record_events_select_authenticated" ON public.sacramental_record_events
  USING (public.is_authorized_for_parish(parish_id));
ALTER POLICY "sacramental_record_events_insert_authenticated" ON public.sacramental_record_events
  WITH CHECK (public.is_authorized_for_parish(parish_id));

ALTER POLICY "mass_intentions_select_authenticated" ON public.mass_intentions
  USING (public.is_authorized_for_parish(parish_id));
ALTER POLICY "mass_intentions_insert_authenticated" ON public.mass_intentions
  WITH CHECK (public.is_authorized_for_parish(parish_id));
ALTER POLICY "mass_intentions_update_authenticated" ON public.mass_intentions
  USING (public.is_authorized_for_parish(parish_id))
  WITH CHECK (public.is_authorized_for_parish(parish_id));

-- Request-scoped operational tables.
ALTER POLICY "requests_select_authenticated" ON public.requests
  USING (
    EXISTS (
      SELECT 1
      FROM public.parishioners p
      WHERE p.id = parishioner_id
        AND public.is_authorized_for_parish(p.parish_id)
    )
  );

ALTER POLICY "requests_update_authenticated" ON public.requests
  USING (
    EXISTS (
      SELECT 1
      FROM public.parishioners p
      WHERE p.id = parishioner_id
        AND public.is_authorized_for_parish(p.parish_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.parishioners p
      WHERE p.id = parishioner_id
        AND public.is_authorized_for_parish(p.parish_id)
    )
  );

ALTER POLICY "checklist_items_select_authenticated" ON public.checklist_items
  USING (public.request_belongs_to_staff_parish(request_id));
ALTER POLICY "checklist_items_update_authenticated" ON public.checklist_items
  USING (public.request_belongs_to_staff_parish(request_id))
  WITH CHECK (public.request_belongs_to_staff_parish(request_id));

ALTER POLICY "request_communications_select_authenticated" ON public.request_communications
  USING (public.request_belongs_to_staff_parish(request_id));
ALTER POLICY "request_communications_insert_authenticated" ON public.request_communications
  WITH CHECK (public.request_belongs_to_staff_parish(request_id));

ALTER POLICY "request_notes_select_authenticated" ON public.request_notes
  USING (public.request_belongs_to_staff_parish(request_id));
ALTER POLICY "request_notes_insert_authenticated" ON public.request_notes
  WITH CHECK (public.request_belongs_to_staff_parish(request_id));

ALTER POLICY "request_workflow_steps_select_staff" ON public.request_workflow_steps
  USING (
    public.is_authorized_for_parish(parish_id)
    AND public.request_belongs_to_staff_parish(request_id)
  );
ALTER POLICY "request_workflow_steps_insert_staff" ON public.request_workflow_steps
  WITH CHECK (
    public.is_authorized_for_parish(parish_id)
    AND public.request_belongs_to_staff_parish(request_id)
  );
ALTER POLICY "request_workflow_steps_update_staff" ON public.request_workflow_steps
  USING (
    public.is_authorized_for_parish(parish_id)
    AND public.request_belongs_to_staff_parish(request_id)
  )
  WITH CHECK (
    public.is_authorized_for_parish(parish_id)
    AND public.request_belongs_to_staff_parish(request_id)
  );

ALTER POLICY "request_documents_select_staff" ON public.request_documents
  USING (
    public.is_authorized_for_parish(parish_id)
    AND public.request_belongs_to_staff_parish(request_id)
  );
ALTER POLICY "request_documents_insert_staff" ON public.request_documents
  WITH CHECK (
    public.is_authorized_for_parish(parish_id)
    AND public.request_belongs_to_staff_parish(request_id)
    AND (
      workflow_step_id IS NULL
      OR EXISTS (
        SELECT 1
        FROM public.request_workflow_steps rws
        WHERE rws.id = workflow_step_id
          AND rws.request_id = request_documents.request_id
          AND rws.parish_id = request_documents.parish_id
      )
    )
  );
ALTER POLICY "request_documents_update_staff" ON public.request_documents
  USING (
    public.is_authorized_for_parish(parish_id)
    AND public.request_belongs_to_staff_parish(request_id)
  )
  WITH CHECK (
    public.is_authorized_for_parish(parish_id)
    AND public.request_belongs_to_staff_parish(request_id)
    AND (
      workflow_step_id IS NULL
      OR EXISTS (
        SELECT 1
        FROM public.request_workflow_steps rws
        WHERE rws.id = workflow_step_id
          AND rws.request_id = request_documents.request_id
          AND rws.parish_id = request_documents.parish_id
      )
    )
  );

ALTER POLICY "funeral_request_details_select_authenticated" ON public.funeral_request_details
  USING (public.request_belongs_to_staff_parish(request_id));
ALTER POLICY "funeral_request_details_insert_authenticated" ON public.funeral_request_details
  WITH CHECK (public.request_belongs_to_staff_parish(request_id));
ALTER POLICY "funeral_request_details_update_authenticated" ON public.funeral_request_details
  USING (public.request_belongs_to_staff_parish(request_id))
  WITH CHECK (public.request_belongs_to_staff_parish(request_id));

ALTER POLICY "wedding_request_details_select_authenticated" ON public.wedding_request_details
  USING (public.request_belongs_to_staff_parish(request_id));
ALTER POLICY "wedding_request_details_insert_authenticated" ON public.wedding_request_details
  WITH CHECK (public.request_belongs_to_staff_parish(request_id));
ALTER POLICY "wedding_request_details_update_authenticated" ON public.wedding_request_details
  USING (public.request_belongs_to_staff_parish(request_id))
  WITH CHECK (public.request_belongs_to_staff_parish(request_id));

ALTER POLICY "ocia_request_details_select_authenticated" ON public.ocia_request_details
  USING (public.request_belongs_to_staff_parish(request_id));
ALTER POLICY "ocia_request_details_insert_authenticated" ON public.ocia_request_details
  WITH CHECK (public.request_belongs_to_staff_parish(request_id));
ALTER POLICY "ocia_request_details_update_authenticated" ON public.ocia_request_details
  USING (public.request_belongs_to_staff_parish(request_id))
  WITH CHECK (public.request_belongs_to_staff_parish(request_id));

ALTER POLICY "join_parish_request_details_select_authenticated" ON public.join_parish_request_details
  USING (public.request_belongs_to_staff_parish(request_id));
ALTER POLICY "join_parish_request_details_insert_authenticated" ON public.join_parish_request_details
  WITH CHECK (public.request_belongs_to_staff_parish(request_id));
ALTER POLICY "join_parish_request_details_update_authenticated" ON public.join_parish_request_details
  USING (public.request_belongs_to_staff_parish(request_id))
  WITH CHECK (public.request_belongs_to_staff_parish(request_id));
