<script setup lang="ts">
const { client, loggedIn, fetchSession } = useUserSession()

const isInNimiqPay = computed(() => import.meta.client && !!window.nimiq)
const address = ref<string | null>(null)
const status = ref('')
const loading = ref(false)

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
  status.value = 'Signing in...'
  try {
    await (client as any).signInNimiqPay({
      appName: 'Nimzaar',
      address: address.value || undefined,
    })

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
      <AppNavbar title="Sign in" />
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
