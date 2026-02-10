<script setup lang="ts">
const { client, loggedIn, fetchSession } = useUserSession()

const isInNimiqPay = computed(() => import.meta.client && !!window.nimiq)
const address = ref<string | null>(null)
const status = ref('')
const loading = ref(false)

function buildSignInMessage(params: { origin: string, nonce: string }) {
  return `Sign in to Nimzaar\nOrigin: ${params.origin}\nNonce: ${params.nonce}`
}

async function fetchAddress() {
  if (!window.nimiq) {
    status.value = 'Open this inside Nimiq Pay'
    return
  }

  loading.value = true
  status.value = 'Requesting address...'
  try {
    const res = await window.nimiq.listAccounts()
    if (Array.isArray(res) && res[0]) {
      address.value = res[0]
      status.value = 'Address loaded'
    } else {
      status.value = 'Address request failed'
    }
  } catch (e: any) {
    status.value = e?.message || String(e)
  } finally {
    loading.value = false
  }
}

async function signIn() {
  if (!window.nimiq) {
    status.value = 'Open this inside Nimiq Pay'
    return
  }
  if (!client) {
    status.value = 'Auth client not available (must run on client)'
    return
  }

  loading.value = true
  status.value = 'Creating nonce...'
  try {
    const nonceRes = await client.$fetch<{ nonceId: string, nonce: string }>('/nimiq/nonce', { method: 'POST' })
    if ((nonceRes as any)?.error) throw (nonceRes as any).error
    const nonce = (nonceRes as any).data ?? nonceRes

    const message = buildSignInMessage({ origin: window.location.origin, nonce: nonce.nonce })

    status.value = 'Signing...'
    const sig = await window.nimiq.sign(message)
    if ('error' in (sig as any)) {
      throw new Error((sig as any).error?.message || 'Signing failed')
    }

    status.value = 'Verifying...'
    const verifyRes = await client.$fetch('/nimiq/verify', {
      method: 'POST',
      body: {
        nonceId: nonce.nonceId,
        publicKeyHex: (sig as any).publicKey,
        signatureHex: (sig as any).signature,
        address: address.value || undefined,
      },
    })
    if ((verifyRes as any)?.error) throw (verifyRes as any).error

    await fetchSession({ force: true })
    status.value = 'Signed in'
  } catch (e: any) {
    status.value = e?.data?.message || e?.message || String(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UDashboardPanel id="login">
    <template #header>
      <UDashboardNavbar title="Sign in">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="space-y-4">
        <UAlert
          v-if="!isInNimiqPay"
          color="warning"
          variant="subtle"
          title="Open in Nimiq Pay"
          description="window.nimiq not detected. This app must be opened inside Nimiq Pay to sign in."
        />

        <UAlert
          v-else-if="loggedIn"
          color="success"
          variant="subtle"
          title="Already signed in"
          description="You can continue browsing products or open your library."
        />

        <UCard>
          <div class="flex flex-col gap-3">
            <div class="flex flex-wrap items-center gap-3">
              <UButton
                color="neutral"
                variant="outline"
                icon="i-lucide-wallet"
                :loading="loading"
                :disabled="loading || !isInNimiqPay"
                @click="fetchAddress"
              >
                Get Address
              </UButton>

              <UButton
                icon="i-lucide-log-in"
                :loading="loading"
                :disabled="loading || !isInNimiqPay"
                @click="signIn"
              >
                Sign In With Nimiq
              </UButton>
            </div>

            <div v-if="address" class="text-sm">
              <div class="text-muted">Address</div>
              <div class="font-mono text-xs break-all">{{ address }}</div>
            </div>

            <UAlert
              v-if="status"
              color="neutral"
              variant="subtle"
              :title="status"
            />
          </div>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>

