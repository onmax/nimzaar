<script setup lang="ts">
import type { ProductCreateResponse } from '../../../../shared/contracts/products'

const route = useRoute()
const { loggedIn } = useUserSession()
const { apiFetch } = useApi()

const title = ref('')
const description = ref('')
const priceLuna = ref(100000)
const contentType = ref<'link' | 'pdf'>('link')
const linkUrl = ref('')
const payoutAddress = ref('')

const status = ref('')
const loading = ref(false)

const createdProductId = ref<string | null>(null)
const uploadEndpoint = ref<string | null>(null)
const file = ref<File | null>(null)

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  file.value = input.files?.[0] || null
}

async function fetchAddress() {
  if (!window.nimiq) return
  const res = await window.nimiq.listAccounts()
  if (Array.isArray(res) && res[0]) payoutAddress.value = res[0]
}

onMounted(() => {
  if (!payoutAddress.value) fetchAddress()
  const uploadFor = route.query.uploadFor
  if (typeof uploadFor === 'string') {
    createdProductId.value = uploadFor
    uploadEndpoint.value = `/api/products/${uploadFor}/asset`
    contentType.value = 'pdf'
  }
})

async function createProduct() {
  if (!loggedIn.value) {
    status.value = 'Sign in first'
    return
  }
  loading.value = true
  status.value = 'Creating...'
  try {
    const res = await apiFetch<ProductCreateResponse>('/api/products', {
      method: 'POST',
      body: {
        title: title.value,
        description: description.value || undefined,
        priceLuna: Number(priceLuna.value),
        contentType: contentType.value,
        linkUrl: contentType.value === 'link' ? linkUrl.value : undefined,
        payoutAddress: payoutAddress.value || undefined,
      },
    })

    if ('product' in (res as any)) {
      createdProductId.value = (res as any).product.id
      uploadEndpoint.value = null
      status.value = 'Created'
    } else {
      createdProductId.value = (res as any).productId
      uploadEndpoint.value = (res as any).uploadEndpoint
      status.value = 'Created. Upload PDF next.'
    }
  } catch (e: any) {
    status.value = e?.data?.message || e?.message || String(e)
  } finally {
    loading.value = false
  }
}

async function uploadPdf() {
  if (!loggedIn.value) {
    status.value = 'Sign in first'
    return
  }
  if (!uploadEndpoint.value) {
    status.value = 'No upload endpoint'
    return
  }
  if (!file.value) {
    status.value = 'Pick a PDF first'
    return
  }

  loading.value = true
  status.value = 'Uploading...'
  try {
    const form = new FormData()
    form.set('file', file.value)
    await apiFetch(uploadEndpoint.value, { method: 'POST', body: form })
    status.value = 'Uploaded'
  } catch (e: any) {
    status.value = e?.data?.message || e?.message || String(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UDashboardPanel id="products-new">
    <template #header>
      <AppNavbar title="New product" />
    </template>

    <template #body>
      <div class="space-y-4">
        <UAlert
          v-if="status"
          color="neutral"
          variant="subtle"
          :title="status"
        />

        <UCard>
          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField label="Title" required>
              <UInput v-model="title" placeholder="My awesome product" />
            </UFormField>

            <UFormField label="Price (luna)" required>
              <UInputNumber v-model="priceLuna" :min="1" />
            </UFormField>

            <UFormField label="Payout address">
              <UInput v-model="payoutAddress" placeholder="NQ..." />
              <template #help>
                <UButton
                  color="neutral"
                  variant="link"
                  size="xs"
                  icon="i-lucide-wallet"
                  :disabled="loading"
                  @click="fetchAddress"
                >
                  Use my Nimiq Pay address
                </UButton>
              </template>
            </UFormField>

            <UFormField label="Content type" required>
              <USelect
                v-model="contentType"
                :items="[
                  { label: 'Link', value: 'link' },
                  { label: 'PDF', value: 'pdf' }
                ]"
              />
            </UFormField>

            <UFormField v-if="contentType === 'link'" class="sm:col-span-2" label="Link URL" required>
              <UInput v-model="linkUrl" placeholder="https://..." />
            </UFormField>

            <UFormField class="sm:col-span-2" label="Description">
              <UTextarea v-model="description" :rows="4" placeholder="Optional" />
            </UFormField>
          </div>

          <div class="mt-6 flex flex-wrap items-center gap-3">
            <UButton
              icon="i-lucide-plus"
              :loading="loading"
              :disabled="loading"
              @click="createProduct"
            >
              Create
            </UButton>

            <UBadge v-if="createdProductId" color="neutral" variant="subtle" class="font-mono text-xs">
              {{ createdProductId }}
            </UBadge>

          <UAlert
            v-if="!loggedIn"
            class="flex-1"
            color="warning"
            variant="subtle"
            title="Sign in required"
            description="Creating products requires signing in."
            :actions="[{ label: 'Sign in', to: '/app/login', icon: 'i-lucide-log-in' }]"
          />
          </div>
        </UCard>

        <UCard v-if="uploadEndpoint">
          <template #header>
            <div class="font-mono font-medium">Upload PDF</div>
          </template>

          <div class="space-y-3">
            <input type="file" accept="application/pdf" @change="onFileChange" />

            <UButton
              color="neutral"
              variant="outline"
              icon="i-lucide-upload"
              :loading="loading"
              :disabled="loading"
              @click="uploadPdf"
            >
              Upload
            </UButton>
          </div>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>
