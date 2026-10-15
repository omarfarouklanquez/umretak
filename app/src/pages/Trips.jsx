import { photo } from '../lib/media'
const TRIP_SET = { umrah: 'makkah', hajj: 'makkah', hotel: 'room', flight: 'plane', visa: 'passport', transport: 'car', train: 'train', tour: 'desert', product: 'dates' }
const tripPhoto = (o) => photo(TRIP_SET[o.items[0].kind] || 'makkah', o.number.charCodeAt(o.number.length - 1), 400)
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Briefcase, CalendarPlus, ChevronRight, CreditCard, LifeBuoy, Printer, Search, Share2, Star, XCircle } from 'lucide-react'
import { db } from '../lib/db'
import { CANCEL_REASONS, cancelOrder, createTicket, currentUser, KINDS, markPaid, money, orderTravelDate, refundQuote } from '../lib/logic'
import { Art, Empty, Field, fmtDate, fmtTime, Modal, StatusBadge, Tabs, useUI } from '../ui'

const myOrders = () => {
  const u = currentUser()
  const guest = db.kv('guestOrders', [])
  return db.list('orders').filter((o) => (u && o.userId === u.id) || guest.includes(o.id))
}

export function TripsPage() {
  const nav = useNavigate()
  const { openAuth, toast } = useUI()
  const [tab, setTab] = useState('upcoming')
  const [find, setFind] = useState(false)
  const [num, setNum] = useState('')
  const [last, setLast] = useState('')
  const [err, setErr] = useState('')
  const all = myOrders()
  const past = (o) => o.status === 'cancelled' || o.status === 'completed' || (orderTravelDate(o) && new Date(orderTravelDate(o)) < new Date())
  const list = all.filter((o) => (tab === 'past' ? past(o) : !past(o)))

  const lookup = (e) => {
    e.preventDefault()
    const o = db.list('orders').find((x) => x.number.toUpperCase() === num.trim().toUpperCase() && x.travelers.some((t) => t.lastName.trim() === last.trim()))
    if (!o) return setErr('لم نجد حجزاً بهذه البيانات. تأكد من رقم الحجز واسم العائلة كما في الجواز.')
    db.setKv('guestOrders', [...new Set([...db.kv('guestOrders', []), o.id])])
    toast('تم العثور على الحجز')
    nav(`/trips/${o.id}`)
  }

  return (
    <div className="page">
      <div className="row between wrap">
        <h1>رحلاتي<span className="dot">.</span></h1>
        <div className="row"><button className="btn btn-outline" onClick={() => setFind(!find)}><Search size={16} />ابحث عن حجز</button><Link className="btn btn-outline" to="/builder">+ رحلة جديدة</Link></div>
      </div>
      {find && (
        <form className="card pad mt-16 col gap-12" onSubmit={lookup}>
          <b>ابحث عن حجز (للزوار أو الحجوزات من جهاز آخر)</b>
          <div className="row wrap">
            <input className="input" style={{ maxWidth: 260 }} placeholder="رقم الحجز UM-2026-…" value={num} onChange={(e) => setNum(e.target.value)} aria-label="رقم الحجز" />
            <input className="input" style={{ maxWidth: 220 }} placeholder="اسم العائلة" value={last} onChange={(e) => setLast(e.target.value)} aria-label="اسم العائلة" />
            <button className="btn btn-dark">بحث</button>
          </div>
          {err && <div className="notice bad">{err}</div>}
        </form>
      )}
      {!currentUser() && <div className="notice mt-16"><span><button className="btn-link btn" onClick={() => openAuth()}>سجّل الدخول</button> لرؤية كل حجوزاتك في مكان واحد.</span></div>}
      <div className="mt-16"><Tabs tabs={[['upcoming', `القادمة (${all.filter((o) => !past(o)).length})`], ['past', 'السابقة']]} value={tab} onChange={setTab} /></div>
      <div className="col gap-12 mt-16">
        {!list.length && <div className="card"><Empty icon={Briefcase} title={tab === 'past' ? 'لا توجد رحلات سابقة' : 'لا توجد رحلات قادمة'} text="ابدأ التخطيط لعمرتك الآن."><Link className="btn btn-dark" to="/umrah">تصفح البرامج</Link></Empty></div>}
        {list.map((o) => (
          <Link key={o.id} to={`/trips/${o.id}`} className="card hover row gap-16" style={{ padding: 12, color: 'var(--ink)', textDecoration: 'none' }}>
            <Art src={tripPhoto(o)} hue={(o.number.charCodeAt(o.number.length - 1) * 23) % 360} icon={Briefcase} h={90} style={{ width: 130, flexShrink: 0 }} />
            <div className="col gap-4 grow">
              <div className="row wrap"><b>{o.items[0].title}{o.items.length > 1 ? ` + ${o.items.length - 1}` : ''}</b><StatusBadge status={o.status} /></div>
              <span className="small muted">{o.number} · {orderTravelDate(o) ? 'السفر ' + fmtDate(orderTravelDate(o)) : 'بدون تاريخ سفر'}</span>
              <div className="row wrap">{[...new Set(o.items.map((i) => i.kind))].map((k) => <span key={k} className="badge xs">{KINDS[k]}</span>)}</div>
            </div>
            <b className="ltr">{money(o.totals.total)}</b>
          </Link>
        ))}
      </div>
    </div>
  )
}

