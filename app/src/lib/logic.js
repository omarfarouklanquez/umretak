// Domain logic: pricing, cart, coupons, orders, refunds, auth, support.
// UI never touches storage rules directly — it calls these functions.
import { db, emit, now, uid } from './db.js'
import * as S from './seed.js'

const DAY = 864e5
export const today = () => new Date(new Date().toISOString().slice(0, 10))
export const daysUntil = (date) => Math.round((new Date(date) - today()) / DAY)
export const addDays = (date, n) => new Date(new Date(date).getTime() + n * DAY).toISOString().slice(0, 10)

// demo-only hash — production uses bcrypt/argon2 on the server
const hash = (s) => [...s].reduce((h, c) => (h * 33) ^ c.charCodeAt(0), 5381).toString(36)

/* ------------------------------------------------------------------ seed */
export function ensureSeed(force = false) {
  if (!force && db.kv('seeded')) return
  db.wipe()
  db.setKv('settings', S.SETTINGS)
  db.setAll('packages', [...S.PACKAGES, ...S.HAJJ])
  db.setAll('hotels', S.HOTELS)
  db.setAll('visas', S.VISAS)
  db.setAll('vehicles', S.VEHICLES)
  db.setAll('routes', S.ROUTES)
  db.setAll('trainFares', S.TRAIN_FARES)
  db.setAll('tours', S.TOURS)
  db.setAll('products', S.PRODUCTS)
  db.setAll('posts', S.POSTS)
  db.setAll('faq', S.FAQ)
  db.setAll('jobs', S.JOBS)
  db.setAll('coupons', S.COUPONS)
  db.setAll('reviews', S.REVIEWS)
  db.setAll('webhooks', S.WEBHOOKS)
  db.setAll('users', S.USERS.map(({ pass, ...u }) => ({ ...u, passHash: hash(pass), createdAt: now(), travelers: [], cards: [] })))
  ;['orders', 'tickets', 'leads', 'applications', 'events', 'alerts'].forEach((c) => db.setAll(c, []))
  seedDemoActivity()
  db.setKv('seeded', true)
}

function seedDemoActivity() {
  const p = db.get('packages', 'p3')
  const h = db.get('hotels', 'h11')
  const traveler = { firstName: 'سامي', lastName: 'أحمد', passport: 'A12345678', nationality: 'مصر', dob: '1990-02-18', gender: 'male' }
  const contact = { name: 'سامي أحمد', email: 'user@umretak.test', phone: '+966500000002' }
  const o1 = placeOrder({
    userId: 'u-demo',
    items: [packageItem(p, p.departures[1], 'double', 2)],
    travelers: [traveler, { ...traveler, firstName: 'منى', gender: 'female', passport: 'A87654321' }],
    contact, payment: { method: 'card', last4: '4242' },
  })
  setStatus(o1.id, 'in_progress', 'جاري إصدار التأشيرات', 'admin')
  placeOrder({
    userId: 'u-demo',
    items: [hotelItem(h, h.rooms[0], addDays(today(), 40), 4, 1), visaItem(db.get('visas', 'v5'), 1)],
    travelers: [traveler], contact, payment: { method: 'bank' },
  })
  const o3 = placeOrder({ userId: 'u-demo', items: [productItem(db.get('products', 'pr4'), {}, 3)], travelers: [traveler], contact, payment: { method: 'mada', last4: '1111' } })
  setStatus(o3.id, 'completed', 'تم التسليم لفندق العميل', 'admin')
  createTicket({ userId: 'u-demo', name: contact.name, email: contact.email, phone: contact.phone, type: 'inquiry', subject: 'هل يمكن تغيير نوع الغرفة؟', body: 'أرغب في تغيير الغرفة من ثنائية إلى ثلاثية في حجز العمرة.', orderRef: o1.number })
  db.insert('reviews', { name: 'زائر جديد', kind: 'hotel', rating: 3, text: 'الفندق جيد لكن الإفطار يحتاج تحسين.', status: 'pending' })
  db.insert('leads', { kind: 'hajj-waitlist', status: 'new', payload: { name: 'خالد سعيد', phone: '+966511111111', season: '1448هـ', scope: 'domestic', people: 2 } })
}

