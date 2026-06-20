-- Require active staff authorization for authenticated dashboard data access.

CREATE OR REPLACE FUNCTION public.is_authorized_staff()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.staff_users su
    WHERE su.active = true
      AND su.parish_id = public.primary_parish_id()
      AND lower(su.email) = lower(COALESCE(auth.jwt() ->> 'email', ''))
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_authorized_staff() TO authenticated;

ALTER POLICY "parishioners_select_authenticated" ON public.parishioners
  USING (public.is_authorized_staff() AND parish_id = public.primary_parish_id());

ALTER POLICY "parishioners_update_authenticated" ON public.parishioners
  USING (public.is_authorized_staff() AND parish_id = public.primary_parish_id())
  WITH CHECK (public.is_authorized_staff() AND parish_id = public.primary_parish_id());

ALTER POLICY "requests_select_authenticated" ON public.requests
  USING (
    public.is_authorized_staff()
    AND EXISTS (
      SELECT 1 FROM public.parishioners p
      WHERE p.id = parishioner_id
        AND p.parish_id = public.primary_parish_id()
    )
  );

ALTER POLICY "requests_update_authenticated" ON public.requests
  USING (
    public.is_authorized_staff()
    AND EXISTS (
      SELECT 1 FROM public.parishioners p
      WHERE p.id = parishioner_id
        AND p.parish_id = public.primary_parish_id()
    )
  )
  WITH CHECK (
    public.is_authorized_staff()
    AND EXISTS (
      SELECT 1 FROM public.parishioners p
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
