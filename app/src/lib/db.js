// Persistence adapter. Every read/write in the app goes through `db`.
// To go live, replace this object with an HTTP adapter exposing the same
// methods (list/get/insert/update/remove/kv) — no UI changes needed.
const P = 'umretak:'
const listeners = new Set()
let version = 0

const read = (k, fallback) => {
  try { const v = localStorage.getItem(P + k); return v == null ? fallback : JSON.parse(v) } catch { return fallback }
}
const write = (k, v) => {
  try { localStorage.setItem(P + k, JSON.stringify(v)) } catch (e) { console.error('storage full?', e) }
  version++
  listeners.forEach((l) => l())
}

export const uid = (p = '') => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
export const now = () => new Date().toISOString()

export const db = {
  list: (c) => read(c, []),
  get: (c, id) => read(c, []).find((r) => r.id === id),
  find: (c, fn) => read(c, []).filter(fn),
  setAll: (c, rows) => write(c, rows),
  insert(c, row) {
    const r = { id: uid(), createdAt: now(), ...row }
    write(c, [r, ...read(c, [])])
    return r
  },
  update(c, id, patch) {
    let out
    write(c, read(c, []).map((r) => (r.id === id ? (out = { ...r, ...(typeof patch === 'function' ? patch(r) : patch), updatedAt: now() }) : r)))
    return out
  },
  remove(c, id) { write(c, read(c, []).filter((r) => r.id !== id)) },
  kv: (k, fallback) => read('kv:' + k, fallback),
  setKv: (k, v) => write('kv:' + k, v),
  subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn) },
  version: () => version,
  wipe() { Object.keys(localStorage).filter((k) => k.startsWith(P)).forEach((k) => localStorage.removeItem(k)) },
}

// Integration outbox: every domain event lands here. A real backend would
// fan these out to webhooks / email / SMS / accounting / CRM subscribers.
export function emit(type, payload) {
  const hooks = db.list('webhooks').filter((w) => w.active && (w.events.includes('*') || w.events.includes(type)))
  db.insert('events', { type, payload, deliveredTo: hooks.map((h) => h.url) })
}
