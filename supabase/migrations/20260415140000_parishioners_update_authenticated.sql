-- Staff dashboard: allow authenticated users to update parishioner contact fields
-- (intake corrections). Without this, PostgREST updates can affect 0 rows under RLS
-- while still returning error: null, which made "Save changes" appear to succeed.

DROP POLICY IF EXISTS "parishioners_update_authenticated" ON public.parishioners;

CREATE POLICY "parishioners_update_authenticated"
  ON public.parishioners
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
