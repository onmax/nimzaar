<script setup lang="ts">
const { ready, loggedIn } = useUserSession()
const isInNimiqPay = computed(() => import.meta.client && !!window.nimiq)
</script>

<template>
  <UDashboardPanel id="home">
    <template #header>
      <AppNavbar title="Nimzaar">
        <template #actions>
          <UButton color="neutral" variant="outline" icon="i-lucide-store" to="/app/products">Browse products</UButton>
          <UButton icon="i-lucide-plus" to="/app/products/new">New product</UButton>
        </template>
      </AppNavbar>
    </template>

    <template #body>
      <div class="space-y-4">
        <UAlert
          v-if="!isInNimiqPay"
          color="warning"
          variant="subtle"
          title="Open in Nimiq Pay"
          description="window.nimiq not detected. Some actions (sign-in, payments, address) require Nimiq Pay."
        />

        <UAlert
          v-else-if="ready && !loggedIn"
          color="info"
          variant="subtle"
          title="Sign in to buy or sell"
          description="You can browse products without signing in, but buying/selling requires a signature in Nimiq Pay."
          :actions="[{ label: 'Sign in', to: '/app/login', icon: 'i-lucide-log-in' }]"
        />

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-store" class="size-5 text-primary" />
                <div class="font-mono font-medium">Products</div>
              </div>
            </template>
            <p class="text-sm text-muted">Browse and buy digital goods.</p>
            <template #footer>
              <UButton to="/app/products" icon="i-lucide-arrow-right">Open</UButton>
            </template>
          </UCard>

          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-library" class="size-5 text-primary" />
                <div class="font-mono font-medium">Library</div>
              </div>
            </template>
            <p class="text-sm text-muted">Open purchased links and PDFs.</p>
            <template #footer>
              <UButton color="neutral" variant="outline" to="/app/library" icon="i-lucide-arrow-right">Open</UButton>
            </template>
          </UCard>

          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-plus" class="size-5 text-primary" />
                <div class="font-mono font-medium">Sell</div>
              </div>
            </template>
            <p class="text-sm text-muted">Create a new product and get paid in NIM.</p>
            <template #footer>
              <UButton to="/app/products/new" icon="i-lucide-arrow-right">Create</UButton>
            </template>
          </UCard>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
