import { describe, expect, it } from 'vitest'
import {
  createLocalAuthFetcher,
  createStubNimiqProvider,
  defineE2EProfile,
  runSignInScenario,
} from '@onmax/better-auth-nimiq-pay-e2e'

const appName = 'Nimzaar'
const origin = 'https://nimzaar.test'

function createLocalProfile() {
  return defineE2EProfile({
    env: {},
    mode: 'local',
    appName,
    endpointPrefix: '/nimiq',
    nuxtMiniappUrl: origin,
    nuxtAuthBaseUrl: `${origin}/api/auth`,
  })
}

describe('nimiq sign-in e2e', () => {
  it('runs local-first shared sign-in scenario', async () => {
    const result = await runSignInScenario({
      profile: createLocalProfile(),
      origin,
    })

    expect(result.ok, result.error).toBe(true)
    expect(result.mode).toBe('local')
    expect(result.token).toBe('local-token-1')
  })

  it('supports explicit local provider + local fetcher wiring', async () => {
    const profile = createLocalProfile()
    const provider = createStubNimiqProvider()
    const fetcher = createLocalAuthFetcher({
      appName,
      origin,
      endpointPrefix: profile.endpointPrefix,
    })

    const result = await runSignInScenario({
      profile,
      provider,
      fetcher,
      origin,
      requestAddressBeforeVerify: false,
    })

    expect(result.ok, result.error).toBe(true)
    expect(result.mode).toBe('local')
    expect(result.token).toBe('local-token-1')
  })
})
