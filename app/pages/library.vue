<script setup lang="ts">
import type { LibraryResponse } from '../../shared/contracts/library'

const { loggedIn, ready } = useUserSession()
const { apiFetch, apiFetchRaw } = useApi()

const products = ref<any[]>([])
const status = ref('')
const loading = ref(false)

async function load() {
  if (!loggedIn.value) {
    status.value = 'Sign in first'
    return
  }
  loading.value = true
  try {
    const res = await apiFetch<LibraryResponse>('/api/library')
    products.value = res.products
  } catch (e: any) {
    status.value = e?.data?.message || e?.message || String(e)
  } finally {
    loading.value = false
  }
}

watch([ready, loggedIn], ([isReady, isLoggedIn]) => {
  if (isReady && isLoggedIn) load()
}, { immediate: true })

async function openContent(productId: string) {
  if (!loggedIn.value) return
  status.value = 'Fetching content...'
  try {
    const res = await apiFetchRaw(`/api/products/${productId}/content`)
    const ct = res.headers.get('content-type') || ''
    if (ct.includes('application/json')) {
      const json = await res.json()
      if (json.type === 'link') {
        window.open(json.url, '_blank')
        status.value = 'Opened link'
      } else {
        status.value = 'Unexpected JSON response'
      }
      return
    }

    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    status.value = 'Opened PDF'
  } catch (e: any) {
    status.value = e?.message || String(e)
  }
}
</script>

<template>
  <UDashboardPanel id="library">
    <template #header>
      <UDashboardNavbar title="Library">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="space-y-4">
        <UAlert
          v-if="!loggedIn"
          color="warning"
          variant="subtle"
          title="Sign in required"
          description="Accessing your library requires signing in."
          :actions="[{ label: 'Sign in', to: '/login', icon: 'i-lucide-log-in' }]"
        />

        <UAlert
          v-else-if="status"
          color="neutral"
          variant="subtle"
          :title="status"
        />

        <div v-if="loading" class="grid gap-4">
          <USkeleton v-for="i in 4" :key="i" class="h-20 rounded-lg" />
        </div>

        <div v-else class="grid gap-4">
          <UCard v-for="p in products" :key="p.id">
            <template #header>
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div class="font-medium">{{ p.title }}</div>
                <UBadge color="neutral" variant="subtle" class="text-xs">
                  {{ p.contentType }}
                </UBadge>
              </div>
            </template>

            <template #footer>
              <div class="flex items-center justify-end">
                <UButton
                  color="neutral"
                  variant="outline"
                  icon="i-lucide-external-link"
                  @click="openContent(p.id)"
                >
                  Open
                </UButton>
              </div>
            </template>
          </UCard>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
