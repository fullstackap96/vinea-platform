# Vinea Documentation And Operations Index

Last updated: 2026-07-11

This is the front door to Vinea's repository documentation. Use it to find the source that answers a question; do not treat this index as a replacement for the linked source.

## Start Here

For a new operator, read these in order:

1. [Single Source of Truth](VINEA_SINGLE_SOURCE_OF_TRUTH.md) for Vinea's mission, product model, architecture, standards, official operating stack, and production gates.
2. [Roadmap](VINEA_ROADMAP.md) for current priorities, completed slices, future sequence, and explicit non-goals.
3. [Build Status](VINEA_BUILD_STATUS.md) for the latest implementation record, verification, risks, and recommended next task.
4. [Repository Audit](VINEA_REPO_AUDIT.md) for the current route, API, domain, test, documentation, and risk inventory.
5. [README](../README.md) for setup, local development, and release-readiness commands.

Before implementation work, also read [Codex Autonomous Instructions](../CODEX_AUTONOMOUS_INSTRUCTIONS.md), [VAOS Run Loop](autonomous-os/RUN_LOOP.md), and [Task Selection Scorecard](autonomous-os/TASK_SELECTION_SCORECARD.md).

## Source Authority

| Question | Primary source | What it controls |
| --- | --- | --- |
| What is Vinea, how should the company operate, and which boundaries are permanent? | [Single Source of Truth](VINEA_SINGLE_SOURCE_OF_TRUTH.md) | Enduring product and company truth |
| What should be built next? | [Roadmap](VINEA_ROADMAP.md) | Priority, sequence, status, and non-goals |
| What changed most recently and what passed? | [Build Status](VINEA_BUILD_STATUS.md) | Chronological implementation and verification record |
| What is currently in the repository? | [Repository Audit](VINEA_REPO_AUDIT.md) | Structural inventory and known risks |
| How does the application behave today? | Current code, focused tests, and `supabase/migrations/` | Runtime and database truth |
| How do I set up or verify the repository locally? | [README](../README.md) | Developer entry point and command sequence |
| How should Codex choose and execute work? | [Codex Autonomous Instructions](../CODEX_AUTONOMOUS_INSTRUCTIONS.md) and [VAOS docs](autonomous-os/RUN_LOOP.md) | Autonomous operating method and safety boundaries |
| Is a production-sensitive capability approved? | [Production-Sensitive Gate Boundary Index](PRODUCTION_SENSITIVE_GATE_BOUNDARY_INDEX_20260706.md) plus the capability-specific evidence package | Gate state only; passing local checks is not approval |

If sources disagree, use this order:

1. Direct owner instruction and repository-specific safety instructions.
2. Current code and focused tests for application behavior.
3. Supabase migrations and policies for database behavior.
4. Single Source of Truth for enduring direction and operating boundaries.
5. Roadmap for intended sequence.
6. Build Status for recent work history.
7. Repository Audit and dated reports for inventory and context.

Do not use an older dated evidence file to override newer code, a current gate index, or an explicit owner decision.

## VAOS Operator Path

| Need | Use |
| --- | --- |
| Master product-led engineering rules | [Codex Autonomous Instructions](../CODEX_AUTONOMOUS_INSTRUCTIONS.md) |
| Repeatable review, selection, implementation, and verification loop | [Run Loop](autonomous-os/RUN_LOOP.md) |
| Candidate-task scoring and safety rejection | [Task Selection Scorecard](autonomous-os/TASK_SELECTION_SCORECARD.md) |
| Standing safety boundaries | [Safety Guardrails](autonomous-os/SAFETY_GUARDRAILS.md) |
| Definition-of-done review | [Quality Checklist](autonomous-os/QUALITY_CHECKLIST.md) |
| Roadmap review method | [Roadmap Review Protocol](autonomous-os/ROADMAP_REVIEW_PROTOCOL.md) |
| Beginner-friendly handoff format | [Beginner Update Template](autonomous-os/BEGINNER_UPDATE_TEMPLATE.md) |
| Initial VAOS findings and baseline | [First Run Report](autonomous-os/FIRST_RUN_REPORT.md) |

## Production And Security Gates

Start with these index documents instead of opening individual approval packets at random:

