import { hotelPhotos, pkgPhoto, postPhoto, productPhoto, tourPhoto, visaPhoto } from '../lib/media'
import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { BedDouble, ChevronDown, Landmark, LifeBuoy, MapPinned, MessageSquare, Newspaper, Search, ShoppingBag, Stamp, Star } from 'lucide-react'
import { db } from '../lib/db'
import { createLead, createTicket, currentUser, KINDS, replyTicket, settings, TICKET_STATUS, TICKET_TYPES } from '../lib/logic'
import { BLOG_CATS } from '../lib/seed'
import { Art, Chips, Empty, Field, fmtDate, fmtTime, Modal, Price, StatusBadge, Stars, useUI } from '../ui'

/* ----------------------------------------------------------------- blog */
export function BlogPage() {
  const [cat, setCat] = useState('')
  const [q, setQ] = useState('')
  const posts = db.list('posts').filter((p) => (!cat || p.cat === cat) && p.title.includes(q.trim()))
  const [first, ...rest] = posts
  return (
    <div className="page">
      <h1>مدونة عمرتك<span className="dot">.</span></h1>
      <p className="muted">أدلة شاملة، نصائح عملية، وتجارب حقيقية.</p>
      <div className="row wrap between mt-16"><Chips options={[['', 'كل المقالات'], ...Object.entries(BLOG_CATS)]} value={cat} onChange={setCat} /><input className="input" style={{ maxWidth: 240, height: 36 }} placeholder="ابحث في المقالات" value={q} onChange={(e) => setQ(e.target.value)} aria-label="بحث" /></div>
      {!posts.length && <div className="card mt-16"><Empty icon={Newspaper} title="لا توجد مقالات" /></div>}
      {first && (
        <Link to={`/blog/${first.id}`} className="card hover grid g-2 mt-16" style={{ overflow: 'hidden', color: 'var(--ink)', textDecoration: 'none', gap: 0 }}>
          <Art src={postPhoto(first, 900)} alt={first.title} hue={first.hue} icon={Newspaper} h={260} radius={0} label="مقالة مميزة" />
          <div className="pad col gap-8" style={{ justifyContent: 'center' }}><span className="badge">{BLOG_CATS[first.cat]}</span><h2>{first.title}</h2><p className="muted">{first.excerpt}</p><span className="small muted">{fmtDate(first.date)} · {first.mins} د قراءة</span></div>
        </Link>
      )}
      <div className="grid g-3 mt-16">
        {rest.map((p) => (
          <Link key={p.id} to={`/blog/${p.id}`} className="card hover" style={{ overflow: 'hidden', color: 'var(--ink)', textDecoration: 'none' }}>
            <Art src={postPhoto(p, 500)} alt={p.title} hue={p.hue} icon={Newspaper} h={140} radius={0} />
            <div className="pad-s col gap-4" style={{ padding: 14 }}><span className="badge xs" style={{ alignSelf: 'flex-start' }}>{BLOG_CATS[p.cat]}</span><b>{p.title}</b><span className="xs muted">{fmtDate(p.date)} · {p.mins} د</span></div>
          </Link>
        ))}
      </div>
    </div>
  )
}
export function PostPage() {
  const p = db.get('posts', useParams().id)
  if (!p) return <div className="page"><Empty title="المقالة غير موجودة" /></div>
  return (
    <div className="page narrow">
      <Link to="/blog" className="small">← المدونة</Link>
      <span className="badge mt-16">{BLOG_CATS[p.cat]}</span>
      <h1 className="mt-8">{p.title}</h1>
      <p className="muted small mt-8">{fmtDate(p.date)} · {p.mins} دقائق قراءة · فريق عمرتك</p>
      <Art src={postPhoto(p, 1200)} alt={p.title} hue={p.hue} icon={Newspaper} h={300} style={{ marginBlock: 24 }} />
      <div className="col gap-16" style={{ fontSize: 17, lineHeight: 1.9 }}>{p.body.map((x, i) => <p key={i}>{x}</p>)}</div>
      <div className="banner row between wrap mt-40"><b>جاهز تبدأ رحلتك؟</b><Link className="btn btn-dark" to="/umrah">تصفح برامج العمرة</Link></div>
    </div>
  )
}