/* -------------------------------------------------------------- settings */
export const settings = () => db.kv('settings', S.SETTINGS)
export const currency = () => db.kv('currency', 'SAR')
export const setCurrency = (c) => db.setKv('currency', c)
const CUR_LABEL = { SAR: 'ر.س', EGP: 'ج.م', USD: '$', EUR: '€' }
export function money(sar, cur = currency()) {
  const v = (sar || 0) * (settings().rates[cur] || 1)
  return `${Math.round(v).toLocaleString('en-US')} ${CUR_LABEL[cur] || cur}`
}

/* ------------------------------------------------------------------ auth */
export const currentUser = () => { const id = db.kv('session'); return id ? db.get('users', id) : null }
export function login(email, pass) {
  const u = db.list('users').find((x) => x.email.toLowerCase() === email.trim().toLowerCase())
  if (!u || u.passHash !== hash(pass)) throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة')
  db.setKv('session', u.id)
  mergeGuestSaved(u.id)
  return u
}
export const userExists = (email) => db.list('users').some((x) => x.email.toLowerCase() === email.trim().toLowerCase())
export function register({ name, email, pass, phone = '' }) {
  if (userExists(email)) throw new Error('هذا البريد مسجّل بالفعل')
  if ((pass || '').length < 6) throw new Error('كلمة المرور 6 أحرف على الأقل')
  const u = db.insert('users', { name, email: email.trim(), phone, role: 'customer', passHash: hash(pass), travelers: [], cards: [] })
  db.setKv('session', u.id)
  mergeGuestSaved(u.id)
  emit('user.registered', { id: u.id, email: u.email })
  return u
}
export const logout = () => db.setKv('session', null)
export const updateUser = (patch) => { const u = currentUser(); return u && db.update('users', u.id, patch) }
export function deleteAccount() { const u = currentUser(); if (!u) return; db.remove('users', u.id); logout() }

/* ----------------------------------------------------- saved / compare */
const savedKey = () => 'saved:' + (db.kv('session') || 'guest')
export const saved = () => db.kv(savedKey(), [])
export const isSaved = (kind, id) => saved().some((s) => s.kind === kind && s.id === id)
export function toggleSaved(kind, id) {
  const list = saved()
  db.setKv(savedKey(), isSaved(kind, id) ? list.filter((s) => !(s.kind === kind && s.id === id)) : [{ kind, id, at: now() }, ...list])
  return isSaved(kind, id)
}
function mergeGuestSaved(userId) {
  const g = db.kv('saved:guest', [])
  if (!g.length) return
  const mine = db.kv('saved:' + userId, [])
  db.setKv('saved:' + userId, [...g.filter((x) => !mine.some((m) => m.kind === x.kind && m.id === x.id)), ...mine])
  db.setKv('saved:guest', [])
}
export const compareList = () => db.kv('compare', [])
export function toggleCompare(id) {
  const l = compareList()
  if (l.includes(id)) return db.setKv('compare', l.filter((x) => x !== id))
  if (l.length >= 3) throw new Error('يمكنك مقارنة 3 باقات كحد أقصى')
  db.setKv('compare', [...l, id])
}
export function pushRecent(search) {
  const l = db.kv('recent', []).filter((r) => r.label !== search.label)
  db.setKv('recent', [{ ...search, at: now() }, ...l].slice(0, 6))
}

/* --------------------------------------------------------------- pricing */
export const KINDS = {
  umrah: 'برنامج عمرة', hajj: 'برنامج حج', hotel: 'فندق', flight: 'طيران', visa: 'تأشيرة',
  transport: 'نقل خاص', train: 'قطار الحرمين', tour: 'جولة', product: 'منتج', insurance: 'تأمين السفر',
}
export const needsPassport = (items) => items.some((i) => ['umrah', 'hajj', 'flight', 'visa'].includes(i.kind))
export const travelersNeeded = (items) => Math.max(1, ...items.filter((i) => !['product', 'transport', 'insurance', 'hotel'].includes(i.kind)).map((i) => i.qty))
export const ROOM_LABEL = { quad: 'رباعية', triple: 'ثلاثية', double: 'ثنائية' }
export const TIER_LABEL = { economy: 'اقتصادي', premium: 'مميز', luxury: 'فاخر' }

