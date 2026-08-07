-- NON-APPLIED SECURITY CANDIDATE. REVIEW AND DISPOSABLE-VALIDATE FIRST.
--
-- This file is intentionally outside supabase/migrations. It must not be run
-- against shared QA or production without a separate, explicit approval.
-- It changes function configuration and EXECUTE privileges only. It does not
-- create policies, change operational RLS, modify data, or reconcile migration
-- history.

BEGIN;

-- Trigger-only validation function: fix the advisor's mutable search_path
-- finding and remove direct Data API execution.
ALTER FUNCTION public.vinea_validate_schedule_not_past()
  SET search_path = '';

-- Revoke every reviewed Data API role before granting back only the exact
-- authenticated and server-owned surfaces below. Revoking service_role here is
-- required because hosted projects may contain explicit default EXECUTE grants
-- for that role even after PUBLIC is revoked.
REVOKE EXECUTE ON FUNCTION public.check_public_intake_rate_limit(text, integer, integer) FROM PUBLIC, anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.create_request_workflow_steps_from_active_template(uuid) FROM PUBLIC, anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.current_staff_parish_ids() FROM PUBLIC, anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.current_staff_primary_parish_id() FROM PUBLIC, anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.household_members_before_write() FROM PUBLIC, anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.is_authorized_for_parish(uuid) FROM PUBLIC, anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.is_authorized_staff() FROM PUBLIC, anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.parishioners_set_parish_id_before_insert() FROM PUBLIC, anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.people_households_before_write() FROM PUBLIC, anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.primary_parish_id() FROM PUBLIC, anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.request_belongs_to_primary_parish(uuid) FROM PUBLIC, anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.request_belongs_to_staff_parish(uuid) FROM PUBLIC, anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.sacramental_record_events_after_write() FROM PUBLIC, anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.sacramental_records_before_write() FROM PUBLIC, anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.sync_parish_membership_from_staff_user() FROM PUBLIC, anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.vinea_validate_schedule_not_past() FROM PUBLIC, anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.workflow_templates_touch_updated_at() FROM PUBLIC, anon, authenticated, service_role;

-- Signed-in staff and RLS policies require only these authorization helpers.
GRANT EXECUTE ON FUNCTION public.current_staff_parish_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_staff_primary_parish_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_authorized_for_parish(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_authorized_staff() TO authenticated;
GRANT EXECUTE ON FUNCTION public.primary_parish_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.request_belongs_to_primary_parish(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.request_belongs_to_staff_parish(uuid) TO authenticated;

-- These are called only through server-owned service-role paths. The first two
-- are operational RPCs. The final two are non-mutating /api/health schema probes.
-- Explicit grants document that boundary without exposing the functions to anon.
GRANT EXECUTE ON FUNCTION public.check_public_intake_rate_limit(text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.create_request_workflow_steps_from_active_template(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.current_staff_parish_ids() TO service_role;
GRANT EXECUTE ON FUNCTION public.is_authorized_for_parish(uuid) TO service_role;

COMMIT;