/* ------------------------------------------------------------------ faq */
export function FaqPage() {
  const all = db.list('faq')
  const groups = [...new Set(all.map((f) => f.group))]
  const [g, setG] = useState('')
  const [open, setOpen] = useState(null)
  const [q, setQ] = useState('')
  const list = all.filter((f) => (!g || f.group === g) && (f.q + f.a).includes(q.trim()))
  return (
    <div className="page narrow">
      <h1>أسئلة على بالك<span className="dot">.</span></h1>
      <input className="input mt-16" placeholder="ابحث عن سؤال…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="بحث في الأسئلة" />
      <div className="mt-16"><Chips options={[['', 'الكل'], ...groups.map((x) => [x, x])]} value={g} onChange={setG} /></div>
      <div className="card mt-16">
        {list.map((f) => (
          <div key={f.id} style={{ borderBottom: '1px solid var(--line)' }}>
            <button className="row between" style={{ width: '100%', padding: '16px 20px', background: 'none', border: 0, cursor: 'pointer', textAlign: 'start' }} onClick={() => setOpen(open === f.id ? null : f.id)} aria-expanded={open === f.id}>
              <b>{f.q}</b><ChevronDown size={18} style={{ transform: open === f.id ? 'rotate(180deg)' : 'none', flexShrink: 0 }} />
            </button>
            {open === f.id && <p className="muted" style={{ padding: '0 20px 16px' }}>{f.a}</p>}
          </div>
        ))}
        {!list.length && <Empty title="لا توجد نتائج" />}
      </div>
      <div className="banner row between wrap mt-24"><div><b>لا تزال لديك أسئلة؟</b><p className="muted small">فريق الدعم متاح على مدار الساعة.</p></div><Link className="btn btn-dark" to="/support">تواصل معنا</Link></div>
    </div>
  )
}

/* --------------------------------------------------------------- about */
export function AboutPage() {
  return (
    <div className="page">
      <h1>شريكك الموثوق نحو بيت الله الحرام<span className="dot">.</span></h1>
      <p className="muted mt-8" style={{ maxWidth: 720 }}>منصة رقمية تجمع بين التقنية الحديثة والخبرة العميقة في خدمة ضيوف الرحمن — قارن، احجز، وتابع رحلتك كاملة من مكان واحد.</p>
      <div className="grid g-4 mt-24">{[['+50,000', 'حاج ومعتمر'], ['+200', 'مزود خدمة معتمد'], ['24/7', 'دعم متواصل'], ['98%', 'رضا العملاء']].map(([n, l]) => <div key={l} className="card pad"><div className="price-big">{n}</div><span className="muted">{l}</span></div>)}</div>
      <div className="grid g-2 mt-24">
        <div className="card pad"><h3>رؤيتنا</h3><p className="muted mt-8">أن نكون المنصة الرائدة عالمياً في تنظيم رحلات الحج والعمرة بأيسر الطرق وأكثرها طمأنينة.</p></div>
        <div className="card pad"><h3>رسالتنا</h3><p className="muted mt-8">خدمات متكاملة وشفافة من التخطيط والحجز إلى الإرشاد والمتابعة الميدانية.</p></div>
      </div>
      <div className="card pad mt-24"><h3 className="mb-16">التراخيص والاعتمادات</h3><div className="grid g-3">{[['ترخيص وزارة السياحة', '73104943'], ['توثيق التجارة الإلكترونية', '30637'], ['السجل التجاري', '4650260256'], ['الرقم الضريبي', '311722780600003'], ['شهادة معروف', '343974'], ['ترخيص إعلامي', '150283']].map(([l, n]) => <div key={l}><span className="muted small">{l}</span><div className="semi ltr">{n}</div></div>)}</div></div>
    </div>
  )
}

