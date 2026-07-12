# Mass Intentions Selected-Parish Scope UX

Status: Completed as a safe tenant-readiness hardening phase. Production was not accessed, no migrations were applied, operational RLS was not changed, Google Calendar was not touched, and no secrets were exposed.

## What Changed

- Updated the Mass Intentions list loader to return the selected active parish display name from the same validated active parish context used to filter Mass Intention records.
- Updated the Mass Intentions list page to show a visible `Mass intentions are scoped to ...` label.
- Updated focused loader tests to confirm the display name follows validated active parish context and stale-cookie fallback.
- Preserved existing Mass Intentions list, search, fulfillment filtering, detail links, create links, write paths, migration, RLS, and Google Calendar behavior.

## What Changed Plain English

The Mass Intentions page now clearly says which parish the intention list belongs to. Staff who serve more than one parish can see the selected parish before opening or adding Mass intentions.

## Why This Matters

Mass intentions are a Catholic-specific office workflow where parish context matters. A clear selected-parish label makes multi-parish use safer and reduces the chance that staff work in the wrong intention list.

## Validation

- The loader still resolves active parish context through `resolveActiveStaffParishContext`.
- The loader still filters Mass Intentions by `parish_id` using the validated active parish id.
- The page now displays the active parish name as a staff-facing label only.
- No production access, migrations, operational RLS changes, Google Calendar changes, or secrets were involved.

## Known Limitations

- This is a UX clarity improvement only. It does not change Mass Intentions visibility rules or promote production RLS.
- Browser QA should still verify the label updates after parish switching in shared QA or another approved non-production environment.

## Outcome

Current status: `MASS_INTENTIONS_SELECTED_PARISH_SCOPE_UX_COMPLETE_CODE_ONLY`

Mass Intentions now matches the selected-parish scope clarity pattern already used for Reports, Requests, Parish Care Calendar, Global Search, People, Households, and Sacramental Records.
