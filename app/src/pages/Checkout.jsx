import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle2, CreditCard, Landmark, Lock, ShieldCheck, ShoppingCart, Smartphone, Timer } from 'lucide-react'
import {
  cart, clearCart, currentUser, KINDS, money, needsPassport, placeOrder, totals, travelersNeeded, updateUser, validateCoupon,
} from '../lib/logic'
import { db } from '../lib/db'
import { Empty, Field, fmtDate, Modal, Price, useUI } from '../ui'

const blankTraveler = { firstName: '', lastName: '', gender: 'male', dob: '', nationality: '', passport: '', passportExpiry: '' }
const PAY = [
  ['card', 'بطاقة ائتمانية (فيزا / ماستركارد)', CreditCard],
  ['mada', 'مدى', CreditCard],
  ['applepay', 'Apple Pay', Smartphone],
  ['bank', 'تحويل بنكي', Landmark],
  ['later', 'ادفع لاحقاً (خلال 24 ساعة)', Timer],
]
const luhn = (n) => [...n].reverse().reduce((s, d, i) => { let x = +d; if (i % 2) { x *= 2; if (x > 9) x -= 9 } return s + x }, 0) % 10 === 0

export default function Checkout() {
  const nav = useNavigate()
  const { openAuth, toast } = useUI()
  const user = currentUser()
  const base = cart()
  const n = travelersNeeded(base)
  const passport = needsPassport(base)
  const [step, setStep] = useState(0)
  const [travelers, setTravelers] = useState(() => Array.from({ length: n }, (_, i) => user?.travelers?.[i] || (i === 0 && user ? { ...blankTraveler, firstName: user.name.split(' ')[0], lastName: user.name.split(' ').slice(1).join(' '), nationality: user.nationality || '' } : { ...blankTraveler })))
  const [contact, setContact] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '' })
  const [insure, setInsure] = useState(null)
  const [pay, setPay] = useState('card')
  const [card, setCard] = useState({ name: '', number: '', exp: '', cvc: '' })
  const [coupon, setCoupon] = useState('')
  const [applied, setApplied] = useState('')
  const [agree, setAgree] = useState(false)
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(null)
  const [saveTravelers, setSaveTravelers] = useState(true)

  if (done) return <Booked order={done} />
  if (!base.length) return <div className="page narrow"><div className="card"><Empty icon={ShoppingCart} title="سلتك فارغة" text="أضف خدمات لرحلتك ثم عد هنا لإتمام الحجز."><Link className="btn btn-dark" to="/umrah">تصفح برامج العمرة</Link></Empty></div></div>

  const sub0 = base.reduce((s, i) => s + i.unitPrice * i.qty, 0)
  const items = insure ? [...base, { kind: 'insurance', refId: 'ins', title: 'تأمين السفر والإلغاء', unitPrice: Math.round(sub0 * 0.03), qty: 1, meta: {}, subtitle: 'تغطية الإلغاء والأمتعة والطوارئ' }] : base
  const t = totals(items, applied)

  const v = {
    0: () => {
      const e = {}
      travelers.forEach((tr, i) => {
        if (!tr.firstName.trim()) e[`t${i}f`] = 'مطلوب'
        if (!tr.lastName.trim()) e[`t${i}l`] = 'مطلوب'
        if (passport && !/^[A-Z0-9]{6,9}$/i.test(tr.passport)) e[`t${i}p`] = 'رقم جواز غير صالح'
        if (passport && !tr.dob) e[`t${i}d`] = 'مطلوب'
      })
      return e
    },
    1: () => {
      const e = {}
      if (contact.name.trim().length < 2) e.cn = 'مطلوب'
      if (!/^\S+@\S+\.\S+$/.test(contact.email)) e.ce = 'بريد غير صالح'
      if (!/^\+?\d{9,14}$/.test(contact.phone.replace(/\s/g, ''))) e.cp = 'رقم غير صالح'
      return e
    },
    2: () => (insure === null ? { ins: 'اختر أحد الخيارين' } : {}),
    3: () => {
      if (!['card', 'mada'].includes(pay)) return {}
      const e = {}
      const num = card.number.replace(/\s/g, '')
      if (card.name.trim().length < 3) e.cardName = 'مطلوب'
      if (!/^\d{16}$/.test(num) || !luhn(num)) e.cardNum = 'رقم بطاقة غير صالح (جرّب 4242 4242 4242 4242)'
      const [mm, yy] = card.exp.split('/').map(Number)
      if (!mm || mm > 12 || !yy || new Date(2000 + yy, mm) < new Date()) e.cardExp = 'تاريخ غير صالح'
      if (!/^\d{3,4}$/.test(card.cvc)) e.cardCvc = 'غير صالح'
      return e
    },
  }
  const next = (i) => {
    const e = v[i]()
    setErrors(e)
    if (Object.keys(e).length) return
    setStep(i + 1)
  }
  const confirm = () => {
    if (!agree) return toast('يرجى الموافقة على الشروط')
    setBusy(true)
    setTimeout(() => {
      try {
        const o = placeOrder({ items, couponCode: applied, travelers, contact, payment: { method: pay, last4: card.number.replace(/\s/g, '').slice(-4) || null } })
        if (user && saveTravelers) updateUser({ travelers })
        if (!user) db.setKv('guestOrders', [...db.kv('guestOrders', []), o.id])
        clearCart()
        setDone(o)
      } catch (x) { toast(x.message) }
      setBusy(false)
    }, 1300)
  }
  const setT = (i, k, val) => setTravelers(travelers.map((x, j) => (j === i ? { ...x, [k]: val } : x)))

  return (
    <div className="page">
      <h1 className="mb-8">أكمل حجزك<span className="dot">.</span></h1>
      <p className="muted mb-16">خطوات بسيطة وتنطلق إلى الحرمين.</p>
      {!user && <div className="notice mb-16"><span>لديك حساب؟ <button className="btn-link btn" onClick={() => openAuth()}>سجّل الدخول</button> لتعبئة بياناتك تلقائياً ومتابعة حجوزاتك. أو أكمل كزائر.</span></div>}
      <div className="checkout">
        <div>
          <StepBox step={step} setStep={setStep} i={0} title="بيانات المسافرين" summary={travelers.map((x) => `${x.firstName} ${x.lastName}`).join('، ')}>
            {passport && <div className="notice mb-16">يجب أن تطابق البيانات جواز السفر تماماً.</div>}
            {travelers.map((tr, i) => (
              <div key={i} className="col gap-12 mb-16">
                <b>المسافر {i + 1}{i === 0 ? ' (الرئيسي)' : ''}</b>
                <div className="grid g-2">
                  <Field label="الاسم الأول *" error={errors[`t${i}f`]}><input className="input" value={tr.firstName} onChange={(e) => setT(i, 'firstName', e.target.value)} /></Field>
                  <Field label="اسم العائلة *" error={errors[`t${i}l`]}><input className="input" value={tr.lastName} onChange={(e) => setT(i, 'lastName', e.target.value)} /></Field>
                  <Field label={'تاريخ الميلاد' + (passport ? ' *' : '')} error={errors[`t${i}d`]}><input type="date" className="input" value={tr.dob} onChange={(e) => setT(i, 'dob', e.target.value)} /></Field>
                  <Field label="الجنس"><div className="row gap-16" style={{ height: 42 }}><label className="check"><input type="radio" checked={tr.gender === 'male'} onChange={() => setT(i, 'gender', 'male')} />ذكر</label><label className="check"><input type="radio" checked={tr.gender === 'female'} onChange={() => setT(i, 'gender', 'female')} />أنثى</label></div></Field>
                  {passport && <>
                    <Field label="رقم الجواز *" error={errors[`t${i}p`]}><input className="input ltr" style={{ display: 'block' }} value={tr.passport} onChange={(e) => setT(i, 'passport', e.target.value.toUpperCase())} /></Field>
                    <Field label="الجنسية"><input className="input" value={tr.nationality} onChange={(e) => setT(i, 'nationality', e.target.value)} /></Field>
                  </>}
                </div>
              </div>
            ))}
            {user && <label className="check mb-16"><input type="checkbox" checked={saveTravelers} onChange={(e) => setSaveTravelers(e.target.checked)} />احفظ المسافرين في حسابي للحجوزات القادمة</label>}
            <button className="btn btn-dark" onClick={() => next(0)}>متابعة</button>
          </StepBox>
          <StepBox step={step} setStep={setStep} i={1} title="بيانات التواصل" summary={`${contact.name} · ${contact.email} · ${contact.phone}`}>
            <div className="grid g-2 mb-16">
              <Field label="الاسم *" error={errors.cn}><input className="input" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} /></Field>
              <Field label="البريد الإلكتروني *" error={errors.ce}><input className="input ltr" style={{ display: 'block' }} value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} /></Field>
              <Field label="الجوال (واتساب) *" error={errors.cp} hint="مثال: +966500000000"><input className="input ltr" style={{ display: 'block' }} value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} /></Field>
            </div>
            <button className="btn btn-dark" onClick={() => next(1)}>متابعة</button>
          </StepBox>
          <StepBox step={step} setStep={setStep} i={2} title="حماية الرحلة (موصى به)" summary={insure ? `مؤمّنة — ${money(Math.round(sub0 * 0.03))}` : 'بدون تأمين'}>
            <div className="col gap-8 mb-16 small">
              {['استرداد حتى 100% عند الإلغاء لأسباب مغطاة', 'حماية الأمتعة من الفقد أو التلف', 'تغطية الطوارئ الطبية أثناء الرحلة'].map((x) => <span key={x} className="row"><ShieldCheck size={16} color="var(--green)" />{x}</span>)}
            </div>
            <label className={'radio-card mb-8' + (insure === true ? ' on' : '')}><input type="radio" checked={insure === true} onChange={() => setInsure(true)} /><div className="grow row between"><b>نعم، احمِ رحلتي مقابل {money(Math.round(sub0 * 0.03))}</b><span className="badge green">موصى به</span></div></label>
            <label className={'radio-card' + (insure === false ? ' on' : '')}><input type="radio" checked={insure === false} onChange={() => setInsure(false)} /><span>لا، أتحمل مسؤولية التكاليف غير المستردة</span></label>
            {insure === false && <div className="notice bad mt-8">تنبيه: رحلتك بقيمة {money(t.total)} غير محمية.</div>}
            {errors.ins && <p className="err-text mt-8">{errors.ins}</p>}
            <button className="btn btn-dark mt-16" onClick={() => next(2)}>متابعة</button>
          </StepBox>
          <StepBox step={step} setStep={setStep} i={3} title="طريقة الدفع" summary={PAY.find((p) => p[0] === pay)[1] + (card.number && ['card', 'mada'].includes(pay) ? ` •••• ${card.number.replace(/\s/g, '').slice(-4)}` : '')}>
            <div className="col gap-8 mb-16">
              {PAY.map(([k, l, I]) => (
                <label key={k} className={'radio-card' + (pay === k ? ' on' : '')}>
                  <input type="radio" checked={pay === k} onChange={() => setPay(k)} />
                  <div className="grow col">
                    <span className="row semi"><I size={17} />{l}</span>
                    {pay === k && ['card', 'mada'].includes(k) && (
                      <div className="grid g-2 mt-8">
                        <Field label="الاسم على البطاقة" error={errors.cardName}><input className="input" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} /></Field>
                        <Field label="رقم البطاقة" error={errors.cardNum}><input className="input ltr" style={{ display: 'block' }} inputMode="numeric" placeholder="4242 4242 4242 4242" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value.replace(/[^\d]/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ') })} /></Field>
                        <Field label="تاريخ الانتهاء" error={errors.cardExp}><input className="input ltr" style={{ display: 'block' }} placeholder="MM/YY" value={card.exp} onChange={(e) => setCard({ ...card, exp: e.target.value.replace(/[^\d]/g, '').slice(0, 4).replace(/(\d{2})(?=\d)/, '$1/') })} /></Field>
                        <Field label="CVV" error={errors.cardCvc}><input className="input ltr" style={{ display: 'block' }} inputMode="numeric" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) })} /></Field>
                        <p className="xs muted row" style={{ gridColumn: '1/-1' }}><Lock size={13} />وضع تجريبي: لا يتم إرسال أو حفظ بيانات البطاقة. في الإنتاج يتم الدفع عبر صفحة مزود الدفع الآمنة.</p>
                      </div>
                    )}
                    {pay === k && k === 'bank' && <p className="small muted mt-8">ستصلك بيانات الحساب البنكي، ويُؤكد الحجز بعد استلام الحوالة خلال 24 ساعة.</p>}
                    {pay === k && k === 'later' && <p className="small muted mt-8">نحجز لك الخدمات 24 ساعة. ادفع من «رحلاتي» قبل انتهاء المهلة.</p>}
                  </div>
                </label>
              ))}
            </div>
            <button className="btn btn-dark" onClick={() => next(3)}>متابعة</button>
          </StepBox>
          <StepBox step={step} setStep={setStep} i={4} title="مراجعة وتأكيد">
            <div className="col gap-8 mb-16">
              {items.map((i) => <div key={i.key || i.refId} className="kv"><span><span className="badge xs">{KINDS[i.kind]}</span> {i.title}<div className="xs muted">{i.subtitle}</div></span><b className="ltr nowrap">{money(i.unitPrice * i.qty)}</b></div>)}
            </div>
            <label className="check mb-16"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />أوافق على <Link to="/policies/terms" target="_blank">الشروط والأحكام</Link> و<Link to="/policies/cancellation" target="_blank">سياسة الإلغاء</Link></label>
            <button className="btn btn-primary btn-lg" disabled={busy} onClick={confirm}><Lock size={17} />{['card', 'mada', 'applepay'].includes(pay) ? `ادفع ${money(t.total)} وأكّد الحجز` : 'تأكيد الحجز'}</button>
          </StepBox>
        </div>
        <aside className="summary col gap-12">
          <div className="card pad col gap-8">
            <h3>ملخص الرحلة</h3>
            {items.map((i) => <div key={i.key || i.refId} className="kv small"><span>{i.title} <span className="muted">×{i.qty}</span></span><span className="ltr nowrap">{money(i.unitPrice * i.qty)}</span></div>)}
            <hr className="divider" style={{ margin: '4px 0' }} />
            <div className="row">
              <input className="input" style={{ height: 36 }} placeholder="كوبون الخصم" value={coupon} onChange={(e) => setCoupon(e.target.value)} aria-label="كوبون الخصم" />
              <button className="btn btn-outline btn-sm" onClick={() => { const r = validateCoupon(coupon, items); if (r.ok) { setApplied(coupon); toast('تم تطبيق الكوبون') } else toast(r.msg || 'أدخل الكود') }}>تطبيق</button>
            </div>
            {applied && <div className="row between small"><span className="badge green">{applied.toUpperCase()}</span><button className="btn-link btn xs" onClick={() => { setApplied(''); setCoupon('') }}>إزالة</button></div>}
            <div className="kv"><span>المجموع الفرعي</span><Price sar={t.subtotal} /></div>
            {t.discount > 0 && <div className="kv" style={{ color: 'var(--green)' }}><span>الخصم</span><span className="ltr">-{money(t.discount)}</span></div>}
            {t.vat > 0 && <div className="kv small"><span>ضريبة القيمة المضافة على الفنادق 15%</span><Price sar={t.vat} /></div>}
            {t.municipality > 0 && <div className="kv small"><span>رسوم البلدية 5%</span><Price sar={t.municipality} /></div>}
            <div className="kv total"><span>الإجمالي</span><Price sar={t.total} /></div>
            <span className="xs muted">يشمل ضريبة قيمة مضافة بقيمة {money(t.vatIncluded)} على باقي الخدمات</span>
          </div>
          <div className="card pad-s row between small"><span className="semi">إلغاء مرن</span><ShieldCheck color="var(--green)" /></div>
        </aside>
      </div>
      {busy && <Modal><div className="col center gap-12" style={{ alignItems: 'center' }}><h3>جارٍ المعالجة</h3><p className="muted small">قد يستغرق هذا لحظات</p><div className="skeleton" style={{ height: 8, width: 200 }} /><span className="small" style={{ color: 'var(--blue)' }}>التحقق من الدفع والتوفر…</span></div></Modal>}
    </div>
  )
}

