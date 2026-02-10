<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

defineProps<{
  collapsed?: boolean
}>()

const { ready, loggedIn, user, signOut } = useUserSession()

const label = computed(() => {
  if (!ready.value) return 'Loading...'
  if (!loggedIn.value) return 'Signed out'
  return user.value?.name || user.value?.address || 'Signed in'
})

async function signOutAndClearLocalToken() {
  try {
    await signOut()
  } finally {
    if (import.meta.client) {
      localStorage.removeItem('nimzaar_token')
    }
  }
}

const items = computed<DropdownMenuItem[][]>(() => ([
  [
    {
      type: 'label',
      label: label.value,
      icon: loggedIn.value ? 'i-lucide-user-check' : 'i-lucide-user-x',
    },
  ],
  loggedIn.value
    ? [
        {
          label: 'Sign out',
          icon: 'i-lucide-log-out',
          onSelect: (e: Event) => {
            e.preventDefault()
            signOutAndClearLocalToken()
          },
        },
      ]
    : [
        {
          label: 'Sign in',
          icon: 'i-lucide-log-in',
          to: '/app/login',
        },
      ],
]))
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{ content: collapsed ? 'w-56' : 'w-(--reka-dropdown-menu-trigger-width)' }"
  >
    <UButton
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-elevated"
      :label="collapsed ? undefined : label"
      :icon="loggedIn ? 'i-lucide-user-check' : 'i-lucide-user'"
      :trailing-icon="collapsed ? undefined : 'i-lucide-chevrons-up-down'"
      :ui="{ trailingIcon: 'text-dimmed' }"
    />
  </UDropdownMenu>
</template>