export function TripDetail() {
  const { id } = useParams()
  const { toast } = useUI()
  const nav = useNavigate()
  const o = db.get('orders', id)
  const [cancel, setCancel] = useState(false)
  const [reason, setReason] = useState('change')
  const [ack, setAck] = useState(false)
  const [help, setHelp] = useState(false)
  if (!o) return <div className="page"><Empty icon={Briefcase} title="الحجز غير موجود" /></div>
  const q = refundQuote(o, reason)
  const byDate = Object.entries(o.items.reduce((m, i) => { (m[i.date || 'بدون تاريخ'] ||= []).push(i); return m }, {})).sort(([a], [b]) => a.localeCompare(b))
  const canCancel = !['cancelled', 'completed'].includes(o.status)

  const ics = () => {
    const ev = o.items.filter((i) => i.date).map((i) => `BEGIN:VEVENT\nUID:${o.id}-${i.refId}\nDTSTART;VALUE=DATE:${i.date.replaceAll('-', '')}\nSUMMARY:${i.title}\nDESCRIPTION:${o.number}\nEND:VEVENT`).join('\n')
    const url = URL.createObjectURL(new Blob([`BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//umretak//AR\n${ev}\nEND:VCALENDAR`], { type: 'text/calendar' }))
    Object.assign(document.createElement('a'), { href: url, download: `${o.number}.ics` }).click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="page">
      <Link to="/trips" className="small row no-print"><ChevronRight size={16} />رحلاتي</Link>
      <div className="row between wrap mt-8">
        <div><h1 style={{ fontSize: 28 }}>رحلة {o.number}</h1><div className="row mt-8"><StatusBadge status={o.status} /><span className="small muted">أُنشئ {fmtDate(o.createdAt)}</span></div></div>
        <div className="row wrap no-print">
          <button className="btn btn-outline btn-sm" onClick={() => { navigator.clipboard?.writeText(location.href); toast('تم نسخ رابط الرحلة') }}><Share2 size={15} />مشاركة</button>
          <button className="btn btn-outline btn-sm" onClick={ics}><CalendarPlus size={15} />أضف للتقويم</button>
          <button className="btn btn-outline btn-sm" onClick={() => window.print()}><Printer size={15} />طباعة الإيصال</button>
        </div>
      </div>
      {o.status === 'pending_payment' && (
        <div className="notice warn mt-16 row between wrap no-print" style={{ alignItems: 'center' }}>
          <span>بانتظار الدفع — تنتهي المهلة {fmtTime(o.payment.dueBy)}</span>
          <button className="btn btn-primary btn-sm" onClick={() => { try { markPaid(o.id); toast('تم الدفع وتأكيد الحجز') } catch (e) { toast(e.message) } }}><CreditCard size={15} />ادفع الآن {money(o.totals.total)}</button>
        </div>
      )}
      {o.refund && <div className="notice mt-16">الاسترداد: <b className="ltr">{money(o.refund.refund)}</b> ({Math.round(o.refund.rate * 100)}%) — {o.refund.status === 'processing' ? 'قيد المعالجة خلال 7-14 يوم عمل' : 'لا يوجد مبلغ مسترد'}</div>}

      <div className="checkout mt-24">
        <div className="col gap-16">
          <div className="card pad">
            <h3 className="mb-16">خط سير الرحلة</h3>
            {byDate.map(([d, its]) => (
              <div key={d} className="mb-16">
                <b>{d === 'بدون تاريخ' ? d : fmtDate(d, { weekday: 'long', day: 'numeric', month: 'long' })}</b>
                <div className="col gap-8 mt-8">
                  {its.map((i, k) => (
                    <div key={k} className="card pad-s row between" style={{ background: 'var(--surface-2)' }}>
                      <div><span className="badge xs">{KINDS[i.kind]}</span><div className="semi mt-8">{i.title}</div><div className="xs muted">{i.subtitle}</div></div>
                      <span className={'badge ' + (o.status === 'cancelled' ? 'red' : 'green')}>{o.status === 'cancelled' ? 'ملغي' : 'محجوز'}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="card pad">
            <h3 className="mb-16">المسافرون</h3>
            <div className="table-wrap"><table className="table"><thead><tr><th>الاسم</th><th>الجواز</th><th>الجنسية</th></tr></thead>
              <tbody>{o.travelers.map((t, i) => <tr key={i}><td>{t.firstName} {t.lastName}</td><td className="ltr">{t.passport || '—'}</td><td>{t.nationality || '—'}</td></tr>)}</tbody></table></div>
          </div>
          <div className="card pad">
            <h3 className="mb-16">سجل الطلب</h3>
            <div className="timeline">{o.timeline.map((t, i) => <div key={i} className="tl-item"><b className="small">{t.note}</b><div className="xs muted">{fmtTime(t.at)} · {t.by === 'admin' ? 'فريق العمليات' : t.by === 'system' ? 'النظام' : 'أنت'}</div></div>)}</div>
          </div>
        </div>
        <aside className="summary col gap-12">
          <div className="card pad col gap-4">
            <h3 className="mb-8">ملخص الدفع</h3>
            <div className="kv small"><span>المجموع الفرعي</span><span className="ltr">{money(o.totals.subtotal)}</span></div>
            {o.totals.discount > 0 && <div className="kv small"><span>خصم {o.totals.coupon}</span><span className="ltr">-{money(o.totals.discount)}</span></div>}
            {o.totals.vat > 0 && <div className="kv small"><span>ضرائب الفنادق</span><span className="ltr">{money(o.totals.vat + o.totals.municipality)}</span></div>}
            <div className="kv total"><span>الإجمالي</span><span className="ltr">{money(o.totals.total)}</span></div>
            <span className="xs muted">{{ card: 'بطاقة', mada: 'مدى', applepay: 'Apple Pay', bank: 'تحويل بنكي', later: 'دفع لاحق' }[o.payment.method]}{o.payment.last4 ? ` •••• ${o.payment.last4}` : ''} · {o.payment.status === 'paid' ? 'مدفوع' : 'غير مدفوع'}</span>
          </div>
          <div className="card pad col gap-8 no-print">
            <h3>خيارات</h3>
            <button className="btn btn-outline btn-block" onClick={() => setHelp(true)}><LifeBuoy size={16} />طلب مساعدة أو تعديل</button>
            {o.status === 'completed' && <button className="btn btn-outline btn-block" onClick={() => nav(`/reviews?order=${o.id}`)}><Star size={16} />قيّم تجربتك</button>}
            {canCancel && <button className="btn btn-ghost btn-block" style={{ color: 'var(--red)' }} onClick={() => { setAck(false); setCancel(true) }}><XCircle size={16} />إلغاء الحجز</button>}
          </div>
        </aside>
      </div>
      <div className="print-only mt-24 small">هذا الإيصال صادر إلكترونياً من منصة عمرتك — {o.contact.email}</div>

      {cancel && (
        <Modal onClose={() => setCancel(false)} title="شروط الإلغاء والاسترداد">
          <div className="col gap-12">
            <Field label="سبب الإلغاء"><select className="select" value={reason} onChange={(e) => setReason(e.target.value)}>{Object.entries(CANCEL_REASONS).filter(([k]) => k !== 'platform').map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></Field>
            <div className="card pad-s col gap-4" style={{ background: 'var(--surface-2)' }}>
              <div className="kv small"><span>المبلغ المدفوع</span><span className="ltr">{money(q.paid)}</span></div>
              <div className="kv small"><span>الأيام حتى السفر</span><span>{q.days > 900 ? '—' : q.days}</span></div>
              <div className="kv small"><span>القاعدة المطبقة</span><span>{q.note}</span></div>
              <div className="kv total"><span>المبلغ المسترد</span><span className="ltr">{money(q.refund)}</span></div>
            </div>
            {['medical', 'death', 'visa_rejected'].includes(reason) && <div className="notice warn">سيُطلب منك إرفاق المستند الرسمي عبر تذكرة الدعم.</div>}
            <label className="check"><input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} />قرأت شروط الإلغاء وأوافق عليها</label>
            <button className="btn btn-danger btn-lg" disabled={!ack} onClick={() => { cancelOrder(o.id, reason); setCancel(false); toast('تم إلغاء الحجز') }}>إلغاء هذا الحجز</button>
          </div>
        </Modal>
      )}
      {help && (
        <Modal onClose={() => setHelp(false)} title="طلب مساعدة">
          <form className="col gap-12" onSubmit={(e) => { e.preventDefault(); const f = Object.fromEntries(new FormData(e.target)); createTicket({ ...f, type: 'inquiry', orderRef: o.number, name: o.contact.name, email: o.contact.email, phone: o.contact.phone }); setHelp(false); toast('تم فتح تذكرة دعم — تابعها من صفحة الدعم') }}>
            <Field label="الموضوع"><input required name="subject" className="input" placeholder="مثال: تغيير نوع الغرفة" /></Field>
            <Field label="التفاصيل"><textarea required name="body" className="textarea" /></Field>
            <button className="btn btn-primary">إرسال</button>
          </form>
        </Modal>
      )}
    </div>
  )
}
