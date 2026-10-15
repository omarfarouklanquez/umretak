import { hotelPhotos, pkgPhoto, productPhoto } from '../lib/media'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, BedDouble, Gift, Heart, Landmark, Plane, ShoppingBag, Trash2, User } from 'lucide-react'
import { db } from '../lib/db'
import { currentUser, deleteAccount, money, nextSpinAt, PRIZES, saved, spin, toggleSaved, updateUser } from '../lib/logic'
import { Art, Empty, Field, fmtDate, Modal, Price, Stars, Tabs, Toggle, useUI } from '../ui'

export function AccountPage() {
  const { openAuth, toast } = useUI()
  const nav = useNavigate()
  const u = currentUser()
  const [tab, setTab] = useState('dashboard')
  const [del, setDel] = useState(false)
  if (!u) return <div className="page narrow"><div className="card"><Empty icon={User} title="سجّل الدخول لإدارة حسابك"><button className="btn btn-primary" onClick={() => openAuth()}>تسجيل الدخول</button></Empty></div></div>
  const orders = db.list('orders').filter((o) => o.userId === u.id)
  const alerts = db.list('alerts').filter((a) => a.userId === u.id)
  const coupons = db.list('coupons').filter((c) => c.ownerId === u.id && c.usesLeft > 0)
  const save = (e) => { e.preventDefault(); updateUser(Object.fromEntries(new FormData(e.target))); toast('تم حفظ التغييرات') }

  return (
    <div className="page">
      <div className="row between wrap">
        <div><h1>أهلاً، {u.name.split(' ')[0]}</h1><div className="row gap-24 mt-8 small"><span><span className="muted">البريد </span><b className="ltr">{u.email}</b></span><span><span className="muted">مدينة الانطلاق </span><b>{u.homeCity || '—'}</b></span></div></div>
        <span className="avatar lg">{u.name[0]}</span>
      </div>
      <div className="mt-24"><Tabs tabs={[['dashboard', 'لوحتي'], ['account', 'الحساب'], ['travelers', 'المسافرون'], ['payment', 'وسائل الدفع'], ['alerts', 'التنبيهات'], ['privacy', 'الخصوصية']]} value={tab} onChange={setTab} /></div>
      <div className="mt-24">
        {tab === 'dashboard' && (
          <div className="col gap-16">
            <div className="grid g-4">
              {[['الرحلات', orders.length], ['المؤكدة', orders.filter((o) => ['confirmed', 'in_progress', 'completed'].includes(o.status)).length], ['إجمالي الإنفاق', money(orders.filter((o) => o.payment.status === 'paid' && o.status !== 'cancelled').reduce((s, o) => s + o.totals.total, 0))], ['كوبوناتي', coupons.length]].map(([l, v]) => (
                <div key={l} className="card pad"><span className="muted small">{l}</span><div className="price-big ltr">{v}</div></div>
              ))}
            </div>
            {coupons.length > 0 && <div className="card pad"><h3 className="mb-8">كوبوناتي</h3><div className="row wrap">{coupons.map((c) => <span key={c.id} className="badge orange" style={{ fontSize: 14 }}>{c.code} · {c.type === 'percent' ? c.value + '%' : money(c.value)} · حتى {fmtDate(c.expiresAt)}</span>)}</div></div>}
            <div className="card pad"><h3 className="mb-8">عمليات البحث الأخيرة</h3>{db.kv('recent', []).map((r) => <Link key={r.at} to={r.to} className="kv" style={{ color: 'var(--ink)' }}><span>{r.label}</span><span className="muted small">{r.sub}</span></Link>)}{!db.kv('recent', []).length && <p className="muted small">لا توجد عمليات بحث بعد.</p>}</div>
          </div>
        )}
        {tab === 'account' && (
          <form className="card pad grid g-2" style={{ maxWidth: 720 }} onSubmit={save}>
            <Field label="الاسم الكامل"><input name="name" className="input" defaultValue={u.name} required /></Field>
            <Field label="الجوال"><input name="phone" className="input ltr" style={{ display: 'block' }} defaultValue={u.phone} /></Field>
            <Field label="الجنسية"><input name="nationality" className="input" defaultValue={u.nationality} /></Field>
            <Field label="مدينة الانطلاق المفضلة"><input name="homeCity" className="input" defaultValue={u.homeCity} /></Field>
            <div style={{ gridColumn: '1/-1' }} className="row"><button className="btn btn-dark">حفظ</button></div>
          </form>
        )}
        {tab === 'travelers' && (
          <div className="col gap-12" style={{ maxWidth: 720 }}>
            <div className="notice">تُحفظ بيانات المسافرين تلقائياً عند الحجز لتسريع الحجوزات القادمة.</div>
            {(u.travelers || []).map((t, i) => (
              <div key={i} className="card pad row between"><div><b>{t.firstName} {t.lastName}</b><div className="small muted">جواز <span className="ltr">{t.passport || '—'}</span> · {t.nationality || '—'}</div></div>
                <button className="btn btn-ghost btn-sm" onClick={() => updateUser({ travelers: u.travelers.filter((_, j) => j !== i) })}><Trash2 size={15} />حذف</button></div>
            ))}
            {!u.travelers?.length && <div className="card"><Empty icon={User} title="لا يوجد مسافرون محفوظون" /></div>}
          </div>
        )}
        {tab === 'payment' && (
          <div className="card pad" style={{ maxWidth: 720 }}>
            <h3>وسائل الدفع المحفوظة</h3>
            <p className="muted small mt-8">في بيئة الإنتاج تُحفظ البطاقات كرموز (tokens) لدى مزود الدفع ولا تُخزَّن لدينا. هذا النموذج لا يحفظ أي بيانات بطاقات.</p>
          </div>
        )}
        {tab === 'alerts' && (
          <div className="col gap-12" style={{ maxWidth: 720 }}>
            {alerts.map((a) => (
              <div key={a.id} className="card pad row between"><div className="row"><Plane /><div><b>{a.label}</b><div className="small muted">{a.date} · آخر سعر <span className="ltr">{money(a.price)}</span></div></div></div>
                <div className="row"><Link className="btn btn-primary btn-sm" to={`/flights?from=${a.key.split('-')[0]}&to=${a.key.split('-')[1]}&date=${a.date}`}>عرض</Link><button className="btn btn-ghost btn-sm" onClick={() => db.remove('alerts', a.id)}>حذف</button></div></div>
            ))}
            {!alerts.length && <div className="card"><Empty icon={Bell} title="لا توجد تنبيهات أسعار" text="فعّل «تتبع الأسعار» من صفحة الطيران." /></div>}
            <div className="card pad row between"><span>إشعارات واتساب لحالة الحجز</span><Toggle on={u.waNotify !== false} onChange={(v) => updateUser({ waNotify: v })} label="واتساب" /></div>
            <div className="card pad row between"><span>العروض عبر البريد</span><Toggle on={!!u.promo} onChange={(v) => updateUser({ promo: v })} label="العروض" /></div>
          </div>
        )}
        {tab === 'privacy' && (
          <div className="card pad col gap-12" style={{ maxWidth: 720 }}>
            <h3>حذف الحساب</h3>
            <p className="muted small">سيتم حذف بياناتك المحفوظة ومسافريك. تبقى سجلات الحجوزات لأغراض نظامية ومحاسبية.</p>
            <button className="btn btn-outline" style={{ alignSelf: 'flex-start', color: 'var(--red)' }} onClick={() => setDel(true)}>حذف الحساب</button>
          </div>
        )}
      </div>
      {del && <Modal onClose={() => setDel(false)} title="حذف حسابك وبياناتك المحفوظة؟"><p className="muted mb-16">لا يمكن التراجع عن هذا الإجراء.</p><div className="row"><button className="btn btn-danger" onClick={() => { deleteAccount(); toast('نأسف لرحيلك — تم حذف الحساب'); nav('/') }}>حذف الحساب</button><button className="btn btn-outline" onClick={() => setDel(false)}>إلغاء</button></div></Modal>}
    </div>
  )
}