/* ------------------------------------------------------------- policies */
const POLICIES = {
  cancellation: 'سياسة الإلغاء والاسترداد',
  terms: 'الشروط والأحكام',
  privacy: 'سياسة الخصوصية',
}
export function PolicyPage() {
  const { kind } = useParams()
  const s = settings()
  return (
    <div className="page narrow">
      <div className="row wrap mb-16">{Object.entries(POLICIES).map(([k, l]) => <Link key={k} to={`/policies/${k}`} className={'chip' + (k === kind ? ' on' : '')} style={{ textDecoration: 'none' }}>{l}</Link>)}</div>
      <h1>{POLICIES[kind] || 'السياسات'}<span className="dot">.</span></h1>
      {kind === 'cancellation' ? (
        <div className="col gap-16 mt-16">
          <p className="muted">نؤمن بالشفافية الكاملة. تُحسب المدة من تاريخ تقديم طلب الإلغاء الرسمي وليس من تاريخ الحجز.</p>
          <div className="card table-wrap"><table className="table"><thead><tr><th>وقت الإلغاء</th><th>نسبة الاسترداد</th></tr></thead><tbody>{s.refundTiers.map((t) => <tr key={t.label}><td>{t.label}</td><td><b>{Math.round(t.rate * 100)}%</b></td></tr>)}</tbody></table></div>
          <h3>استثناءات الاسترداد</h3>
          <ul className="muted" style={{ lineHeight: 2 }}><li>وفاة أحد المسافرين أو ذويه: استرداد كامل 100% مع الوثيقة الرسمية.</li><li>مرض خطير يمنع السفر: حتى 90% مع تقرير طبي معتمد.</li><li>رفض التأشيرة: استرداد كامل عدا رسوم التأشيرة الحكومية.</li><li>إلغاء من جانب المنصة: استرداد كامل أو إعادة جدولة مجانية.</li></ul>
        </div>
      ) : (
        <div className="col gap-16 mt-16 muted" style={{ lineHeight: 1.9 }}>
          <p>هذا نص توضيحي لنموذج الواجهة. يُستبدل بالنص القانوني المعتمد عند الإطلاق.</p>
          <p>{kind === 'privacy' ? 'نجمع البيانات اللازمة لإتمام الحجز فقط (الاسم، الجواز، التواصل) ونشاركها مع مزودي الخدمة المعنيين (الفنادق، شركات الطيران، الجهات الحكومية لإصدار التأشيرات). لا نبيع بياناتك، ويمكنك حذف حسابك في أي وقت من صفحة الحساب.' : 'باستخدامك المنصة فإنك توافق على تقديم بيانات صحيحة مطابقة لوثائق السفر، وعلى سياسات مزودي الخدمة، وعلى سياسة الإلغاء المعلنة. الأسعار بالريال السعودي وتُعرض العملات الأخرى للاسترشاد.'}</p>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------- careers */
export function CareersPage() {
  const { toast } = useUI()
  const jobs = db.list('jobs')
  const [dept, setDept] = useState('')
  const [apply, setApply] = useState(null)
  return (
    <div className="page">
      <h1>وظائف عمرتك<span className="dot">.</span></h1>
      <p className="muted">فرص عمل في المنصة وشركات السياحة الشريكة — قدّم مباشرة دون حساب.</p>
      <div className="mt-16"><Chips options={[['', 'كل التخصصات'], ...[...new Set(jobs.map((j) => j.dept))].map((d) => [d, d])]} value={dept} onChange={setDept} /></div>
      <div className="col gap-12 mt-16">
        {jobs.filter((j) => !dept || j.dept === dept).map((j) => (
          <div key={j.id} className="result"><div className="main-col col gap-4"><h3>{j.title}</h3><span className="small muted">{j.dept} · {j.city} · {j.mode}</span><div className="row wrap"><span className="badge">{j.type}</span><span className="badge">{j.level}</span><span className="badge green">مفتوحة</span></div></div>
            <div className="price-col"><button className="btn btn-dark" onClick={() => setApply(j)}>التقديم</button></div></div>
        ))}
      </div>
      {apply && (
        <Modal onClose={() => setApply(null)} title={apply.title}>
          <form className="col gap-12" onSubmit={(e) => { e.preventDefault(); db.insert('applications', { jobId: apply.id, job: apply.title, ...Object.fromEntries(new FormData(e.target)), status: 'new' }); setApply(null); toast('تم إرسال طلبك — بالتوفيق!') }}>
            <Field label="الاسم"><input required name="name" className="input" /></Field>
            <Field label="البريد"><input required type="email" name="email" className="input ltr" style={{ display: 'block' }} /></Field>
            <Field label="رابط السيرة الذاتية / LinkedIn"><input required type="url" name="cv" className="input ltr" style={{ display: 'block' }} /></Field>
            <Field label="نبذة"><textarea name="note" className="textarea" /></Field>
            <button className="btn btn-primary">إرسال الطلب</button>
          </form>
        </Modal>
      )}
    </div>
  )
}

/* ------------------------------------------------------------- reviews */
export function ReviewsPage() {
  const { toast, openAuth } = useUI()
  const [sp] = useSearchParams()
  const u = currentUser()
  const myOrders = u ? db.list('orders').filter((o) => o.userId === u.id && o.status !== 'cancelled') : []
  const [orderId, setOrderId] = useState(sp.get('order') || '')
  const [kind, setKind] = useState('umrah')
  const [rating, setRating] = useState(0)
  const [text, setText] = useState('')
  const list = db.list('reviews').filter((r) => r.status === 'approved')
  const submit = (e) => {
    e.preventDefault()
    if (!rating) return toast('اختر عدد النجوم')
    const o = myOrders.find((x) => x.id === orderId)
    db.insert('reviews', { name: u?.name || 'زائر', userId: u?.id || null, orderId: o?.id || null, verified: !!o, kind: o ? o.items[0].kind : kind, rating, text, status: 'pending' })
    setRating(0); setText('')
    toast('شكراً! سيُنشر تقييمك بعد المراجعة')
  }
  return (
    <div className="page">
      <div className="grid g-2" style={{ alignItems: 'start' }}>
        <form className="card pad col gap-12" onSubmit={submit}>
          <h2>أضف تقييمك</h2>
          <p className="muted small">لكل رحلة حكاية. شاركنا تجربتك — رأيك يصنع الفرق لضيوف الرحمن.</p>
          {u ? (myOrders.length > 0 && <Field label="اربط التقييم بحجز (تقييم موثّق)"><select className="select" value={orderId} onChange={(e) => setOrderId(e.target.value)}><option value="">بدون ربط</option>{myOrders.map((o) => <option key={o.id} value={o.id}>{o.number} — {o.items[0].title}</option>)}</select></Field>)
            : <div className="notice"><span><button type="button" className="btn-link btn" onClick={() => openAuth()}>سجّل الدخول</button> لربط تقييمك بحجز وتوثيقه.</span></div>}
          {!orderId && <Field label="نوع الخدمة"><select className="select" value={kind} onChange={(e) => setKind(e.target.value)}>{Object.entries(KINDS).filter(([k]) => k !== 'insurance').map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></Field>}
          <Field label="تقييمك"><div className="row">{[1, 2, 3, 4, 5].map((n) => <button type="button" key={n} className="icon-btn" onClick={() => setRating(n)} aria-label={`${n} نجوم`}><Star size={28} fill={n <= rating ? 'var(--brand)' : 'none'} color={n <= rating ? 'var(--brand)' : 'var(--line-2)'} /></button>)}</div></Field>
          <Field label="كيف كانت تجربتك؟"><textarea required minLength={10} className="textarea" value={text} onChange={(e) => setText(e.target.value)} /></Field>
          <button className="btn btn-primary">إرسال التقييم</button>
          <span className="xs muted">يُنشر تقييمك بعد المراجعة والاعتماد.</span>
        </form>
        <div className="col gap-12">
          <h2>آراء العملاء ({list.length})</h2>
          {list.map((r) => <div key={r.id} className="card pad col gap-4"><div className="row between"><div className="row"><span className="avatar">{r.name[0]}</span><b>{r.name}</b>{r.verified && <span className="badge green">موثّق</span>}</div><Stars n={r.rating} /></div><p>{r.text}</p><span className="xs muted">{KINDS[r.kind]} · {fmtDate(r.createdAt)}</span></div>)}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------- support */
export function SupportPage() {
  const { toast } = useUI()
  const u = currentUser()
  const mine = db.list('tickets').filter((t) => (u && t.userId === u.id) || db.kv('guestTickets', []).includes(t.id))
  const [view, setView] = useState(null)
  const [reply, setReply] = useState('')
  const submit = (e) => {
    e.preventDefault()
    const t = createTicket(Object.fromEntries(new FormData(e.target)))
    if (!u) db.setKv('guestTickets', [...db.kv('guestTickets', []), t.id])
    e.target.reset()
    toast(`تم استلام طلبك رقم ${t.number}`)
  }
  const cur = view && db.get('tickets', view)
  return (
    <div className="page">
      <h1>صوتك مسموع<span className="dot">.</span></h1>
      <p className="muted">شكوى، اقتراح، استفسار أو إشادة — نرد خلال 48 ساعة عمل وتتابع كل شيء هنا.</p>
      <div className="grid mt-24" style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', alignItems: 'start' }}>
        <form className="card pad grid g-2" onSubmit={submit}>
          <h3 style={{ gridColumn: '1/-1' }}>طلب جديد</h3>
          <Field label="الاسم الكامل *"><input required name="name" className="input" defaultValue={u?.name} /></Field>
          <Field label="الجوال *"><input required name="phone" className="input ltr" style={{ display: 'block' }} defaultValue={u?.phone} /></Field>
          <Field label="البريد *"><input required type="email" name="email" className="input ltr" style={{ display: 'block' }} defaultValue={u?.email} /></Field>
          <Field label="رقم الحجز (اختياري)"><input name="orderRef" className="input ltr" style={{ display: 'block' }} placeholder="UM-2026-…" /></Field>
          <Field label="نوع الطلب *"><select required name="type" className="select">{Object.entries(TICKET_TYPES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></Field>
          <Field label="الموضوع *"><input required name="subject" className="input" /></Field>
          <div style={{ gridColumn: '1/-1' }}><Field label="التفاصيل *"><textarea required name="body" className="textarea" /></Field></div>
          <button className="btn btn-primary" style={{ gridColumn: '1/-1' }}>إرسال الطلب</button>
        </form>
        <div className="col gap-12">
          <h3>تذاكري ({mine.length})</h3>
          {!mine.length && <div className="card"><Empty icon={LifeBuoy} title="لا توجد تذاكر" /></div>}
          {mine.map((t) => (
            <button key={t.id} className="card hover pad-s row between" style={{ textAlign: 'start' }} onClick={() => setView(t.id)}>
              <div><b>{t.subject}</b><div className="xs muted">{t.number} · {TICKET_TYPES[t.type]} · {fmtDate(t.createdAt)}</div></div>
              <div className="row"><StatusBadge status={t.status} map={TICKET_STATUS} />{t.replies.length > 0 && <span className="badge"><MessageSquare size={12} />{t.replies.length}</span>}</div>
            </button>
          ))}
          <div className="card pad col gap-8">
            <b>ماذا يحدث بعد الإرسال؟</b>
            <div className="timeline small">{['استلام الطلب وإرسال تأكيد فوري', 'مراجعة الفريق المختص', 'الرد خلال 48 ساعة عمل', 'الحل ومتابعة رضاك'].map((s) => <div key={s} className="tl-item">{s}</div>)}</div>
          </div>
        </div>
      </div>
      {cur && (
        <Modal wide onClose={() => setView(null)} title={cur.subject}>
          <div className="row mb-16"><StatusBadge status={cur.status} map={TICKET_STATUS} /><span className="small muted">{cur.number}{cur.orderRef ? ` · حجز ${cur.orderRef}` : ''}</span></div>
          <div className="col gap-8">
            <div className="card pad-s" style={{ background: 'var(--surface-2)' }}><b className="small">أنت</b><p>{cur.body}</p><span className="xs muted">{fmtTime(cur.createdAt)}</span></div>
            {cur.replies.map((r, i) => <div key={i} className="card pad-s" style={{ background: r.by === 'admin' ? 'var(--blue-soft)' : 'var(--surface-2)' }}><b className="small">{r.by === 'admin' ? 'فريق الدعم' : 'أنت'}</b><p>{r.text}</p><span className="xs muted">{fmtTime(r.at)}</span></div>)}
          </div>
          {cur.status !== 'closed' && <form className="row mt-16" onSubmit={(e) => { e.preventDefault(); if (!reply.trim()) return; replyTicket(cur.id, reply, 'customer'); setReply('') }}><input className="input" value={reply} onChange={(e) => setReply(e.target.value)} placeholder="اكتب رداً…" aria-label="رد" /><button className="btn btn-dark">إرسال</button></form>}
        </Modal>
      )}
    </div>
  )
}

/* -------------------------------------------------------------- search */
export function SearchPage() {
  const [sp, setSp] = useSearchParams()
  const { toast } = useUI()
  const q = (sp.get('q') || '').trim()
  const [tab, setTab] = useState('')
  const hit = (s) => q && s?.toLowerCase().includes(q.toLowerCase())
  const groups = [
    ['umrah', 'العمرة', Landmark, db.list('packages').filter((p) => hit(p.title) || hit(p.departCity) || hit(p.code)).map((p) => [`/umrah/${p.id}`, p.title, p.prices.quad, p.hue, pkgPhoto(p, 400)])],
    ['hotels', 'الفنادق', BedDouble, db.list('hotels').filter((h) => hit(h.name) || hit(h.nameEn) || hit(h.area)).map((h) => [`/hotels/${h.id}`, h.name, h.rooms[0].price, h.hue, hotelPhotos(h, 400)[0]])],
    ['visa', 'التأشيرات', Stamp, db.list('visas').filter((v) => hit(v.title) || hit(v.country)).map((v) => ['/visa', v.title, v.fee, 200, visaPhoto(v, 400)])],
    ['tours', 'الجولات', MapPinned, db.list('tours').filter((t) => hit(t.title) || t.stops.some(hit)).map((t) => ['/tours', t.title, t.price, t.hue, tourPhoto(t, 400)])],
    ['store', 'المتجر', ShoppingBag, db.list('products').filter((p) => hit(p.name)).map((p) => ['/store', p.name, p.price, p.hue, productPhoto(p, 400)])],
    ['blog', 'المدونة', Newspaper, db.list('posts').filter((p) => hit(p.title)).map((p) => [`/blog/${p.id}`, p.title, null, p.hue, postPhoto(p, 400)])],
  ]
  const total = groups.reduce((s, g) => s + g[3].length, 0)
  return (
    <div className="page">
      <form className="card pad-s row" onSubmit={(e) => { e.preventDefault(); setSp({ q: new FormData(e.target).get('q') }) }}>
        <Search size={20} className="muted" /><input name="q" className="input" style={{ border: 0 }} defaultValue={q} key={q} placeholder="ابحث في كل الخدمات" aria-label="بحث" autoFocus /><button className="btn btn-primary">بحث</button>
      </form>
      <div className="row wrap mt-16"><Chips options={[['', `الكل (${total})`], ...groups.map(([k, l, , r]) => [k, `${l} (${r.length})`])]} value={tab} onChange={setTab} /></div>
      {!total && <div className="card mt-16"><Empty icon={Search} title={q ? 'لا توجد نتائج' : 'ابدأ البحث'} text="جرّب: مكة، موفنبيك، ترانزيت، إحرام…" /></div>}
      {groups.filter(([k, , , r]) => r.length && (!tab || tab === k)).map(([k, l, I, r]) => (
        <section key={k} className="mt-24">
          <h3 className="mb-8">{l}</h3>
          <div className="grid g-4">{r.slice(0, tab ? 99 : 4).map(([to, title, price, hue, img]) => (
            <Link key={to + title} to={to} className="card hover" style={{ overflow: 'hidden', color: 'var(--ink)', textDecoration: 'none' }}>
              <Art src={img} hue={hue} icon={I} h={90} radius={0} /><div style={{ padding: 12 }}><b className="small">{title}</b>{price != null && <div className="small"><Price sar={price} /></div>}</div>
            </Link>
          ))}</div>
        </section>
      ))}
      {q && <div className="banner row between wrap mt-40"><span>لم تجد ما تبحث عنه؟ أرسل لنا طلباً مخصصاً.</span><button className="btn btn-dark" onClick={() => { createLead('quote', { query: q }); toast('تم إرسال طلبك — سنتواصل معك') }}>اطلب عرضاً</button></div>}
    </div>
  )
}
