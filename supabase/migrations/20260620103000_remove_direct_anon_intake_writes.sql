-- Public intake now writes through app/api/intake using server-side validation.
-- Remove direct anonymous table writes to reduce spam and partial-record risk.

DROP POLICY IF EXISTS "parishioners_insert_anon" ON public.parishioners;
DROP POLICY IF EXISTS "requests_insert_anon" ON public.requests;
DROP POLICY IF EXISTS "checklist_items_insert_anon" ON public.checklist_items;

DROP POLICY IF EXISTS "funeral_request_details_insert_anon" ON public.funeral_request_details;
DROP POLICY IF EXISTS "wedding_request_details_insert_anon" ON public.wedding_request_details;
DROP POLICY IF EXISTS "ocia_request_details_insert_anon" ON public.ocia_request_details;
DROP POLICY IF EXISTS "join_parish_request_details_insert_anon" ON public.join_parish_request_details;
