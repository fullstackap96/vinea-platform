# Follow-up: Request detail table RLS

**Status:** Deferred (not included in P0 `20260610180000_core_request_rls_and_parish_scope.sql`)

## Why this matters

Public intake forms insert into type-specific detail tables **after** creating `requests`. RLS is enabled on these tables in existing migrations, but **anon INSERT policies are commented out or missing** in the repository. After P0 core RLS ships, intake may still fail at the detail step depending on hosted Supabase policy state.

## Tables to address

| Table | Intake route | Migration reference |
|-------|----------------|---------------------|
| `funeral_request_details` | `/funeral-request` | `supabase/migrations/20260410120000_funeral_request_details.sql` |
| `wedding_request_details` | `/wedding-request` | `supabase/migrations/20260410130000_wedding_request_details.sql` |
| `ocia_request_details` | `/ocia-request` | `supabase/migrations/20260415120000_ocia_request_details.sql` |
| `join_parish_request_details` | `/join-parish-request` | `supabase/migrations/20260426100500_join_parish_request_details.sql` |

## Recommended policy pattern (V1)

Mirror core request child tables:

1. **`anon` INSERT** — allow insert when `request_id` references a request whose parishioner belongs to `primary_parish_id()` (or `WITH CHECK (true)` if FK + trigger timing makes EXISTS checks unreliable on same transaction).
2. **`authenticated` SELECT** — `request_belongs_to_primary_parish(request_id)` (reuse helper from P0 migration).
3. **`authenticated` UPDATE** — same `USING` / `WITH CHECK` as SELECT.

## Suggested migration filename

`supabase/migrations/YYYYMMDD_request_detail_table_rls.sql`

## Verification checklist (when implemented)

- [ ] Submit funeral intake end-to-end (detail row created)
- [ ] Submit wedding intake end-to-end
- [ ] Submit OCIA intake end-to-end
- [ ] Submit join-parish intake end-to-end
- [ ] Staff can read/update detail rows on request detail page
- [ ] Authenticated user cannot read detail rows for another parish’s requests (if multi-parish test env exists)

## Related code paths

- `app/funeral-request/page.tsx` — `funeral_request_details.insert`
- `app/wedding-request/page.tsx` — `wedding_request_details.insert`
- `app/ocia-request/page.tsx` — `ocia_request_details.insert`
- `app/join-parish-request/page.tsx` — `join_parish_request_details.insert`
- `app/dashboard/requests/[id]/page.tsx` — staff read/update of detail fields
