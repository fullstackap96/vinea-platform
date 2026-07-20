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

- Focused document validation, client-message, authorization, signed-URL, and compensation coverage passed.
- TypeScript and ESLint passed before the complete release gate.
- Production-sensitive gates remain disabled and production rollout remains separately controlled.

