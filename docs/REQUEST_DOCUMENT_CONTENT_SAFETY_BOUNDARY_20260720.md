# Request Document Content Safety Boundary - 2026-07-20

Status: `REQUEST_DOCUMENT_CONTENT_SAFETY_BOUNDARY_IMPLEMENTED_20260720`

## What Changed

- Staff and family request-document uploads now accept only PDF, JPEG, and PNG files.
- The server verifies the original filename extension, declared MIME type, and leading file signature before any storage upload.
- A missing browser MIME type may be treated as `application/octet-stream`, but the extension and signature must still identify an approved type.
- Storage receives the server-confirmed canonical MIME type rather than the browser-provided value.
- Staff and family file pickers use the same PDF/JPEG/PNG hint as the server allowlist.
- Staff signed-document access requests an attachment download with a sanitized filename rather than relying on browser inline rendering.

## Preserved Boundaries

- Staff authentication, active-parish membership, and same-parish request ownership remain required.
- Family uploads still require a valid portal token, authorized family workflow step, same-origin request, and durable rate limit.
- The 10 MB limit, private bucket, 60-second signed URL lifetime, checked upload confirmation, database-row confirmation, cleanup compensation, and privacy-safe logging remain unchanged.
- No migration, operational RLS change, storage-policy change, production access, real upload, signed URL creation, or record mutation occurred during implementation or verification.

## Honest Limitations

- Signature validation is a narrow content-type boundary, not antivirus or malware scanning.
- Existing stored documents are not retroactively rescanned or reclassified.
- PDF/JPEG/PNG support intentionally excludes Word documents and other file formats until a separate security and product review approves them.
- The storage/database upload sequence remains compensating rather than transactional.

## Verification

- Immutable implementation commit: `39d239838bafbeca34ec90afc9a8ef82016327f8`.
- Focused document validation, client-message, authorization, signed-URL, compensation, and manifest coverage passed: `10` files / `59` tests.
- The complete `15`-check local release contract passed in `342.1` seconds: zero secret findings across `2,844` text files with `500` binaries skipped, zero dependency vulnerabilities, every evidence gate, both TypeScript scopes, lint, `837` test files / `3,580` tests, and the credential-free Next.js 16 `56`-page build.
- A clean detached checkout of the implementation commit produced release-source aggregate `BE71462D763C8026548286A756616F9287F94BF2FA1CECA5EA981ADCD9EF437C` across `1,474` tracked files with zero untracked source files and a clean worktree.
- Production-sensitive gates remain disabled and production rollout remains separately controlled.
