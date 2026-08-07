# Function Privilege Hardening Disposable Validation Evidence

Status: `PASSED`

Date: 2026-08-07

Target label: `Approved reusable disposable Supabase project`

## Scope

The guarded validator applied
`docs/sql/shared_qa_function_privilege_hardening_candidate.sql` inside one
database transaction, inspected only Postgres function catalog metadata, rolled
the transaction back, and compared the restored catalog state with the baseline.

The disposable project was confirmed active before the connection and returned
to its prior inactive state after validation. The temporary `postgres` runner
was installed without package metadata changes and removed after execution.

This evidence supersedes the first 2026-08-07 run. Source review found that the
first validator proved the two operational service RPC grants were preserved but
did not prove excess `service_role` grants were removed. The candidate and
validator were corrected before this rerun. Candidate SHA-256:
`82D84FF5C81B215330A49F51ED1DB7F7025D982FC2405DA83CD1736CA3622DF8`.

## Sanitized JSON Evidence

```json
{
  "status": "completed",
  "targetClass": "supabase_disposable",
  "targetLabel": "approved reusable disposable project",
  "safety": {
    "confirmationAccepted": true,
    "reusableDisposableAllowed": true,
    "candidatePath": "docs/sql/shared_qa_function_privilege_hardening_candidate.sql",
    "transactionRollbackRequired": true,
    "sharedQaTouched": false,
    "productionTouched": false,
    "parishDataRead": false,
    "temporaryRunnerRemoved": true,
    "targetReturnedToPriorInactiveState": true
  },
  "baseline": {
    "functionCount": 17,
    "allFunctionsPresent": true
  },
  "candidate": {
    "functionCount": 17,
    "allAnonRevoked": true,
    "authenticatedSurfaceExact": true,
    "serviceRpcSurfacePreserved": true,
    "serviceRoleSurfaceExact": true,
    "scheduleSearchPathFixed": true
  },
  "rollback": {
    "baselineRestored": true
  }
}
```

## Interpretation

- Anonymous direct execution was removed from all 17 reviewed functions.
- The authenticated execution surface matched exactly the seven approved
  staff/RLS helper functions.
- The service-role execution surface matched exactly four verified server call
  sites: two operational RPCs plus the two non-mutating schema-health probes.
- The other 13 reviewed functions had no effective `service_role` execution.
- The schedule trigger function used a fixed empty `search_path` under the
  candidate.
- Transaction rollback restored the complete reviewed privilege/configuration
  baseline.

This proves the intended catalog privilege and configuration behavior. It does
not claim that trigger behavior, RPC business behavior, application health, or
staff/public-intake workflows were exercised in this run.

## Safety Boundary

Shared QA and production were not accessed. No migration was applied, no
operational RLS was changed, no parish/customer table was queried, and no secret,
database URL, raw identifier, or credential was written to this evidence.

Shared-QA application remains `NO-GO` pending the remaining reconciliation,
application-smoke, advisor, rollback, and explicit-approval gates.

## Repository Verification

- Focused reconciliation, runner, and evidence coverage passed.
- Both TypeScript scopes passed.
- ESLint passed.
- The complete Vitest suite passed.
- Repository secret scanning passed across the checked repository text files
  and no secret values printed.
- Clean dependency restoration reported zero known npm vulnerabilities; the
  reviewed `package.json` and `package-lock.json` hashes were unchanged by the
  temporary runner cycle.
