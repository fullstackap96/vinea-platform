import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const repoRoot = process.cwd()
const intakePath = resolve(
  repoRoot,
  'docs/CONTROLLED_PRODUCTION_ROLLOUT_HUMAN_INTAKE_20260714.md',
)
const source = readFileSync(intakePath, 'utf8')

const fixedIdentity = [
  'https://vineaplatform.com',
  'f134b598308ddd78b5b6b81ee447bf5b1fb15937',
  'dpl_4xKH41v7z7dHTqwQEdTjfXbhzrqG',
  'dpl_FuhBvEBrbZjNzQ6dLp4qHbi5j7UW',
  'RESTORED_TO_APPROVED_PRIOR_DEPLOYMENT',
]

const requiredFields = [
  'Product owner',
  'Engineering rollout owner',
  'Security/data owner',
  'QA owner',
  'Monitoring owner',
  'Monitoring channel',
  'Support owner',
  'Support channel',
  'Rollback owner',
  'Evidence owner',
  'Evidence storage label',
  'Safe staff account',
  'Authorized active parish A',
  'Authorized parish-switch target B',
  'Same-parish request',
  'Cross-parish or unauthorized denial request',
  'Onboarding read-only view',
  'Imports read-only history',
  'People duplicate-review page',
  'Household duplicate-review page',
  'Communications Center read-only view',
  'Rollout date',
  'Rollout start time',
  'Rollout end time',
  'Timezone',
  'Rollback observation end',
]

const confirmationFields = [
  'All owners available for rollout and observation',
  'Fixtures approved as production-safe and read-only',
  'Health and staff smoke explicitly approved for the window',
  'Monitoring and support channels open before promotion',
  'Rollback owner can restore the fixed rollback deployment',
  'Separately locked production gates remain disabled',
  'Evidence will remain label-only and redacted',
]

const forbiddenPatterns = [
  /postgres(?:ql)?:\/\//i,
  /SUPABASE_SERVICE_ROLE_KEY\s*=/i,
  /NEXT_PUBLIC_SUPABASE_ANON_KEY\s*=/i,
  /VERCEL_TOKEN\s*=/i,
  /OPENAI_API_KEY\s*=/i,
  /GOOGLE_CLIENT_SECRET\s*=/i,
  /(?:access|refresh)_token\s*=/i,
  /Bearer\s+[A-Za-z0-9._-]+/i,
  /X-Amz-Signature/i,
  /signedUrl\s*[:=]/i,
]

function readTableValue(field) {
  const escaped = field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = source.match(
    new RegExp('^\\| ' + escaped + ' \\| `([^`]+)` \\|$', 'm'),
  )

  return match?.[1]?.trim() ?? null
}

const missingStructure = [...requiredFields, ...confirmationFields].filter(
  (field) => readTableValue(field) === null,
)
const missingHumanInput = requiredFields.filter(
  (field) => readTableValue(field) === 'PENDING_HUMAN_INPUT',
)
const invalidConfirmations = confirmationFields.filter(
  (field) => readTableValue(field) !== 'YES',
)
const forbiddenContentFound = forbiddenPatterns.some((pattern) =>
  pattern.test(source),
)
const releaseIdentityMatches = fixedIdentity.every((value) =>
  source.includes(value),
)

let decision = 'READY_FOR_EXPLICIT_APPROVAL'

if (missingStructure.length > 0 || !releaseIdentityMatches) {
  decision = 'NO_GO_RELEASE_IDENTITY_MISMATCH'
} else if (forbiddenContentFound) {
  decision = 'NO_GO_FORBIDDEN_CONTENT'
} else if (missingHumanInput.length > 0) {
  decision = 'NO_GO_MISSING_HUMAN_INPUT'
} else if (invalidConfirmations.length > 0) {
  decision = 'NO_GO_INVALID_CONFIRMATION'
}

console.log(
  JSON.stringify(
    {
      schemaVersion: 1,
      decision,
      productionApproved: false,
      productionAccessed: false,
      deploymentPromoted: false,
      migrationsApplied: false,
      flagsChanged: false,
      printsValues: false,
      releaseIdentityMatches,
      requiredFieldCount: requiredFields.length,
      confirmationFieldCount: confirmationFields.length,
      missingHumanInputCount: missingHumanInput.length,
      invalidConfirmationCount: invalidConfirmations.length,
      forbiddenContentFound,
    },
    null,
    2,
  ),
)

if (missingStructure.length > 0 || forbiddenContentFound) {
  process.exitCode = 1
}
