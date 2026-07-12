# Request Detail Explicit Any AST Guard

Status: Implemented and verified locally on 2026-07-11.

The Request Detail DTO boundary test now parses TSX with the TypeScript compiler and rejects real `AnyKeyword` nodes. It no longer rejects ordinary staff-facing prose merely because a sentence contains the word `any`.

Self-tests prove that:

- `const unsafe: any` is rejected;
- `value as any` is rejected;
- plain-language copy such as `Review any existing event` is allowed.

This improves the accuracy of the existing typed-response safety boundary. It does not loosen TypeScript checks, change Request Detail runtime behavior, call Google Calendar, access production, mutate records, apply migrations, change operational RLS, or enable production-sensitive flags.
