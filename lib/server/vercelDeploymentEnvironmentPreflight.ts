import type { EnvRequirement } from './requiredEnv'

export const VERCEL_CORE_DEPLOYMENT_ENV: readonly EnvRequirement[] = [
  { oneOf: ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_URL'] },
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
]

type DeploymentEnvironment = Readonly<Record<string, string | undefined>>

function hasValue(environment: DeploymentEnvironment, name: string): boolean {
  return environment[name]?.trim() !== '' && environment[name] !== undefined
}

function requirementLabel(requirement: EnvRequirement): string {
  if (typeof requirement === 'string') return requirement
  return requirement.oneOf.join(' or ')
}

function requirementIsSet(
  environment: DeploymentEnvironment,
  requirement: EnvRequirement,
): boolean {
  if (typeof requirement === 'string') return hasValue(environment, requirement)
  return requirement.oneOf.some((name) => hasValue(environment, name))
}

export function getMissingVercelCoreDeploymentEnv(
  environment: DeploymentEnvironment,
): string[] {
  if (environment.VERCEL !== '1') return []

  return VERCEL_CORE_DEPLOYMENT_ENV
    .filter((requirement) => !requirementIsSet(environment, requirement))
    .map(requirementLabel)
}

/**
 * Prevents Vercel from publishing a READY deployment whose core staff routes
 * cannot start. Values are never read into the error; only missing names appear.
 */
export function assertVercelCoreDeploymentEnv(
  environment: DeploymentEnvironment = process.env,
): void {
  const missing = getMissingVercelCoreDeploymentEnv(environment)
  if (missing.length === 0) return

  throw new Error(
    `Vercel deployment blocked: missing required environment variable names: ${missing.join(', ')}`,
  )
}