function StepBox({ i, step, setStep, title, children, summary }) {
  return (
    <section className={'step' + (step < i ? ' locked' : '')}>
      <div className="step-head"><h3>{i + 1}. {title}</h3>{step > i && <button className="btn btn-link small" onClick={() => setStep(i)}>تعديل</button>}</div>
      {step === i && <div className="step-body">{children}</div>}
      {step > i && summary && <div className="step-body small muted">{summary}</div>}
    </section>
  )
}

function Booked({ order }) {
  const nav = useNavigate()
  return (
    <div className="page narrow">
      <Modal onClose={() => nav(`/trips/${order.id}`)}>
        <div className="col gap-12">
          <CheckCircle2 size={48} color="var(--green)" />
          <h2>{order.status === 'confirmed' ? 'تم تأكيد حجزك' : 'تم استلام طلبك'}</h2>
          <p className="muted small">رقم الحجز <b className="ltr">{order.number}</b> · {fmtDate(order.createdAt)}</p>
          {order.status === 'pending_payment' && <div className="notice warn">بانتظار الدفع — أكمل الدفع قبل {fmtDate(order.payment.dueBy, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} لتأكيد الحجز.</div>}
          <div className="card pad-s col gap-4">
            {order.items.map((i, k) => <div key={k} className="kv small"><span>{i.title}</span><span className="ltr">{money(i.unitPrice * i.qty)}</span></div>)}
            <div className="kv total"><span>الإجمالي</span><span className="ltr">{money(order.totals.total)}</span></div>
          </div>
          <p className="small muted">أرسلنا التأكيد إلى {order.contact.email} وعبر واتساب.</p>
          <div className="row"><button className="btn btn-primary grow" onClick={() => nav(`/trips/${order.id}`)}>عرض الرحلة</button><button className="btn btn-outline" onClick={() => nav('/')}>الرئيسية</button></div>
        </div>
      </Modal>
    </div>
  )
}
