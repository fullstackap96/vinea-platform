/**
 * Server-only environment validation. Reports missing variable names only — never values.
 */

export type EnvRequirement =
  | string
  | { readonly oneOf: readonly string[] }

export function isEnvSet(name: string): boolean {
  const raw = process.env[name]
  if (raw === undefined) return false
  return raw.trim() !== ''
}

function isRequirementMet(requirement: EnvRequirement): boolean {
  if (typeof requirement === 'string') return isEnvSet(requirement)
  return requirement.oneOf.some((name) => isEnvSet(name))
}

/** Primary name shown when a one-of group is unset (first listed variable). */
function requirementLabel(requirement: EnvRequirement): string {
  if (typeof requirement === 'string') return requirement
  return requirement.oneOf[0] ?? 'unknown'
}

/** Returns exact env var names that are missing (no secret values). */
export function getMissingRequiredEnv(
  requirements: readonly EnvRequirement[]
): string[] {
  const missing: string[] = []
  for (const requirement of requirements) {
    if (!isRequirementMet(requirement)) {
      missing.push(requirementLabel(requirement))
    }
  }
  return missing
}

export class MissingRequiredEnvError extends Error {
  readonly missing: readonly string[]

  constructor(missing: string[]) {
    const message =
      missing.length === 1
        ? `Missing required environment variable: ${missing[0]}`
        : `Missing required environment variables: ${missing.join(', ')}`
    super(message)
    this.name = 'MissingRequiredEnvError'
    this.missing = missing
  }
}

export function assertRequiredEnv(requirements: readonly EnvRequirement[]): void {
  const missing = getMissingRequiredEnv(requirements)
  if (missing.length > 0) {
    throw new MissingRequiredEnvError(missing)
  }
}

/** Env required by `app/api/parish/settings` (session + service-role Supabase). */
export const PARISH_SETTINGS_REQUIRED_ENV: readonly EnvRequirement[] = [
  { oneOf: ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_URL'] },
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
]

export function assertParishSettingsEnv(): void {
  assertRequiredEnv(PARISH_SETTINGS_REQUIRED_ENV)
}

/** Env required by `lib/supabaseServiceServer` (`createSupabaseServiceRoleClient`). */
export const SUPABASE_SERVICE_ROLE_REQUIRED_ENV: readonly EnvRequirement[] = [
  { oneOf: ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_URL'] },
  'SUPABASE_SERVICE_ROLE_KEY',
]

export function assertSupabaseServiceRoleEnv(): void {
  assertRequiredEnv(SUPABASE_SERVICE_ROLE_REQUIRED_ENV)
}
