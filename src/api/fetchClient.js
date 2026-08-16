// Single shared fetch wrapper — every API module goes through this so the
// backend base URL lives in exactly one place. Never call fetch() directly
// against a backend or third-party URL from a component.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000'

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const err = new Error(body.error ?? `Request failed: ${res.status} ${res.statusText}`)
    err.status = res.status
    throw err
  }

  return res.json()
}

export default apiFetch
