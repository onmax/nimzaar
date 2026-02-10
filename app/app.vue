<script setup lang="ts">
const { fetchSession } = useUserSession()

onMounted(async () => {
  await fetchSession()
})
</script>

<template>
  <UApp>
    <NuxtLoadingIndicator />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
