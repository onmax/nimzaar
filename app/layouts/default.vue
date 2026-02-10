<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()

const open = ref(false)

function routePathToPageFile(path: string) {
  const normalized = path.replace(/\/$/, '') || '/'
  if (normalized === '/app') return '/app/index'
  if (normalized === '/app/products') return '/app/products/index'
  return normalized
}

const primaryLinks = computed<NavigationMenuItem[]>(() => ([
  {
    label: 'Home',
    icon: 'i-lucide-house',
    to: '/app',
    onSelect: () => {
      open.value = false
    },
  },
  {
    label: 'Products',
    icon: 'i-lucide-store',
    to: '/app/products',
    onSelect: () => {
      open.value = false
    },
  },
  {
    label: 'New product',
    icon: 'i-lucide-plus',
    to: '/app/products/new',
    onSelect: () => {
      open.value = false
    },
  },
  {
    label: 'My products',
    icon: 'i-lucide-package',
    to: '/app/products/mine',
    onSelect: () => {
      open.value = false
    },
  },
  {
    label: 'Library',
    icon: 'i-lucide-library',
    to: '/app/library',
    onSelect: () => {
      open.value = false
    },
  },
]))

const secondaryLinks = computed<NavigationMenuItem[]>(() => ([
  {
    label: 'Source',
    icon: 'i-lucide-github',
    to: 'https://github.com/onmax/nimzaar',
    target: '_blank',
  },
]))

const groups = computed(() => ([
  {
    id: 'pages',
    label: 'Pages',
    items: [...primaryLinks.value, ...secondaryLinks.value].map(item => ({
      id: String(item.to),
      label: item.label,
      icon: item.icon,
      to: item.to,
      target: item.target,
    })),
  },
  {
    id: 'code',
    label: 'Code',
    items: [
      {
        id: 'view-source',
        label: 'View page source',
        icon: 'i-lucide-file-code',
        to: `https://github.com/onmax/nimzaar/blob/main/app/pages${routePathToPageFile(route.path)}.vue`,
        target: '_blank',
      },
    ],
  },
]))
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >
      <template #header="{ collapsed }">
        <UButton
          to="/app"
          icon="i-lucide-store"
          color="neutral"
          variant="ghost"
          :label="collapsed ? undefined : 'Nimzaar'"
          :square="collapsed"
          class="data-[state=open]:bg-elevated"
        />
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton :collapsed="collapsed" class="bg-transparent ring-default" />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="primaryLinks"
          orientation="vertical"
          tooltip
          popover
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="secondaryLinks"
          orientation="vertical"
          tooltip
          class="mt-auto"
        />
      </template>

      <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <UDashboardSearch :groups="groups" />

    <slot />
  </UDashboardGroup>
</template>