export const packageItem = (p, dep, room, travelers) => ({
  kind: p.kind, refId: p.id, title: p.title, unitPrice: p.prices[room], qty: travelers,
  date: dep?.date, meta: { departureId: dep?.id, returnDate: dep?.returnDate, room, code: p.code },
  subtitle: `${ROOM_LABEL[room]} · ${travelers} مسافر${dep ? ' · ' + dep.date : ''}`,
})
export const hotelItem = (h, room, checkIn, nights, rooms) => ({
  kind: 'hotel', refId: h.id, title: h.name, unitPrice: room.price * nights, qty: rooms, date: checkIn,
  meta: { room: room.type, nights, checkOut: addDays(checkIn, nights) },
  subtitle: `${room.label} · ${nights} ليالٍ · ${rooms} غرفة · ${checkIn}`,
})
export const visaItem = (v, people) => ({ kind: 'visa', refId: v.id, title: v.title, unitPrice: v.fee, qty: people, meta: { country: v.country }, subtitle: `${people} متقدم · إصدار خلال ${v.processingDays} يوم` })
export const productItem = (p, opts, qty) => ({
  kind: 'product', refId: p.id, title: p.name, unitPrice: p.price, qty, meta: { opts },
  subtitle: Object.values(opts || {}).filter(Boolean).join(' · ') || 'منتج',
})
export const tourItem = (t, date, people) => ({ kind: 'tour', refId: t.id, title: t.title, unitPrice: t.price, qty: people, date, meta: {}, subtitle: `${people} أشخاص · ${date}` })
export const vehiclePrice = (v, route) => Math.round(v.base * route.factor)
export const transportItem = (v, route, date, time) => ({
  kind: 'transport', refId: v.id, title: `${v.name}: ${route.from} ← ${route.to}`.replace('←', '→'), unitPrice: vehiclePrice(v, route), qty: 1, date,
  meta: { routeId: route.id, time }, subtitle: `${date} · ${time} · حتى ${v.passengers} ركاب`,
})
export const trainItem = (fare, cls, date, time, pax) => ({
  kind: 'train', refId: fare.id, title: `قطار الحرمين: ${fare.from} → ${fare.to}`, unitPrice: fare[cls], qty: pax, date,
  meta: { cls, time }, subtitle: `${cls === 'business' ? 'درجة الأعمال' : 'الدرجة الاقتصادية'} · ${date} ${time} · ${pax} راكب`,
})
export const flightItem = (f, pax) => ({
  kind: 'flight', refId: f.id, title: `${f.airline}: ${f.from} → ${f.to}`, unitPrice: f.price, qty: pax, date: f.date,
  meta: { ...f }, subtitle: `${f.date} · ${f.dep}–${f.arr} · ${f.stops ? f.stops + ' توقف' : 'مباشر'} · ${pax} مسافر`,
})

/* -------------------------------------------------- flights "provider" */
// Simulates a GDS/NDC supplier (Amadeus, Duffel…): deterministic results per query.
export const AIRPORTS = [
  ['CAI', 'القاهرة'], ['HBE', 'الإسكندرية (برج العرب)'], ['RUH', 'الرياض'], ['DMM', 'الدمام'], ['DXB', 'دبي'],
  ['IST', 'إسطنبول'], ['AMM', 'عمّان'], ['KHI', 'كراتشي'], ['CGK', 'جاكرتا'], ['JED', 'جدة'], ['MED', 'المدينة المنورة'],
]
export const airportName = (c) => (AIRPORTS.find((a) => a[0] === c) || [c, c])[1]
const AIR = [['السعودية', 'SV'], ['مصر للطيران', 'MS'], ['طيران ناس', 'XY'], ['طيران أديل', 'F3'], ['فلاي دبي', 'FZ'], ['التركية', 'TK']]
export function searchFlights({ from, to, date, cabin = 'economy' }) {
  if (!from || !to || from === to || !date) return []
  const seed = [...(from + to + date)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 100003, 7)
  const rnd = (n) => ((seed * (n + 3) * 9301 + 49297) % 233280) / 233280
  const dist = Math.abs(from.charCodeAt(0) - to.charCodeAt(0)) * 40 + 600
  return Array.from({ length: 8 }, (_, i) => {
    const [airline, code] = AIR[Math.floor(rnd(i) * AIR.length)]
    const depMin = 300 + Math.floor(rnd(i + 20) * 1000)
    const stops = rnd(i + 40) > 0.7 ? 1 : 0
    const dur = Math.round(dist / 9) + stops * 110 + Math.floor(rnd(i + 60) * 40)
    const fmt = (m) => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
    const base = Math.round((dist * 0.55 + rnd(i + 80) * 500 - stops * 120) / 5) * 5
    return {
      id: `${code}${100 + Math.floor(rnd(i + 90) * 800)}-${date}-${from}${to}`,
      airline, code, from, to, date, cabin, stops, mins: dur,
      dep: fmt(depMin), arr: fmt(depMin + dur), bag: rnd(i + 99) > 0.4 ? 23 : 0,
      price: cabin === 'business' ? base * 3 : base, seatsLeft: 1 + Math.floor(rnd(i + 120) * 9),
    }
  })
}

