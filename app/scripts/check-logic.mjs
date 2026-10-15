// Run: node scripts/check-logic.mjs — asserts core business rules.
import assert from 'node:assert/strict'
const store = {}
globalThis.localStorage = { getItem: (k) => store[k] ?? null, setItem: (k, v) => (store[k] = String(v)), removeItem: (k) => delete store[k] }
const L = await import('../src/lib/logic.js')
const { db } = await import('../src/lib/db.js')
L.ensureSeed(true)

const p = db.get('packages', 'p1'), dep = p.departures.find((d) => d.seatsLeft >= 2)
const item = L.packageItem(p, dep, 'double', 2)
let t = L.totals([item], 'WELCOME10')
assert.equal(t.subtotal, p.prices.double * 2)
assert.equal(t.discount, Math.round(t.subtotal * 0.1))
assert.equal(t.vat, 0) // no hotel line → no added hotel taxes

const h = db.get('hotels', 'h1')
t = L.totals([L.hotelItem(h, h.rooms[0], L.addDays(L.today(), 40), 2, 1)])
assert.equal(t.vat, Math.round(h.rooms[0].price * 2 * 0.15))
assert.equal(t.municipality, Math.round(h.rooms[0].price * 2 * 0.05))

const before = dep.seatsLeft
const o = L.placeOrder({ userId: 'u-demo', items: [item], travelers: [{}, {}], contact: {}, payment: { method: 'card' } })
assert.equal(o.status, 'confirmed')
assert.equal(db.get('packages', 'p1').departures.find((d) => d.id === dep.id).seatsLeft, before - 2)
const q = L.refundQuote(o, 'death')
assert.equal(q.refund, o.totals.total)
L.cancelOrder(o.id, 'change')
assert.equal(db.get('packages', 'p1').departures.find((d) => d.id === dep.id).seatsLeft, before)
assert.equal(L.validateCoupon('STORE15', [item]).ok, false) // store-only coupon
console.log('logic checks passed')
