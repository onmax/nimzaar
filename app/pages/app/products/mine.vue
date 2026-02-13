<script setup lang="ts">
import type { ProductListResponse } from '../../../../shared/contracts/products'

const { loggedIn, ready } = useUserSession()
const { apiFetch } = useApi()
const toast = useToast()

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
    const res = await apiFetch<ProductListResponse>('/api/products/mine')
    products.value = res.products
  }
  catch (e: any) {
    status.value = e?.data?.message || e?.message || String(e)
  }
  finally {
    loading.value = false
  }
}

async function deleteProduct(id: string) {
  // eslint-disable-next-line no-alert
  if (!window.confirm('Delete this product?'))
    return
  try {
    await apiFetch(`/api/products/${id}`, { method: 'DELETE' })
    products.value = products.value.filter(p => p.id !== id)
    toast.add({ title: 'Product deleted', color: 'success' })
  }
  catch (e: any) {
    toast.add({ title: e?.data?.message || e?.message || String(e), color: 'error' })
  }
}

watch([ready, loggedIn], ([isReady, isLoggedIn]) => {
  if (isReady && isLoggedIn)
    load()
}, { immediate: true })
</script>

<template>
  <UDashboardPanel id="products-mine">
    <template #header>
      <AppNavbar title="My products">
        <template #actions>
          <UButton icon="i-lucide-plus" to="/app/products/new">
            New product
          </UButton>
        </template>
      </AppNavbar>
    </template>

    <template #body>
      <div class="space-y-4">
        <UAlert
          v-if="!loggedIn"
          color="warning"
          variant="subtle"
          title="Sign in required"
          description="Viewing your products requires signing in."
          :actions="[{ label: 'Sign in', to: '/app/login', icon: 'i-lucide-log-in' }]"
        />

        <UAlert
          v-else-if="status"
          color="neutral"
          variant="subtle"
          :title="status"
        />

        <div v-if="loading" class="grid gap-4">
          <USkeleton v-for="i in 4" :key="i" class="h-20" />
        </div>

        <div v-else class="grid gap-4">
          <UCard v-for="p in products" :key="p.id">
            <template #header>
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div class="font-mono font-medium">
                  {{ p.title }}
                </div>
                <div class="flex flex-wrap gap-2 text-xs">
                  <UBadge color="neutral" variant="subtle">
                    {{ p.contentType }}
                  </UBadge>
                  <UBadge color="primary" variant="subtle">
                    {{ p.priceLuna / 1e5 }} NIM
                  </UBadge>
                </div>
              </div>
            </template>

            <div class="space-y-2">
              <p v-if="p.description" class="text-sm text-muted">
                {{ p.description }}
              </p>

              <UAlert
                v-if="p.contentType === 'pdf' && !p.contentBlobPathname"
                color="warning"
                variant="subtle"
                title="PDF not uploaded"
              />
            </div>

            <template #footer>
              <div class="flex items-center justify-end gap-2">
                <UButton
                  v-if="p.contentType === 'pdf'"
                  color="neutral"
                  variant="outline"
                  icon="i-lucide-upload"
                  :to="`/app/products/new?uploadFor=${p.id}`"
                >
                  Upload PDF
                </UButton>
                <UButton color="error" variant="ghost" icon="i-lucide-trash-2" @click="deleteProduct(p.id)" />
              </div>
            </template>
          </UCard>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
