/** Values that turn on demo mode; everything else is off (including unset, "", "0", "false"). */
const DEMO_SITE_ENABLED = new Set(['1', 'true'])

/**
 * Demo mode is on only when `NEXT_PUBLIC_DEMO_SITE` is exactly `"1"` or `"true"`.
 * Any other value — unset, empty string, `"0"`, `"false"`, etc. — is treated as off.
 */
export function isDemoSite(): boolean {
  const value = process.env.NEXT_PUBLIC_DEMO_SITE
  return typeof value === 'string' && DEMO_SITE_ENABLED.has(value)
}