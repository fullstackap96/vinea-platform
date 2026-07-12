-- DRAFT ONLY - NOT A SUPABASE MIGRATION.
-- Purpose: define the rollback contract for the future membership-aware
-- operational RLS migration before any policy migration is added to
-- supabase/migrations.
--
-- Use only if a future applied membership-aware operational RLS migration must
-- be reverted back to the current V1 staff authorization model.
--
-- Rollback target:
-- 1. Direct parish-scoped operational tables use is_authorized_staff() plus
--    parish_id = primary_parish_id().
-- 2. Request rows scope through the request parishioner's primary parish.
-- 3. Request child tables use request_belongs_to_primary_parish(request_id).
-- 4. The future request_belongs_to_staff_parish(request_id) helper is removed
--    only after no policy depends on it.

-- Direct parish-scoped operational tables.
ALTER POLICY "parishioners_select_authenticated" ON public.parishioners
  USING (public.is_authorized_staff() AND parish_id = public.primary_parish_id());
ALTER POLICY "parishioners_update_authenticated" ON public.parishioners
  USING (public.is_authorized_staff() AND parish_id = public.primary_parish_id())
  WITH CHECK (public.is_authorized_staff() AND parish_id = public.primary_parish_id());

ALTER POLICY "people_select_authenticated" ON public.people
  USING (public.is_authorized_staff() AND parish_id = public.primary_parish_id());
ALTER POLICY "people_insert_authenticated" ON public.people
  WITH CHECK (public.is_authorized_staff() AND parish_id = public.primary_parish_id());
ALTER POLICY "people_update_authenticated" ON public.people
  USING (public.is_authorized_staff() AND parish_id = public.primary_parish_id())
  WITH CHECK (public.is_authorized_staff() AND parish_id = public.primary_parish_id());

ALTER POLICY "households_select_authenticated" ON public.households
  USING (public.is_authorized_staff() AND parish_id = public.primary_parish_id());
ALTER POLICY "households_insert_authenticated" ON public.households
  WITH CHECK (public.is_authorized_staff() AND parish_id = public.primary_parish_id());
ALTER POLICY "households_update_authenticated" ON public.households
  USING (public.is_authorized_staff() AND parish_id = public.primary_parish_id())
  WITH CHECK (public.is_authorized_staff() AND parish_id = public.primary_parish_id());

ALTER POLICY "household_members_select_authenticated" ON public.household_members
  USING (public.is_authorized_staff() AND parish_id = public.primary_parish_id());
ALTER POLICY "household_members_insert_authenticated" ON public.household_members
  WITH CHECK (public.is_authorized_staff() AND parish_id = public.primary_parish_id());
ALTER POLICY "household_members_update_authenticated" ON public.household_members
  USING (public.is_authorized_staff() AND parish_id = public.primary_parish_id())
  WITH CHECK (public.is_authorized_staff() AND parish_id = public.primary_parish_id());

ALTER POLICY "sacramental_records_select_authenticated" ON public.sacramental_records
  USING (public.is_authorized_staff() AND parish_id = public.primary_parish_id());
ALTER POLICY "sacramental_records_insert_authenticated" ON public.sacramental_records
  WITH CHECK (public.is_authorized_staff() AND parish_id = public.primary_parish_id());
ALTER POLICY "sacramental_records_update_authenticated" ON public.sacramental_records
  USING (public.is_authorized_staff() AND parish_id = public.primary_parish_id())
  WITH CHECK (public.is_authorized_staff() AND parish_id = public.primary_parish_id());

ALTER POLICY "sacramental_record_events_select_authenticated" ON public.sacramental_record_events
  USING (public.is_authorized_staff() AND parish_id = public.primary_parish_id());
ALTER POLICY "sacramental_record_events_insert_authenticated" ON public.sacramental_record_events
  WITH CHECK (public.is_authorized_staff() AND parish_id = public.primary_parish_id());

ALTER POLICY "mass_intentions_select_authenticated" ON public.mass_intentions
  USING (public.is_authorized_staff() AND parish_id = public.primary_parish_id());
ALTER POLICY "mass_intentions_insert_authenticated" ON public.mass_intentions
  WITH CHECK (public.is_authorized_staff() AND parish_id = public.primary_parish_id());
ALTER POLICY "mass_intentions_update_authenticated" ON public.mass_intentions
  USING (public.is_authorized_staff() AND parish_id = public.primary_parish_id())
  WITH CHECK (public.is_authorized_staff() AND parish_id = public.primary_parish_id());

-- Request-scoped operational tables.
ALTER POLICY "requests_select_authenticated" ON public.requests
  USING (
    public.is_authorized_staff()
    AND EXISTS (
      SELECT 1
      FROM public.parishioners p
      WHERE p.id = parishioner_id
        AND p.parish_id = public.primary_parish_id()
    )
  );

ALTER POLICY "requests_update_authenticated" ON public.requests
  USING (
    public.is_authorized_staff()
    AND EXISTS (
      SELECT 1
      FROM public.parishioners p
      WHERE p.id = parishioner_id
        AND p.parish_id = public.primary_parish_id()
    )
  )
  WITH CHECK (
    public.is_authorized_staff()
    AND EXISTS (
      SELECT 1
      FROM public.parishioners p
      WHERE p.id = parishioner_id
        AND p.parish_id = public.primary_parish_id()
    )
  );