/* ---------------------------------------------------------------- cart */
export const cart = () => db.kv('cart', [])
const itemKey = (i) => [i.kind, i.refId, i.date, JSON.stringify(i.meta)].join('|')
export function addToCart(item) {
  const key = itemKey(item)
  const list = cart()
  const ex = list.find((x) => x.key === key)
  db.setKv('cart', ex ? list.map((x) => (x.key === key ? { ...x, qty: x.qty + item.qty } : x)) : [...list, { ...item, key }])
}
export const setQty = (key, qty) => db.setKv('cart', cart().map((x) => (x.key === key ? { ...x, qty: Math.max(1, qty) } : x)))
export const removeFromCart = (key) => db.setKv('cart', cart().filter((x) => x.key !== key))
export const clearCart = () => db.setKv('cart', [])

/* ------------------------------------------------------------- coupons */
export function validateCoupon(code, items) {
  if (!code) return { ok: false }
  const c = db.list('coupons').find((x) => x.code.toUpperCase() === code.trim().toUpperCase())
  const u = currentUser()
  if (!c || !c.active) return { ok: false, msg: 'الكوبون غير صالح' }
  if (c.ownerId && c.ownerId !== u?.id) return { ok: false, msg: 'هذا الكوبون خاص بحساب آخر' }
  if (new Date(c.expiresAt) < today()) return { ok: false, msg: 'انتهت صلاحية الكوبون' }
  if (c.usesLeft <= 0) return { ok: false, msg: 'نفدت مرات استخدام الكوبون' }
  const eligible = items.filter((i) => !c.kinds.length || c.kinds.includes(i.kind))
  const base = eligible.reduce((s, i) => s + i.unitPrice * i.qty, 0)
  if (!eligible.length) return { ok: false, msg: 'الكوبون لا ينطبق على عناصر السلة' }
  if (base < c.minTotal) return { ok: false, msg: `الحد الأدنى للاستخدام ${money(c.minTotal)}` }
  const discount = Math.min(base, c.type === 'percent' ? Math.round((base * c.value) / 100) : c.value)
  return { ok: true, coupon: c, discount, eligibleKinds: c.kinds }
}

export function totals(items, couponCode) {
  const st = settings()
  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.qty, 0)
  const cv = validateCoupon(couponCode, items)
  const discount = cv.ok ? cv.discount : 0
  const hotelSub = items.filter((i) => i.kind === 'hotel').reduce((s, i) => s + i.unitPrice * i.qty, 0)
  const eligibleBase = items.filter((i) => cv.ok && (!cv.eligibleKinds.length || cv.eligibleKinds.includes(i.kind))).reduce((s, i) => s + i.unitPrice * i.qty, 0)
  const hotelDisc = cv.ok && eligibleBase && (!cv.eligibleKinds.length || cv.eligibleKinds.includes('hotel')) ? (discount * hotelSub) / eligibleBase : 0
  const hotelNet = Math.max(0, hotelSub - hotelDisc)
  const vat = Math.round(hotelNet * st.vat)
  const municipality = Math.round(hotelNet * st.municipality)
  const total = subtotal - discount + vat + municipality
  const vatIncluded = Math.round(((total - hotelNet - vat - municipality) * st.vat) / (1 + st.vat))
  return { subtotal, discount, coupon: cv.ok ? cv.coupon.code : null, couponMsg: cv.msg, vat, municipality, vatIncluded, total }
}

/* -------------------------------------------------------------- orders */
export const ORDER_STATUS = {
  pending_payment: ['بانتظار الدفع', 'amber'],
  confirmed: ['مؤكد', 'green'],
  in_progress: ['قيد التنفيذ', 'blue'],
  completed: ['مكتمل', 'dark'],
  cancelled: ['ملغي', 'red'],
}
const nextNumber = () => {
  const n = db.kv('orderSeq', 10240) + 1
  db.setKv('orderSeq', n)
  return `UM-${new Date().getFullYear()}-${n}`
}
export const orderTravelDate = (o) => o.items.map((i) => i.date).filter(Boolean).sort()[0] || null

