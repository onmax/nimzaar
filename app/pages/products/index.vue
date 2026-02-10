<script setup lang="ts">
import type { ProductListResponse } from '../../../shared/contracts/products'
import type { OrderCreateResponse } from '../../../shared/contracts/orders'

const { loggedIn } = useUserSession()
const { apiFetch } = useApi()

const products = ref<any[]>([])
const status = ref<string>('')
const loading = ref(false)

async function load() {
  loading.value = true
  try {
    const res = await apiFetch<ProductListResponse>('/api/products')
    products.value = res.products
  } finally {
    loading.value = false
  }
}

onMounted(load)

async function buy(productId: string) {
  if (!loggedIn.value) {
    status.value = 'Sign in first'
    return
  }
  if (!window.nimiq) {
    status.value = 'Open inside Nimiq Pay (window.nimiq missing)'
    return
  }
  loading.value = true
  status.value = 'Creating order...'
  try {
    const order = await apiFetch<OrderCreateResponse>('/api/orders', { method: 'POST', body: { productId } })
    status.value = 'Requesting payment...'
    const txHash = await window.nimiq.sendBasicTransactionWithData({
      recipient: order.recipient,
      value: order.value,
      data: order.data,
    })
    if (typeof txHash !== 'string') {
      throw new Error((txHash as any).error?.message || 'Payment failed')
    }

    status.value = 'Confirming...'
    await apiFetch(`/api/orders/${order.orderId}/confirm`, { method: 'POST', body: { txHash } })
    status.value = 'Paid. Added to library.'
  } catch (e: any) {
    status.value = e?.data?.message || e?.message || String(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UDashboardPanel id="products">
    <template #header>
      <UDashboardNavbar title="Products" :ui="{ right: 'gap-2' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton icon="i-lucide-plus" to="/products/new">
            New product
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="space-y-4">
        <UAlert
          v-if="status"
          color="neutral"
          variant="subtle"
          :title="status"
        />

        <div v-if="loading" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <USkeleton v-for="i in 6" :key="i" class="h-40 rounded-lg" />
        </div>

        <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <UCard v-for="p in products" :key="p.id">
            <template #header>
              <div class="font-medium">{{ p.title }}</div>
            </template>

            <div class="space-y-2">
              <p v-if="p.description" class="text-sm text-muted">
                {{ p.description }}
              </p>

              <div class="flex flex-wrap gap-2 text-xs">
                <UBadge color="neutral" variant="subtle">
                  {{ p.contentType }}
                </UBadge>
                <UBadge color="primary" variant="subtle">
                  {{ p.priceLuna }} luna
                </UBadge>
              </div>
            </div>

            <template #footer>
              <div class="flex items-center justify-between gap-3">
                <UButton
                  :disabled="loading"
                  :color="loggedIn ? 'primary' : 'neutral'"
                  :variant="loggedIn ? 'solid' : 'outline'"
                  icon="i-lucide-shopping-cart"
                  @click="buy(p.id)"
                >
                  Buy
                </UButton>
              </div>
            </template>
          </UCard>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