ALTER POLICY "checklist_items_select_authenticated" ON public.checklist_items
  USING (public.is_authorized_staff() AND public.request_belongs_to_primary_parish(request_id));
ALTER POLICY "checklist_items_update_authenticated" ON public.checklist_items
  USING (public.is_authorized_staff() AND public.request_belongs_to_primary_parish(request_id))
  WITH CHECK (public.is_authorized_staff() AND public.request_belongs_to_primary_parish(request_id));

ALTER POLICY "request_communications_select_authenticated" ON public.request_communications
  USING (public.is_authorized_staff() AND public.request_belongs_to_primary_parish(request_id));
ALTER POLICY "request_communications_insert_authenticated" ON public.request_communications
  WITH CHECK (public.is_authorized_staff() AND public.request_belongs_to_primary_parish(request_id));

ALTER POLICY "request_notes_select_authenticated" ON public.request_notes
  USING (public.is_authorized_staff() AND public.request_belongs_to_primary_parish(request_id));
ALTER POLICY "request_notes_insert_authenticated" ON public.request_notes
  WITH CHECK (public.is_authorized_staff() AND public.request_belongs_to_primary_parish(request_id));

ALTER POLICY "request_workflow_steps_select_staff" ON public.request_workflow_steps
  USING (
    public.is_authorized_staff()
    AND parish_id = public.primary_parish_id()
    AND public.request_belongs_to_primary_parish(request_id)
  );
ALTER POLICY "request_workflow_steps_insert_staff" ON public.request_workflow_steps
  WITH CHECK (
    public.is_authorized_staff()
    AND parish_id = public.primary_parish_id()
    AND public.request_belongs_to_primary_parish(request_id)
  );
ALTER POLICY "request_workflow_steps_update_staff" ON public.request_workflow_steps
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

ALTER POLICY "request_documents_select_staff" ON public.request_documents
  USING (
    public.is_authorized_staff()
    AND parish_id = public.primary_parish_id()
    AND public.request_belongs_to_primary_parish(request_id)
  );
ALTER POLICY "request_documents_insert_staff" ON public.request_documents
  WITH CHECK (
    public.is_authorized_staff()
    AND parish_id = public.primary_parish_id()
    AND public.request_belongs_to_primary_parish(request_id)
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
    public.is_authorized_staff()
    AND parish_id = public.primary_parish_id()
    AND public.request_belongs_to_primary_parish(request_id)
  )
  WITH CHECK (
    public.is_authorized_staff()
    AND parish_id = public.primary_parish_id()
    AND public.request_belongs_to_primary_parish(request_id)
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
  USING (public.is_authorized_staff() AND public.request_belongs_to_primary_parish(request_id));
ALTER POLICY "funeral_request_details_insert_authenticated" ON public.funeral_request_details
  WITH CHECK (public.is_authorized_staff() AND public.request_belongs_to_primary_parish(request_id));
ALTER POLICY "funeral_request_details_update_authenticated" ON public.funeral_request_details
  USING (public.is_authorized_staff() AND public.request_belongs_to_primary_parish(request_id))
  WITH CHECK (public.is_authorized_staff() AND public.request_belongs_to_primary_parish(request_id));

ALTER POLICY "wedding_request_details_select_authenticated" ON public.wedding_request_details
  USING (public.is_authorized_staff() AND public.request_belongs_to_primary_parish(request_id));
ALTER POLICY "wedding_request_details_insert_authenticated" ON public.wedding_request_details
  WITH CHECK (public.is_authorized_staff() AND public.request_belongs_to_primary_parish(request_id));
ALTER POLICY "wedding_request_details_update_authenticated" ON public.wedding_request_details
  USING (public.is_authorized_staff() AND public.request_belongs_to_primary_parish(request_id))
  WITH CHECK (public.is_authorized_staff() AND public.request_belongs_to_primary_parish(request_id));

ALTER POLICY "ocia_request_details_select_authenticated" ON public.ocia_request_details
  USING (public.is_authorized_staff() AND public.request_belongs_to_primary_parish(request_id));
ALTER POLICY "ocia_request_details_insert_authenticated" ON public.ocia_request_details
  WITH CHECK (public.is_authorized_staff() AND public.request_belongs_to_primary_parish(request_id));
ALTER POLICY "ocia_request_details_update_authenticated" ON public.ocia_request_details
  USING (public.is_authorized_staff() AND public.request_belongs_to_primary_parish(request_id))
  WITH CHECK (public.is_authorized_staff() AND public.request_belongs_to_primary_parish(request_id));

ALTER POLICY "join_parish_request_details_select_authenticated" ON public.join_parish_request_details
  USING (public.is_authorized_staff() AND public.request_belongs_to_primary_parish(request_id));
ALTER POLICY "join_parish_request_details_insert_authenticated" ON public.join_parish_request_details
  WITH CHECK (public.is_authorized_staff() AND public.request_belongs_to_primary_parish(request_id));
ALTER POLICY "join_parish_request_details_update_authenticated" ON public.join_parish_request_details
  USING (public.is_authorized_staff() AND public.request_belongs_to_primary_parish(request_id))
  WITH CHECK (public.is_authorized_staff() AND public.request_belongs_to_primary_parish(request_id));

-- Remove the future membership-aware helper only after all restored policies no
-- longer depend on it.
REVOKE EXECUTE ON FUNCTION public.request_belongs_to_staff_parish(uuid) FROM PUBLIC;
DROP FUNCTION IF EXISTS public.request_belongs_to_staff_parish(uuid);
