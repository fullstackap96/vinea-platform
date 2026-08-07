# Shared-QA Migration History And Schema/Policy Reconciliation Evidence

Status: `READ-ONLY RECONCILIATION COMPLETED; REPAIR NO-GO`

Date: 2026-08-07

Target label: `Shared QA Supabase project`

## Scope

This reconciliation compared three repository migrations with Supabase migration
metadata and Postgres catalog metadata only:

- `20260625193000_public_intake_parish_routing.sql`
- `20260626170000_membership_aware_operational_rls.sql`
- `20260630170000_enable_parishes_rls.sql`

No parish/customer table was queried. No migration-history repair, migration,
DDL, DML, RLS change, function change, or production access occurred.

## Repository Fingerprints

| Migration | SHA-256 |
| --- | --- |
| `20260625193000_public_intake_parish_routing.sql` | `87081C357EB87B7CA84FA7556FAF795EBC5730222BF28E529DD993DD41E850FF` |
| `20260626170000_membership_aware_operational_rls.sql` | `DF06A8D742FF630358EABA8C727B472D6BE3C6079E0B7ADEED7E28587B601E66` |
| `20260630170000_enable_parishes_rls.sql` | `31B04315996745E9092F40CB4869366C6055E176C83C79BA522401DFAA691D67` |

## Sanitized JSON Evidence

```json
{
  "status": "completed_read_only",
  "targetLabel": "shared QA Supabase project",
  "migrationHistory": {
    "latestTrackedVersion": "20260626103000",
    "latestTrackedName": "public_intake_domain_verification",
    "publicIntakeRoutingTracked": false,
    "membershipAwareOperationalRlsTracked": false,
    "parishesRlsTracked": false,
    "driftConfirmed": true
  },
  "publicIntakeRouting": {
    "catalogFingerprintMatches": true,
    "requiredBaseColumnCount": 20,
    "laterTrackedDomainVerificationColumnCount": 5,
    "requiredIndexCount": 5,
    "requiredPolicyCount": 4,
    "requiredPoliciesPresent": 4,
    "rlsEnabledOnBothRoutingTables": true,
    "unexpectedPolicies": 0,
    "classification": "effects_present_history_missing_with_later_tracked_extension"
  },
  "membershipAwareOperationalRls": {
    "targetTableCount": 17,
    "targetTablesPresent": 17,
    "targetTablesRlsEnabled": 17,
    "expectedPolicyCount": 45,
    "presentPolicyCount": 45,
    "authenticatedRoleExactCount": 45,
    "scopeMismatchCount": 0,
    "commandShapeMismatchCount": 0,
    "documentIntegrityMismatchCount": 0,
    "unexpectedPolicyCount": 0,
    "requestScopeHelperDefinitionMatches": true,
    "requestScopeHelperSecurityDefiner": true,
    "requestScopeHelperSearchPath": "public",
    "requestScopeHelperAuthenticatedExecute": true,
    "requestScopeHelperServiceRoleExecute": true,
    "requestScopeHelperAnonymousExecute": true,
    "privilegeSurfaceMatchesMigration": false,
    "classification": "effects_present_history_missing_with_function_execute_drift"
  },
  "parishesRls": {
    "rlsEnabled": true,
    "expectedPolicyPresent": true,
    "expectedRolesPresent": true,
    "expectedMembershipPredicatePresent": true,
    "unexpectedPolicyCount": 0,
    "classification": "effects_present_history_missing"
  },
  "decision": {
    "replayAnyTargetMigration": false,
    "repairMigrationHistory": false,
    "applyFunctionPrivilegeCandidate": false,
    "sharedQaWriteApproved": false,
    "productionTouched": false
  }
}
```

## Findings

### Public intake routing

The three parish routing columns, both routing tables, all required base columns,
constraints, five indexes, RLS settings, and four authenticated membership-scoped
policies match the repository migration fingerprint. The domain table also has
five expected verification fields from the later tracked domain-verification
migration. The base routing migration is absent from history even though its
effects are present.

### Membership-aware operational RLS

All 17 target tables exist with RLS enabled. All 45 expected policies are present,
use the exact `authenticated` role surface, have the expected command shape and
membership/request scope markers, retain the document workflow-step integrity
predicate, and have no unexpected peer policies on those tables.

The request-scope helper matches the expected stable, security-definer,
`search_path=public`, request/parishioner membership definition. However,
anonymous execution remains effective. That does not match the migration's
`REVOKE ... FROM PUBLIC` intent and is consistent with the separately documented
function-privilege finding. The disposable hardening candidate passed validation,
but it was not applied here.

### Parishes RLS

`public.parishes` has RLS enabled and its sole reviewed policy matches the
repository migration's authenticated/service-role membership predicate. The
migration version is absent from history even though the effect is present.

## Decision

The shared-QA database contains the material schema/policy effects of all three
target migrations, but migration history does not record them. Replaying any of
the files would be unsafe and is `NO-GO`. Migration-history repair and shared-QA
function-privilege application each require a separate guarded plan, exact
approval, rollback evidence, and post-change smoke testing.

This is catalog reconciliation evidence only. It is not production evidence,
runtime workflow evidence, migration-repair approval, RLS-change approval, or a
public trust claim.

## Repository Verification

- Focused reconciliation coverage passed `4` files / `22` tests.
- Both TypeScript scopes passed.
- ESLint passed.
- The complete Vitest suite passed.
- Repository secret scanning passed across 2,935 text files with zero findings
  and no secret values printed.
- `git diff --check` passed; line-ending notices are existing Windows working-copy
  warnings, not patch errors.
