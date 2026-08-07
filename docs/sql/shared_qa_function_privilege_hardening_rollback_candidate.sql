-- NON-APPLIED EMERGENCY ROLLBACK CANDIDATE. EXPLICIT APPROVAL REQUIRED.
--
-- Shared QA only. This restores the reviewed pre-hardening function privilege
-- and schedule-function configuration baseline captured on 2026-08-07. It
-- intentionally reopens broad execution and therefore must be used only after
-- a documented stop condition. It does not change tables, policies, data,
-- operational RLS, migration history, or production.

BEGIN;

ALTER FUNCTION public.vinea_validate_schedule_not_past()
  RESET search_path;

GRANT EXECUTE ON FUNCTION public.check_public_intake_rate_limit(text, integer, integer) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_request_workflow_steps_from_active_template(uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.current_staff_parish_ids() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.current_staff_primary_parish_id() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.household_members_before_write() TO PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_authorized_for_parish(uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_authorized_staff() TO PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.parishioners_set_parish_id_before_insert() TO PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.people_households_before_write() TO PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.primary_parish_id() TO PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.request_belongs_to_primary_parish(uuid) TO PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.request_belongs_to_staff_parish(uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.sacramental_record_events_after_write() TO PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.sacramental_records_before_write() TO PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.sync_parish_membership_from_staff_user() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.vinea_validate_schedule_not_past() TO PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.workflow_templates_touch_updated_at() TO PUBLIC, anon, authenticated, service_role;

COMMIT;
