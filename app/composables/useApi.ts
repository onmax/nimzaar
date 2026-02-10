export function useApi() {
  const token = computed(() => {
    if (!import.meta.client) return null
    return localStorage.getItem('nimzaar_token')
  })

  function withAuthHeaders(init: HeadersInit | undefined) {
    const headers: Record<string, string> = { ...(init as any || {}) }
    if (token.value) headers.authorization = `Bearer ${token.value}`
    return headers
  }

  async function apiFetch<T>(url: string, opts: any = {}): Promise<T> {
    const headers = withAuthHeaders(opts.headers)
    // Avoid Nuxt's route type recursion for arbitrary string URLs.
    return await ($fetch as any)(url, { ...opts, headers }) as T
  }

  async function apiFetchRaw(url: string, opts: RequestInit = {}): Promise<Response> {
    const headers = withAuthHeaders(opts.headers)
    return await fetch(url, { ...opts, headers })
  }

  return { apiFetch, apiFetchRaw, token }
}
