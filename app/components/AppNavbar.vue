<script setup lang="ts">
defineProps<{ title: string }>()
</script>

<template>
  <UDashboardNavbar :title="title" :toggle="false">
    <template #leading>
      <UDashboardSidebarCollapse />
    </template>
    <template #right>
      <div class="hidden lg:contents">
        <slot name="actions" />
      </div>
    </template>
  </UDashboardNavbar>
</template>
