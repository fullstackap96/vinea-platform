# VAOS Safety Guardrails

Last updated: 2026-07-05

Vinea handles parish, family, sacramental, operational, and sometimes pastoral data. Safety is part of the product.

## Hard No-Go Without Explicit Owner Approval

Do not automatically:

- Access, mutate, delete, export, or restore production data.
- Apply production migrations.
- Deploy to production.
- Weaken authentication, authorization, middleware, staff checks, or RLS.
- Re-enable direct anonymous writes to parish data tables.
- Send customer, parish, parishioner, support, sales, or marketing emails.
- Contact any parish or external customer.
- Change billing, pricing, legal, company, or public support information.
- Publish public trust-center, security, compliance, backup, uptime, or privacy claims.
- Generate certificates automatically.
- Mutate sacramental records or canonical notation state automatically.
- Make pastoral, canonical, sacramental eligibility, or family-care decisions.
- Enable autonomous AI actions or outbound communications.
- Remove major features.

## Approval Required Before Runtime Work

Require the relevant product/security/owner approval packet before implementing:

- Production membership-aware RLS promotion.
- Production monitoring runtime.
- Workflow reminders runtime.
- Certificate issuance logging runtime.
- Sacramental correction or notation runtime.
- Public trust-center publishing.
- Production backup/restore claims.
- Any data deletion or retention automation.

## Safe Default Alternatives

When a high-value task is blocked, choose one of:

- Read-only dashboard visibility.
- Non-runtime DTOs.
- Source-level preflight tests.
- Approval packet.
- QA evidence template.
- Owner worksheet.
- Repo audit update.
- Documentation that clearly marks work as future, blocked, or no-go.

## Secrets And Evidence

Never write secret values into the repo. This includes:

- Supabase service-role keys.
- Database URLs with passwords.
- OpenAI keys.
- Resend keys.
- Google client secrets or refresh tokens.
- Vercel tokens.
- Production emails, raw private document contents, signed URLs, raw exports, or private parish data.

Evidence docs should use non-secret labels and safe summaries.

## AI Boundaries

AI may assist staff by summarizing, drafting, routing, and recommending next steps. AI must not:

- Send messages without staff approval.
- Decide sacramental eligibility.
- Mutate canonical records.
- Bypass staff permissions.
- Expose data outside the user's permission scope.
- Hide source uncertainty.

## Public Claims Boundary

Internal readiness docs are not public marketing. Do not convert internal evidence into public claims until the trust-center claims owner review says the claim is approved.
