import { describe, expect, it } from 'vitest'

import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import {
  PRODUCTION_CSP_REPORT_ONLY_RUNTIME_PREFLIGHT_VERSION,
  validateFutureProductionCspReportOnlyRuntimeSource,
} from './productionCspReportOnlyRuntimePreflight'

const compliantFutureCspRuntimeSource = `
  const cspReportOnlyGate = getProductionCspReportOnlyRuntimeGate({
    VINEA_CSP_REPORT_ONLY_RUNTIME: 'ENABLED',
    VINEA_CSP_REPORT_ONLY_RUNTIME_ACK: 'APPROVED_CSP_REPORT_ONLY_RUNTIME',
    VINEA_CSP_REPORT_ONLY_RUNTIME_ENV: 'NON_PRODUCTION',
    blocked_production_environment: true,
  })

  if (!cspReportOnlyGate.enabled) {
    returnCspReportOnlyNoop()
  }

  cspReportOnlyGate.rollbackByRemovingReportOnlyHeader =
    'VINEA_CSP_REPORT_ONLY_RUNTIME=DISABLED'

  const approvedCspProviderAllowlist = {
    self: true,
    supabase: true,
    google: true,
  }

  const reportOnlyHeader = buildCspReportOnlyHeader({
    headerName: 'Content-Security-Policy-Report-Only',
    approvedCspProviderAllowlist,
    enforcingCspAllowed: false,
  })

  const safeCspViolationReport = sanitizeCspViolationReport(violationReport)
  assertNoForbiddenCspReportPayload(safeCspViolationReport)

  const cspReportOnlySmokeGateLabels = {
    healthSchemaTrue: true,
    staffSignInVerified: true,
    selectedParishSwitchingVerified: true,
    publicIntakeSmokeVerified: true,
    familyPortalSmokeVerified: true,
    googleOauthCallbackSmokeVerified: true,
    documentUiSmokeVerified: true,
    certificateViewSmokeVerified: true,
  }

  const boundaries = {
    customerCommunicationAllowed: false,
    publicTrustClaimAllowed: false,
    enforcingCspApproved: false,
  }

  await sendCspReportOnlyViolation({
    reportOnlyHeader,
    safeCspViolationReport,
    cspReportOnlySmokeGateLabels,
    boundaries,
  })
`

const cspPacketPath = join(
  process.cwd(),
  'docs',
  'PRODUCTION_CSP_REPORT_ONLY_APPROVAL_PACKET_20260707.md',
)