function reserve(order, sign) {
  for (const it of order.items) {
    if (it.kind === 'umrah' && it.meta.departureId) {
      db.update('packages', it.refId, (p) => ({ departures: p.departures.map((d) => (d.id === it.meta.departureId ? { ...d, seatsLeft: Math.max(0, d.seatsLeft - sign * it.qty) } : d)) }))
    }
    if (it.kind === 'product') db.update('products', it.refId, (p) => ({ stock: Math.max(0, p.stock - sign * it.qty) }))
  }
}

export function checkAvailability(items) {
  for (const it of items) {
    if (it.kind === 'umrah' && it.meta.departureId) {
      const dep = db.get('packages', it.refId)?.departures.find((d) => d.id === it.meta.departureId)
      if (!dep || dep.seatsLeft < it.qty) return `لا توجد مقاعد كافية في «${it.title}»`
    }
    if (it.kind === 'product') {
      const p = db.get('products', it.refId)
      if (!p || p.stock < it.qty) return `الكمية غير متوفرة من «${it.title}»`
    }
  }
  return null
}

export function placeOrder({ userId, items, couponCode, travelers, contact, payment }) {
  if (!items.length) throw new Error('السلة فارغة')
  const err = checkAvailability(items)
  if (err) throw new Error(err)
  const t = totals(items, couponCode)
  const paid = ['card', 'mada', 'applepay'].includes(payment.method)
  const order = db.insert('orders', {
    number: nextNumber(), userId: userId ?? currentUser()?.id ?? null, items, travelers, contact,
    payment: { ...payment, status: paid ? 'paid' : 'unpaid', paidAt: paid ? now() : null, dueBy: paid ? null : new Date(Date.now() + DAY).toISOString() },
    totals: t, status: paid ? 'confirmed' : 'pending_payment',
    timeline: [{ at: now(), status: 'created', note: 'تم إنشاء الطلب', by: 'customer' }, ...(paid ? [{ at: now(), status: 'confirmed', note: 'تم الدفع وتأكيد الحجز', by: 'system' }] : [])],
  })
  if (t.coupon) {
    const c = db.list('coupons').find((x) => x.code === t.coupon)
    db.update('coupons', c.id, { usesLeft: c.usesLeft - 1 })
  }
  if (paid) reserve(order, 1)
  emit(paid ? 'order.confirmed' : 'order.created', { number: order.number, total: t.total })
  return order
}

export function markPaid(id, by = 'customer') {
  const o = db.get('orders', id)
  if (o.status !== 'pending_payment') return o
  const err = checkAvailability(o.items)
  if (err) throw new Error(err)
  reserve(o, 1)
  emit('order.confirmed', { number: o.number })
  return db.update('orders', id, (x) => ({ status: 'confirmed', payment: { ...x.payment, status: 'paid', paidAt: now() }, timeline: [...x.timeline, { at: now(), status: 'confirmed', note: 'تم استلام الدفعة', by }] }))
}

export function setStatus(id, status, note = '', by = 'admin') {
  const o = db.get('orders', id)
  if (status === 'cancelled') return cancelOrder(id, 'platform', by)
  emit('order.' + status, { number: o.number })
  return db.update('orders', id, (x) => ({ status, timeline: [...x.timeline, { at: now(), status, note: note || ORDER_STATUS[status][0], by }] }))
}

export const CANCEL_REASONS = {
  change: 'تغيير الخطط',
  medical: 'ظرف صحي يمنع السفر (تقرير طبي)',
  death: 'وفاة أحد المسافرين أو ذويه',
  visa_rejected: 'رفض التأشيرة',
  platform: 'إلغاء من جانب المنصة',
}
export function refundQuote(order, reason = 'change') {
  const paid = order.payment.status === 'paid' ? order.totals.total : 0
  const days = orderTravelDate(order) ? daysUntil(orderTravelDate(order)) : 999
  const tier = settings().refundTiers.find((t) => days >= t.minDays)
  let rate = tier.rate
  let note = tier.label
  const visaFees = order.items.filter((i) => i.kind === 'visa').reduce((s, i) => s + i.unitPrice * i.qty, 0)
  if (reason === 'death' || reason === 'platform') { rate = 1; note = 'استرداد كامل 100%' }
  if (reason === 'medical') { rate = Math.max(rate, 0.9); note = 'استرداد حتى 90% مع تقرير طبي' }
  if (reason === 'visa_rejected') return { days, rate: 1, note: 'استرداد كامل عدا رسوم التأشيرة الحكومية', refund: Math.max(0, paid - visaFees), paid }
  return { days, rate, note, refund: Math.round(paid * rate), paid }
}
export function cancelOrder(id, reason = 'change', by = 'customer') {
  const o = db.get('orders', id)
  if (o.status === 'cancelled' || o.status === 'completed') throw new Error('لا يمكن إلغاء هذا الطلب')
  const q = refundQuote(o, reason)
  if (o.status !== 'pending_payment') reserve(o, -1)
  emit('order.cancelled', { number: o.number, refund: q.refund })
  return db.update('orders', id, (x) => ({
    status: 'cancelled', refund: { ...q, reason, status: q.refund ? 'processing' : 'none' },
    timeline: [...x.timeline, { at: now(), status: 'cancelled', note: `${CANCEL_REASONS[reason]} — الاسترداد ${money(q.refund)}`, by }],
  }))
}

