# Production Security Headers Baseline

Current decision state: `SECURITY HEADERS BASELINE IMPLEMENTED; CSP REMAINS SEPARATE QA`

Date prepared: 2026-07-07

## Purpose

This document records the conservative browser security headers now configured in `next.config.ts`.

Next.js framework advertising is also disabled with `poweredByHeader: false`, so responses do not add the default `X-Powered-By` fingerprint. This changes no application behavior and does not replace the separately gated CSP review.

This slice improves the default HTTP response posture without enabling production-sensitive features, accessing production, applying migrations, changing operational RLS, mutating records, touching Google Calendar data, running exports, calling AI, accessing storage, creating signed URLs, sending communications, generating certificates, or making public trust-center claims.

## Implemented Headers

| Header | Value | Reason |
|---|---|---|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Tells browsers to prefer HTTPS for the app domain after a secure visit. |
| `X-Frame-Options` | `DENY` | Prevents the app from being embedded in frames, reducing clickjacking risk. |
| `X-Content-Type-Options` | `nosniff` | Prevents browsers from guessing a different content type than the server declares. |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limits how much URL detail is sent to other origins. |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=()` | Disables browser features Vinea does not need for parish office workflows today. |

## Sensitive Response Cache Boundary

All `/api/:path*`, authenticated `/dashboard/:path*`, and tokenized `/family/request/:path*` responses also receive:

| Header | Value | Reason |
|---|---|---|
| `Cache-Control` | `private, no-store, max-age=0` | Prevents browsers, shared caches, and intermediaries from retaining staff, parishioner, request, document, audit, settings, workflow, or family portal responses. |
| `Pragma` | `no-cache` | Provides conservative compatibility for older HTTP clients. |
| `Expires` | `0` | Marks API responses immediately stale for legacy cache behavior. |
| `X-Robots-Tag` | `noindex, nofollow, noarchive` | Tells compliant crawlers not to index, follow links from, or archive sensitive API, staff, or tokenized family responses. |

This policy applies consistently to authenticated and public APIs, staff dashboard pages, and family portal pages containing token-scoped information. Route-specific responses may remain equally or more restrictive. It does not change authentication, authorization, runtime data, or production-sensitive feature gates.

## Tokenized Family Portal Referrer Boundary

`/family/request/:path*` additionally receives `Referrer-Policy: no-referrer`. The family access token is part of the portal URL, so the browser must not send that token-bearing portal URL in a `Referer` header during same-origin uploads, reloads, or navigation to another site.

This route-specific policy is intentionally stricter than the application-wide `strict-origin-when-cross-origin` baseline. Family document uploads continue to use the existing same-origin API and origin-validation boundary; they do not depend on a Referer header. No token, storage path, signed URL, filename, or document content is added to logs or response metadata by this change.

## Sensitive Search Indexing Boundary

The scoped `/api/:path*`, `/dashboard/:path*`, and `/family/request/:path*` rules apply `X-Robots-Tag: noindex, nofollow, noarchive`. This protects authenticated parish-office screens, tokenized family pages, and API responses from accidental indexing or crawler archives even if a URL is discovered.

The header is intentionally absent from the global `/:path*` rule. Vinea's public home page and public intake pages retain their existing search behavior. This is a crawler instruction and defense in depth; it does not replace authentication, authorization, expiring portal tokens, or cache controls.

## Intentional CSP Boundary

`Content-Security-Policy` is not added in this slice.

CSP should be designed and tested separately because Vinea uses a modern Next.js app shell, Supabase auth, Google OAuth/Calendar flows, Resend email paths, public intake pages, and dashboard scripts. A rushed CSP could break staff sign-in, public forms, or future provider callbacks.

Future CSP work should include:

- a report-only CSP proposal first
- local and shared-QA browser smoke for sign-in, dashboard, public intake, family portal, Google OAuth callback, document upload, and certificate view routes
- provider allowlist review
- rollback instructions
- evidence that no inline script/runtime breakage occurs

## Verification

Automated coverage:

- `lib/server/nextSecurityHeadersConfig.test.ts` confirms the baseline headers apply to `/:path*`, the explicit no-store and no-index policies apply to `/api/:path*`, `/dashboard/:path*`, and `/family/request/:path*`, public pages do not inherit the no-index rule, and the tokenized family portal applies the stricter `no-referrer` policy.
- The test also confirms CSP is intentionally absent until a separate QA pass is approved.

## Production Boundary

This baseline does not grant production approval for:

- production RLS rollout
- production monitoring
- production exports
- public intake production routing
- production AI safety-chain rollout
- backup/restore public claims
- public trust-center publication
- workflow reminder runtime delivery
- certificate issuance logging runtime
- sacramental correction or notation runtime workflows