| Area | Entry point | Current boundary |
| --- | --- | --- |
| Overall release review | [Production Release Readiness Handoff Index](PRODUCTION_RELEASE_READINESS_HANDOFF_INDEX_20260706.md) | Review map only; not deployment or production approval |
| Release candidate technical approval | [Release Candidate Technical Approval](RELEASE_CANDIDATE_TECHNICAL_APPROVAL_20260711.md) | Approved for remote CI and isolated non-production preview validation; production remains gated |
| All production-sensitive capabilities | [Production-Sensitive Gate Boundary Index](PRODUCTION_SENSITIVE_GATE_BOUNDARY_INDEX_20260706.md) | Capabilities remain `NO-GO` without separate explicit approval |
| Membership-aware operational RLS | [RLS Evidence Package Index](MEMBERSHIP_AWARE_RLS_PRODUCTION_EVIDENCE_PACKAGE_INDEX_20260629.md) | Evidence package prepared; production rollout not approved |
| Production monitoring | [Monitoring Evidence Package Index](PRODUCTION_MONITORING_EVIDENCE_PACKAGE_INDEX_20260705.md) | Runtime monitoring remains `NO-GO` |
| Trust-center claims | [Trust Center Evidence Gap Register](TRUST_CENTER_EVIDENCE_GAP_REGISTER_20260701.md) | Internal gap tracking only; public claims remain `NO-GO` |
| Incident readiness | [Incident Tabletop Evidence Package Index](INCIDENT_TABLETOP_EVIDENCE_PACKAGE_INDEX_20260705.md) and [Incident Response Runbook](INCIDENT_RESPONSE_RUNBOOK_20260627.md) | Prepared guidance is not completed production evidence |
| Backup and restore | [Backup And Restore Runbook](BACKUP_RESTORE_RUNBOOK_20260627.md) | Existing evidence is bounded; stronger production claims remain gated |
| Environment contract | [Environment Configuration Baseline](ENVIRONMENT_CONFIGURATION_BASELINE_20260709.md) | Variable names and safety rules only; no secret values or deployment approval |

The gate index tells you whether work may proceed. The evidence package tells you what reviewers need. An approval packet prepares a decision; it does not grant approval merely by existing.

## QA And Evidence Navigation

Dated QA files are evidence snapshots, not evergreen product truth. Read the status near the top before using one:

- `*_CHECKLIST_YYYYMMDD.md`: steps prepared for a future or current QA run.
- `*_READINESS_YYYYMMDD.md`: prerequisite and fixture readiness, not completed QA.
- `*_EVIDENCE_TEMPLATE_YYYYMMDD.md`: blank evidence shape.
- `*_EVIDENCE_YYYYMMDD_COMPLETED.md`: recorded completion within the exact stated scope.
- `*_EVIDENCE_YYYYMMDD_BLOCKED.md` or `*_RECHECK_*_BLOCKED.md`: attempted or reviewed work that did not meet prerequisites.
- `*_APPROVAL_PACKET_YYYYMMDD.md`: material prepared for human approval; not approval itself.
- `*_RUNBOOK_YYYYMMDD.md`: operating procedure; not proof that the procedure was executed.

To find topic-specific evidence without guessing a filename, search by product area and status:

```powershell
rg --files docs | rg "DAILY_WORK_HUB|SACRAMENTAL|PUBLIC_INTAKE"
rg --files docs | rg "EVIDENCE|CHECKLIST|READINESS|BLOCKED"
rg -n "Current decision|Current decision state|Status:" docs -g "*.md"
```

Prefer the topic's package index when one exists. Then follow its required review order and linked evidence rather than choosing the newest-looking file in isolation.

## Product And Company Context

These dated reports explain how the current strategy was formed. They are useful context, but the Single Source of Truth and Roadmap govern current decisions:

- [Engineering And Product State Report](VINEA_ENGINEERING_PRODUCT_STATE_REPORT_20260702.md): detailed architecture, product surface, gaps, and recommendations as of 2026-07-02.
- [Product Report](VINEA_PRODUCT_REPORT_20260702.md): concise product thesis, strengths, gaps, and roadmap focus as of 2026-07-02.
- [Executive Summary](VINEA_EXECUTIVE_SUMMARY_20260702.md): executive-level snapshot as of 2026-07-02.
- [Project Status](../project-status.md): legacy route, data model, environment-name, and limitation reference; verify it against current code before relying on details.

## Documentation Maintenance

Update only the source whose role changed:

- Update Single Source of Truth when Vinea's enduring identity, architecture, operating stack, standards, or production gates change.
- Update Roadmap when priority, sequence, implementation status, or non-goals change.
- Update Build Status for each material work slice, including verification, risks, and next task.
- Update Repository Audit when route, API, schema, test, documentation, or risk inventory changes materially.
- Update README when setup commands or repository entry points change.
- Update this index when a primary source, package index, runbook, or navigation rule changes.

Keep historical evidence files. Correct a factual error in place only when the correction is clearly labeled; otherwise create or update the current package index so reviewers can see which evidence supersedes older material.

## Safety Boundary

Documentation, local tests, lint, and builds do not authorize production access or action. Production data access, migrations, operational RLS changes, deployments, production flags, exports, storage access, signed URLs, communications, AI runtime changes, certificate generation, sacramental record mutation, and public trust claims require their separate explicit approvals and evidence.