/* ---------------------------------------------------- support & leads */
export const TICKET_TYPES = { complaint: 'شكوى', suggestion: 'اقتراح', inquiry: 'استفسار', praise: 'إشادة وتقدير' }
export const TICKET_STATUS = { open: ['مفتوحة', 'amber'], answered: ['تم الرد', 'blue'], closed: ['مغلقة', 'dark'] }
export function createTicket(t) {
  const n = db.kv('ticketSeq', 500) + 1
  db.setKv('ticketSeq', n)
  const r = db.insert('tickets', { ...t, userId: t.userId ?? currentUser()?.id ?? null, number: 'TK-' + n, status: 'open', replies: [] })
  emit('ticket.created', { number: r.number, type: t.type })
  return r
}
export function replyTicket(id, text, by) {
  return db.update('tickets', id, (t) => ({ status: by === 'admin' ? 'answered' : 'open', replies: [...t.replies, { at: now(), by, text }] }))
}
export function createLead(kind, payload) {
  const r = db.insert('leads', { kind, payload, status: 'new', userId: currentUser()?.id ?? null })
  emit('lead.created', { kind })
  return r
}

/* ------------------------------------------------------------ spin wheel */
export const PRIZES = [
  { label: '5%', type: 'percent', value: 5 }, { label: '50 ر.س', type: 'fixed', value: 50 },
  { label: '10%', type: 'percent', value: 10 }, { label: 'حظ أوفر', type: null },
  { label: '100 ر.س', type: 'fixed', value: 100 }, { label: '15%', type: 'percent', value: 15 },
  { label: '7%', type: 'percent', value: 7 }, { label: 'حظ أوفر', type: null },
]
export function nextSpinAt(u = currentUser()) { return u?.lastSpin ? new Date(new Date(u.lastSpin).getTime() + DAY) : null }
export function spin() {
  const u = currentUser()
  if (!u) throw new Error('سجّل الدخول أولاً')
  const next = nextSpinAt(u)
  if (next && next > new Date()) throw new Error('يمكنك اللف مرة كل 24 ساعة')
  const idx = Math.floor(Math.random() * PRIZES.length)
  const p = PRIZES[idx]
  db.update('users', u.id, { lastSpin: now() })
  let coupon = null
  if (p.type) {
    coupon = db.insert('coupons', { code: 'SPIN' + uid().slice(-5).toUpperCase(), type: p.type, value: p.value, minTotal: 0, kinds: [], usesLeft: 1, expiresAt: addDays(today(), 14), active: true, ownerId: u.id })
  }
  return { idx, prize: p, coupon }
}

/* --------------------------------------------------------------- admin */
export function kpis() {
  const orders = db.list('orders')
  const live = orders.filter((o) => o.status !== 'cancelled')
  const paid = live.filter((o) => o.payment.status === 'paid')
  return {
    revenue: paid.reduce((s, o) => s + o.totals.total, 0),
    orders: orders.length,
    pending: orders.filter((o) => o.status === 'pending_payment').length,
    avg: paid.length ? paid.reduce((s, o) => s + o.totals.total, 0) / paid.length : 0,
    openTickets: db.list('tickets').filter((t) => t.status !== 'closed').length,
    pendingReviews: db.list('reviews').filter((r) => r.status === 'pending').length,
    newLeads: db.list('leads').filter((l) => l.status === 'new').length,
    byKind: Object.keys(KINDS).map((k) => ({ k, v: paid.flatMap((o) => o.items).filter((i) => i.kind === k).reduce((s, i) => s + i.unitPrice * i.qty, 0) })),
  }
}
