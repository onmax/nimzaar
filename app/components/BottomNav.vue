<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const route = useRoute()
const { ready, loggedIn, user, signOut } = useUserSession()

const userLabel = computed(() => {
  if (!ready.value) return 'Loading...'
  if (!loggedIn.value) return 'Signed out'
  return user.value?.name || user.value?.address || 'Signed in'
})

async function signOutAndClearLocalToken() {
  try { await signOut() }
  finally { if (import.meta.client) localStorage.removeItem('nimzaar_token') }
}

const userItems = computed<DropdownMenuItem[][]>(() => ([
  [{ type: 'label', label: userLabel.value, icon: loggedIn.value ? 'i-lucide-user-check' : 'i-lucide-user-x' }],
  [
    { label: 'My Products', icon: 'i-lucide-package', to: '/app/products/mine' },
    { label: 'Source', icon: 'i-lucide-github', to: 'https://github.com/onmax/nimzaar', target: '_blank' },
  ],
  loggedIn.value
    ? [{ label: 'Sign out', icon: 'i-lucide-log-out', onSelect: (e: Event) => { e.preventDefault(); signOutAndClearLocalToken() } }]
    : [{ label: 'Sign in', icon: 'i-lucide-log-in', to: '/app/login' }],
]))

function isActive(path: string, exact = false) {
  if (exact) return route.path === path
  return route.path.startsWith(path)
}

const nuxtApp = useNuxtApp()
function toggleSearch() {
  nuxtApp.hooks.callHook('dashboard:search:toggle')
}

const navItems = [
  { label: 'Search', icon: 'i-lucide-search', action: 'search' as const },
  { label: 'Products', icon: 'i-lucide-store', to: '/app/products', exact: true },
  { label: 'New', icon: 'i-lucide-plus', to: '/app/products/new', cta: true },
  { label: 'Library', icon: 'i-lucide-library', to: '/app/library' },
]
</script>

<template>
  <nav class="fixed bottom-0 inset-x-0 z-50 bg-elevated border-t border-default lg:hidden pb-[env(safe-area-inset-bottom)]">
    <div class="flex items-stretch justify-around">
      <template v-for="item in navItems" :key="item.label">
        <button
          v-if="'action' in item"
          class="flex flex-col items-center justify-center gap-0.5 flex-1 py-2 border-t-2 border-transparent text-muted transition-colors cursor-pointer"
          @click="toggleSearch"
        >
          <UIcon :name="item.icon" class="size-5" />
          <span class="text-xs font-mono">{{ item.label }}</span>
        </button>
        <NuxtLink
          v-else
          :to="item.to"
          class="flex flex-col items-center justify-center gap-0.5 flex-1 py-2 border-t-2 transition-colors"
          :class="[
            item.cta
              ? 'border-transparent'
              : isActive(item.to, item.exact)
                ? 'border-primary text-primary'
                : 'border-transparent text-muted',
          ]"
        >
          <div v-if="item.cta" class="bg-primary text-inverted size-8 flex items-center justify-center">
            <UIcon :name="item.icon" class="size-5" />
          </div>
          <UIcon v-else :name="item.icon" class="size-5" />
          <span class="text-xs font-mono">{{ item.label }}</span>
        </NuxtLink>
      </template>

      <UDropdownMenu
        :items="userItems"
        :content="{ side: 'top', align: 'end', collisionPadding: 12 }"
        :ui="{ content: 'w-56' }"
      >
        <button
          class="flex flex-col items-center justify-center gap-0.5 flex-1 py-2 border-t-2 transition-colors cursor-pointer"
          :class="isActive('/app/products/mine') ? 'border-primary text-primary' : 'border-transparent text-muted'"
        >
          <UIcon :name="loggedIn ? 'i-lucide-user-check' : 'i-lucide-user'" class="size-5" />
          <span class="text-xs font-mono">User</span>
        </button>
      </UDropdownMenu>
    </div>
  </nav>
</template>
