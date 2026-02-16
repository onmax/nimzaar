import process from 'node:process'
import { describe, expect, it } from 'vitest'
import { runSignInScenario } from '@onmax/better-auth-nimiq-pay-e2e'

const enabled = process.env.NIMIQ_PAY_E2E_ENABLED === '1'

describe.skipIf(!enabled)('nimiq sign-in e2e', () => {
  it('runs the shared sign-in scenario', async () => {
    const result = await runSignInScenario()
    expect(result.ok).toBe(true)
  })
})
