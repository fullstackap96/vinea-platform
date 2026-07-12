# Dependency Update Maintenance Baseline

Status: Implemented and verified. Vinea now has a repository-owned Dependabot cadence for npm packages and GitHub Actions.

## Update Scope

- npm dependencies are checked weekly from the repository root.
- production minor/patch updates are grouped separately from development minor/patch updates.
- major npm updates remain separate review items instead of being mixed into routine groups.
- GitHub Actions are checked weekly from the repository root so immutable action pins can receive reviewed update pull requests.
- open version-update pull requests are limited to five for npm and two for GitHub Actions.

## Required Review Boundary

Dependabot may propose a pull request. It may not merge, deploy, apply migrations, enable runtime gates, change operational RLS, or approve a production-sensitive feature.

Every proposed update must:

1. pass the existing read-only CI workflow;
2. preserve full-commit GitHub Action pins;
3. receive human review for release notes, compatibility, and security impact;
4. keep production-sensitive feature gates and public trust claims closed; and
5. be rolled back by closing or reverting the pull request if verification fails.

## Safety Boundary

- automatic merge configured: `NO`
- deployment capability added: `NO`
- private registry credentials configured: `NO`
- production flags added or enabled: `NO`
- migrations or operational RLS changes included: `NO`
- production-sensitive features approved: `NO`
- public trust claims approved: `NO`

## Verification

- `.github/dependabot.yml` uses configuration schema version `2`.
- npm and GitHub Actions both use repository-root, weekly schedules.
- the policy has finite pull-request limits and no registry, credential, reviewer, assignee, or target-branch override.
- focused source tests keep the maintenance and safety boundaries enforceable.