describe('production CSP report-only runtime preflight', () => {
  it('accepts future report-only source only when safety gates appear before report collection', () => {
    const result = validateFutureProductionCspReportOnlyRuntimeSource(
      compliantFutureCspRuntimeSource,
    )

    expect(result.ok).toBe(true)
    expect(result.version).toBe(
      PRODUCTION_CSP_REPORT_ONLY_RUNTIME_PREFLIGHT_VERSION,
    )
    expect(result.firstReportSendIndex).toBeGreaterThan(0)
    expect(result.forbiddenRuntimeMarkersPresent).toEqual([])
    expect(result.gates.every((gate) => gate.ok)).toBe(true)
  })

  it('fails if report collection appears before disabled and non-production gates', () => {
    const result = validateFutureProductionCspReportOnlyRuntimeSource(`
      await sendCspReportOnlyViolation(safeCspViolationReport)
      const cspReportOnlyGate = getProductionCspReportOnlyRuntimeGate()
      const env = 'NON_PRODUCTION'
      const safeCspViolationReport = sanitizeCspViolationReport(report)
    `)

    expect(result.ok).toBe(false)
    expect(result.errors.join('\n')).toContain('disabled_by_default_gate')
    expect(result.errors.join('\n')).toContain('non_production_scope_gate')
    expect(result.errors.join('\n')).toContain('report_redaction_gate')
  })

  it('rejects enforcing CSP, public claims, secrets, and sensitive payload markers', () => {
    const result = validateFutureProductionCspReportOnlyRuntimeSource(`
      ${compliantFutureCspRuntimeSource}
      headers.set('Content-Security-Policy', policy)
      const secret = process.env.SUPABASE_SERVICE_ROLE_KEY
      const signed = createSignedUrl(storagePath)
      const rawPrompt = aiPrompt
      const body = requestBody
      const trust = { publicTrustClaimAllowed: true }
    `)

    expect(result.ok).toBe(false)
    expect(result.forbiddenRuntimeMarkersPresent).toContain(
      "headers.set('Content-Security-Policy'",
    )
    expect(result.forbiddenRuntimeMarkersPresent).toContain(
      'SUPABASE_SERVICE_ROLE_KEY',
    )
    expect(result.forbiddenRuntimeMarkersPresent).toContain('createSignedUrl(')
    expect(result.forbiddenRuntimeMarkersPresent).toContain('rawPrompt')
    expect(result.forbiddenRuntimeMarkersPresent).toContain('requestBody')
    expect(result.forbiddenRuntimeMarkersPresent).toContain(
      'publicTrustClaimAllowed: true',
    )
  })

  it('fails when allowlist, smoke evidence, rollback, or customer boundaries are missing', () => {
    const result = validateFutureProductionCspReportOnlyRuntimeSource(`
      const cspReportOnlyGate = getProductionCspReportOnlyRuntimeGate()
      const ack = 'APPROVED_CSP_REPORT_ONLY_RUNTIME'
      const env = 'VINEA_CSP_REPORT_ONLY_RUNTIME_ENV NON_PRODUCTION blocked_production_environment'
      const reportOnlyHeader = buildCspReportOnlyHeader({
        headerName: 'Content-Security-Policy-Report-Only',
        enforcingCspAllowed: false,
      })
      const safeCspViolationReport = sanitizeCspViolationReport(report)
      assertNoForbiddenCspReportPayload(safeCspViolationReport)
      await sendCspReportOnlyViolation({ safeCspViolationReport, reportOnlyHeader })
    `)

    expect(result.ok).toBe(false)
    expect(result.errors.join('\n')).toContain('provider_allowlist_gate')
    expect(result.errors.join('\n')).toContain('smoke_evidence_gate')
    expect(result.errors.join('\n')).toContain('rollback_noop_gate')
    expect(result.errors.join('\n')).toContain('customer_trust_boundary_gate')
  })

  it('fails when required staff, public, family, provider, document, or certificate smoke labels are incomplete', () => {
    const result = validateFutureProductionCspReportOnlyRuntimeSource(`
      const cspReportOnlyGate = getProductionCspReportOnlyRuntimeGate({
        VINEA_CSP_REPORT_ONLY_RUNTIME: 'ENABLED',
        VINEA_CSP_REPORT_ONLY_RUNTIME_ACK: 'APPROVED_CSP_REPORT_ONLY_RUNTIME',
        VINEA_CSP_REPORT_ONLY_RUNTIME_ENV: 'NON_PRODUCTION',
        blocked_production_environment: true,
      })

      cspReportOnlyGate.rollbackByRemovingReportOnlyHeader =
        'VINEA_CSP_REPORT_ONLY_RUNTIME=DISABLED'

      const approvedCspProviderAllowlist = {
        self: true,
        supabase: true,
        google: true,
      }

      const reportOnlyHeader = buildCspReportOnlyHeader({
        headerName: 'Content-Security-Policy-Report-Only',
        approvedCspProviderAllowlist,
        enforcingCspAllowed: false,
      })

      const safeCspViolationReport = sanitizeCspViolationReport(violationReport)
      assertNoForbiddenCspReportPayload(safeCspViolationReport)

      const cspReportOnlySmokeGateLabels = {
        healthSchemaTrue: true,
        selectedParishSwitchingVerified: true,
      }

      const boundaries = {
        customerCommunicationAllowed: false,
        publicTrustClaimAllowed: false,
        enforcingCspApproved: false,
      }

      await sendCspReportOnlyViolation({
        reportOnlyHeader,
        safeCspViolationReport,
        cspReportOnlySmokeGateLabels,
        boundaries,
      })
    `)

    expect(result.ok).toBe(false)
    expect(result.errors.join('\n')).toContain('smoke_evidence_gate')
    expect(result.errors.join('\n')).toContain('staffSignInVerified')
    expect(result.errors.join('\n')).toContain('publicIntakeSmokeVerified')
    expect(result.errors.join('\n')).toContain('familyPortalSmokeVerified')
    expect(result.errors.join('\n')).toContain(
      'googleOauthCallbackSmokeVerified',
    )
    expect(result.errors.join('\n')).toContain('documentUiSmokeVerified')
    expect(result.errors.join('\n')).toContain('certificateViewSmokeVerified')
  })

  it('explains that incomplete CSP gates require all markers, not just one marker', () => {
    const result = validateFutureProductionCspReportOnlyRuntimeSource(`
      const cspReportOnlyGate = getProductionCspReportOnlyRuntimeGate()
      const header = 'Content-Security-Policy-Report-Only'
      const safeCspViolationReport = sanitizeCspViolationReport(violationReport)
      const cspReportOnlySmokeGateLabels = { healthSchemaTrue: true }
      await sendCspReportOnlyViolation({ safeCspViolationReport })
    `)

    expect(result.ok).toBe(false)
    expect(result.errors.join('\n')).toContain(
      'disabled_by_default_gate must appear before any CSP report-only send/collection. Expected all of:'
    )
    expect(result.errors.join('\n')).toContain(
      'smoke_evidence_gate must appear before any CSP report-only send/collection. Expected all of:'
    )
    expect(result.errors.join('\n')).not.toContain('Expected one of:')
  })

  it('documents the source preflight relationship in the approval packet', () => {
    const packet = readFileSync(cspPacketPath, 'utf8')

    expect(packet).toContain('Content-Security-Policy-Report-Only')
    expect(packet).toContain('report-only CSP runtime code')
    expect(packet).toContain('forbidden payload')
    expect(packet).toContain('rollback')
  })
})