const KIND = {
  pkg: ['الباقات', 'packages', Landmark, (x) => `/umrah/${x.id}`, (x) => x.title, (x) => x.prices.quad, (x) => pkgPhoto(x, 500)],
  hotel: ['الفنادق', 'hotels', BedDouble, (x) => `/hotels/${x.id}`, (x) => x.name, (x) => x.rooms[0].price, (x) => hotelPhotos(x, 500)[0]],
  product: ['المنتجات', 'products', ShoppingBag, () => '/store', (x) => x.name, (x) => x.price, (x) => productPhoto(x, 500)],
}
export function SavedPage() {
  const list = saved()
  return (
    <div className="page">
      <h1 className="mb-16">المفضلة<span className="dot">.</span></h1>
      {!list.length && <div className="card"><Empty icon={Heart} title="لم تحفظ شيئاً بعد" text="اضغط «حفظ» على أي باقة أو فندق أو منتج لتجده هنا." /></div>}
      {Object.entries(KIND).map(([k, [label, col, Icon, href, title, price, img]]) => {
        const items = list.filter((s) => s.kind === k).map((s) => db.get(col, s.id)).filter(Boolean)
        if (!items.length) return null
        return (
          <section key={k} className="mb-16">
            <h2 className="mb-8">{label}</h2>
            <div className="grid g-4">
              {items.map((x) => (
                <div key={x.id} className="card" style={{ overflow: 'hidden' }}>
                  <Link to={href(x)}><Art src={img(x)} hue={x.hue} icon={Icon} h={130} radius={0} /></Link>
                  <div style={{ padding: 12 }} className="col gap-4"><b className="small">{title(x)}</b>{x.stars && <Stars n={x.stars} />}<span><Price sar={price(x)} /></span>
                    <button className="btn btn-link xs" style={{ alignSelf: 'flex-start' }} onClick={() => toggleSaved(k, x.id)}>إزالة</button></div>
                </div>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

const WHEEL_COLORS = ['#ff690f', '#16181a', '#b48a2c', '#0b8a4b', '#ff4f00', '#41474d', '#127c8f', '#6f767d']
export function SpinPage() {
  const { openAuth, toast } = useUI()
  const u = currentUser()
  const [rot, setRot] = useState(0)
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState(false)
  const next = nextSpinAt(u)
  const locked = next && next > new Date()
  const seg = 360 / PRIZES.length
  const go = () => {
    if (!u) return openAuth()
    try {
      const r = spin()
      setBusy(true)
      setRot((x) => x + 360 * 5 + (360 - r.idx * seg - seg / 2) - (x % 360))
      setTimeout(() => { setBusy(false); setResult(r) }, 4100)
    } catch (e) { toast(e.message) }
  }
  const grad = PRIZES.map((_, i) => `${WHEEL_COLORS[i]} ${i * seg}deg ${(i + 1) * seg}deg`).join(',')
  return (
    <div className="page narrow center">
      <h1>عجلة الحظ<span className="dot">.</span></h1>
      <p className="muted mt-8">لفّة مجانية كل 24 ساعة — اربح كوبون خصم على أي خدمة.</p>
      <div className="col mt-24" style={{ alignItems: 'center' }}>
        <div style={{ width: 0, height: 0, borderInline: '14px solid transparent', borderTop: '24px solid var(--dark)', marginBottom: -12, zIndex: 2 }} />
        <div className="wheel" style={{ background: `conic-gradient(${grad})`, transform: `rotate(${rot}deg)` }}>
          {PRIZES.map((p, i) => (
            <span key={i} style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', paddingTop: 22, transform: `rotate(${i * seg + seg / 2}deg)`, color: '#fff', fontWeight: 700, fontSize: 14 }}>{p.label}</span>
          ))}
        </div>
        <button className="btn btn-primary btn-lg mt-24" disabled={busy || locked} onClick={go}><Gift size={18} />{!u ? 'سجّل الدخول للّف' : locked ? `اللفة القادمة ${next.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}` : 'لُفّ العجلة'}</button>
      </div>
      {result && (
        <Modal onClose={() => setResult(null)} title={result.coupon ? 'مبروك! 🎉' : 'حظ أوفر'}>
          {result.coupon ? <div className="col gap-12"><p>ربحت خصم <b>{result.prize.label}</b>. استخدم الكود عند الدفع خلال 14 يوماً:</p><div className="badge orange" style={{ fontSize: 22, padding: '10px 16px', alignSelf: 'center' }}>{result.coupon.code}</div><Link to="/umrah" className="btn btn-dark">تسوّق الآن</Link></div> : <p>لم يحالفك الحظ هذه المرة — عد غداً للّفة جديدة.</p>}
        </Modal>
      )}
    </div>
  )
}
