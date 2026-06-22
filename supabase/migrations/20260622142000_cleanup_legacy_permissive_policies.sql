-- Cleanup legacy permissive access left over from pre-server-intake flows.
--
-- Public intake now goes through app/api/intake with server-side validation and
-- the Supabase service role. Anonymous clients should not be able to write
-- parish operational tables directly, even if an older environment still has
-- permissive policies from an early migration or manual setup.

-- Core public-intake tables.
DROP POLICY IF EXISTS "parishioners_insert_anon" ON public.parishioners;
DROP POLICY IF EXISTS "requests_insert_anon" ON public.requests;
DROP POLICY IF EXISTS "checklist_items_insert_anon" ON public.checklist_items;

-- Request detail tables.
DROP POLICY IF EXISTS "funeral_request_details_insert_anon" ON public.funeral_request_details;
DROP POLICY IF EXISTS "wedding_request_details_insert_anon" ON public.wedding_request_details;
DROP POLICY IF EXISTS "ocia_request_details_insert_anon" ON public.ocia_request_details;
DROP POLICY IF EXISTS "join_parish_request_details_insert_anon" ON public.join_parish_request_details;

-- Older policy names used in commented/manual examples.
DROP POLICY IF EXISTS "funeral_details_insert_anon" ON public.funeral_request_details;
DROP POLICY IF EXISTS "wedding_details_insert_anon" ON public.wedding_request_details;
DROP POLICY IF EXISTS "ocia_details_insert_anon" ON public.ocia_request_details;
DROP POLICY IF EXISTS "join_parish_details_insert_anon" ON public.join_parish_request_details;

-- Defense-in-depth: remove direct anon table privileges for parish data. Staff
-- access remains mediated by authenticated RLS policies; intake and family
-- portal writes continue through service-role route handlers.
REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE
  public.parishioners,
  public.requests,
  public.checklist_items,
  public.request_communications,
  public.request_notes,
  public.funeral_request_details,
  public.wedding_request_details,
  public.ocia_request_details,
  public.join_parish_request_details,
  public.people,
  public.households,
  public.household_members,
  public.sacramental_records,
  public.sacramental_record_events,
  public.mass_intentions,
  public.staff_users,
  public.audit_events,
  public.import_batches,
  public.workflow_templates,
  public.workflow_template_steps,
  public.request_workflow_steps,
  public.request_documents,
  public.request_portal_tokens
FROM anon;

-- RLS policies call these helpers for authenticated staff, but anon no longer
-- needs to execute them after direct anonymous writes were removed. Revoke the
-- inherited PUBLIC default first, then grant authenticated staff back explicitly.
REVOKE EXECUTE ON FUNCTION public.primary_parish_id() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.request_belongs_to_primary_parish(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_authorized_staff() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.primary_parish_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.request_belongs_to_primary_parish(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_authorized_staff() TO authenticated;

-- Trigger/helper functions should not be directly executable by browser roles.
REVOKE EXECUTE ON FUNCTION public.parishioners_set_parish_id_before_insert() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.vinea_validate_schedule_not_past() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.sacramental_records_before_write() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.sacramental_record_events_after_write() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.people_households_before_write() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.household_members_before_write() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.workflow_templates_touch_updated_at() FROM PUBLIC;
