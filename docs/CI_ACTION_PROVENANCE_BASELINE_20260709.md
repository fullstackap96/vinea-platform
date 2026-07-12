# CI Action Provenance Baseline

Status: Implemented and verified. Vinea's GitHub Actions workflow uses immutable commit references for third-party actions while retaining human-readable major-version comments.

## Pinned Actions

The official repositories' `v4` refs were resolved on 2026-07-09 and recorded as:

- `actions/checkout`: `93cb6efe18208431cddfb8368fd83d5badbf9bfd` (`v5`)
- `actions/setup-node`: `48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e` (`v6`)

The workflow uses the immutable commit, not the mutable major-version tag. The trailing `# v4` comment remains for reviewer readability.

## Review And Update Rules

1. Resolve future action updates from the action's official GitHub repository.
2. Review the release notes and changed source before replacing a pinned commit.
3. Keep every `uses:` reference pinned to a full 40-character commit SHA.
4. Do not grant new workflow permissions, add deployment commands, apply migrations, or introduce service credentials as part of a routine action update.
5. Rerun CI source tests, repository secret scanning, release-handoff checks, typechecks, lint, tests, and the production build after an update.

## Safety Boundary

- Workflow permissions changed: `NO`
- Deployment capability added: `NO`
- Production credentials added: `NO`
- Production-sensitive feature gates approved: `NO`
- Public trust claims approved: `NO`
