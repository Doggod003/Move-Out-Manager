const STORAGE_KEY = 'moveout-os-v1'

export function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

let saveTimer = null
export function persistStore(store) {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)) } catch {}
  }, 250)
}

export function clearStore() {
  try { localStorage.removeItem(STORAGE_KEY) } catch {}
}
