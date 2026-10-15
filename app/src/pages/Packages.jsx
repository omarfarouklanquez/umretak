import { hotelPhotos, photo, pkgPhoto } from '../lib/media'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { BedDouble, Bus, CalendarDays, Check, GitCompare, MapPin, Plane, Share2, ShoppingCart, TrainFront, Users } from 'lucide-react'
import { Kaaba as Landmark, MinaTent as Tent } from '../icons'
import { db } from '../lib/db'
import {
  addToCart, compareList, createLead, currentUser, money, packageItem, ROOM_LABEL, settings, TIER_LABEL, toggleCompare, tourItem, trainItem,
} from '../lib/logic'
import { Art, Chips, Counter, Empty, Field, fmtDate, Modal, Price, SaveBtn, Score, Stars, Tabs, useUI } from '../ui'

export const FilterBlock = ({ title, children, onReset }) => (
  <div className="filter-block">
    <div className="row between"><h4>{title}</h4>{onReset && <button className="btn-link btn xs" onClick={onReset}>إعادة تعيين</button>}</div>
    {children}
  </div>
)
export const CheckList = ({ options, value, onChange, counts = {} }) => (
  <div className="col gap-0">
    {options.map(([k, l]) => (
      <label key={k} className="check row between">
        <span className="row"><input type="checkbox" checked={value.includes(k)} onChange={() => onChange(value.includes(k) ? value.filter((x) => x !== k) : [...value, k])} />{l}</span>
        {counts[k] != null && <span className="muted xs">{counts[k]}</span>}
      </label>
    ))}
  </div>
)

const DUR = [['short', '7 أيام أو أقل', (n) => n <= 7], ['mid', '8 – 10 أيام', (n) => n > 7 && n <= 10], ['long', '11 – 15 يوماً', (n) => n > 10 && n <= 15], ['xl', 'أكثر من 15 يوماً', (n) => n > 15]]
const hotelName = (id) => db.get('hotels', id)?.name

export function PackagesPage() {
  const [sp] = useSearchParams()
  const all = db.list('packages').filter((p) => p.kind === 'umrah')
  const [scope, setScope] = useState([])
  const [dur, setDur] = useState([])
  const [tiers, setTiers] = useState(sp.get('tier') ? [sp.get('tier')] : [])
  const [cities, setCities] = useState(sp.get('city') ? [sp.get('city')] : [])
  const [month, setMonth] = useState(sp.get('month') || '')
  const [train, setTrain] = useState(false)
  const maxP = Math.max(...all.map((p) => p.prices.quad))
  const [budget, setBudget] = useState(maxP)
  const [sort, setSort] = useState(sp.get('sort') === 'price' ? 'price' : 'best')
  const cmp = compareList()

  const list = useMemo(() => {
    const r = all.filter((p) =>
      (!scope.length || scope.includes(p.scope)) &&
      (!dur.length || DUR.some(([k, , f]) => dur.includes(k) && f(p.nights + 1))) &&
      (!tiers.length || tiers.includes(p.tier)) &&
      (!cities.length || cities.includes(p.departCity)) &&
      (!month || p.departures.some((d) => d.date.startsWith(month))) &&
      (!train || p.train) && p.prices.quad <= budget)
    const soon = (p) => p.departures.find((d) => d.seatsLeft > 0)?.date || '9999'
    return r.sort(sort === 'price' ? (a, b) => a.prices.quad - b.prices.quad : sort === 'soon' ? (a, b) => soon(a).localeCompare(soon(b)) : (a, b) => b.rating * 1000 - a.prices.quad / 10 - (a.rating * 1000 - b.prices.quad / 10))
  }, [all, scope, dur, tiers, cities, month, train, budget, sort])

  const cheapest = [...list].sort((a, b) => a.prices.quad - b.prices.quad)[0]
  const best = [...list].sort((a, b) => b.rating - a.rating)[0]
  const reset = () => { setScope([]); setDur([]); setTiers([]); setCities([]); setMonth(''); setTrain(false); setBudget(maxP) }

  return (
    <div className="page">
      <div className="row between wrap mb-16">
        <div><h1>برامج العمرة<span className="dot">.</span></h1><p className="muted">باقات متكاملة: طيران أو نقل بري، تأشيرة، فنادق، وانتقالات.</p></div>
        {cmp.length > 0 && <Link className="btn btn-dark" to="/compare"><GitCompare size={17} />قارن ({cmp.length})</Link>}
      </div>
      <div className="results">
        <aside className="filters card pad-s" tabIndex={0} aria-label="الفلاتر">
          <div className="row between"><b>{list.length} من {all.length} باقة</b><button className="btn-link btn small" onClick={reset}>مسح الكل</button></div>
          <FilterBlock title="نوع البرنامج"><CheckList options={[['international', 'معتمرو الخارج'], ['domestic', 'معتمرو الداخل']]} value={scope} onChange={setScope} counts={{ international: all.filter((p) => p.scope === 'international').length, domestic: all.filter((p) => p.scope === 'domestic').length }} /></FilterBlock>
          <FilterBlock title="مدة الرحلة"><CheckList options={DUR.map(([k, l]) => [k, l])} value={dur} onChange={setDur} /></FilterBlock>
          <FilterBlock title="الفئة"><CheckList options={Object.entries(TIER_LABEL)} value={tiers} onChange={setTiers} /></FilterBlock>
          <FilterBlock title="مدينة الانطلاق"><CheckList options={[...new Set(all.map((p) => p.departCity))].map((c) => [c, c])} value={cities} onChange={setCities} /></FilterBlock>
          <FilterBlock title="شهر السفر" onReset={month ? () => setMonth('') : null}><input className="input" type="month" value={month} onChange={(e) => setMonth(e.target.value)} /></FilterBlock>
          <FilterBlock title="الميزانية للفرد">
            <input type="range" min={Math.min(...all.map((p) => p.prices.quad))} max={maxP} step={100} value={budget} onChange={(e) => setBudget(+e.target.value)} style={{ width: '100%', accentColor: 'var(--ink)' }} aria-label="الحد الأعلى للسعر" />
            <div className="small muted">حتى <Price sar={budget} /></div>
          </FilterBlock>
          <label className="check row between" style={{ paddingTop: 12 }}><span>يشمل قطار الحرمين</span><input type="checkbox" checked={train} onChange={(e) => setTrain(e.target.checked)} /></label>
        </aside>
        <div className="col gap-12">
          <div className="sorttabs">
            {[['price', 'الأرخص', cheapest], ['best', 'الأفضل', best], ['soon', 'الأقرب موعداً', null]].map(([k, l, p]) => (
              <button key={k} className={'sorttab' + (sort === k ? ' on' : '')} onClick={() => setSort(k)}>
                <b>{l}</b><span>{p ? money(p.prices.quad) : 'حسب أقرب رحلة'}</span>
              </button>
            ))}
          </div>
          {!list.length && <div className="card"><Empty icon={Landmark} title="لا توجد باقات مطابقة" text="جرّب إزالة بعض الفلاتر."><button className="btn btn-dark" onClick={reset}>مسح الفلاتر</button></Empty></div>}
          {list.map((p) => <PackageCard key={p.id} p={p} inCompare={cmp.includes(p.id)} badges={[p === cheapest && ['الأرخص', 'green'], p === best && ['الأفضل', 'blue']].filter(Boolean)} />)}
        </div>
      </div>
    </div>
  )
}

function PackageCard({ p, inCompare, badges }) {
  const { toast } = useUI()
  const next = p.departures.find((d) => d.seatsLeft > 0)
  return (
    <article className="result">
      <div className="main-col col gap-12">
        <div className="row between wrap">
          <div className="row wrap"><SaveBtn kind="pkg" id={p.id} /><label className="check small"><input type="checkbox" checked={inCompare} onChange={() => { try { toggleCompare(p.id) } catch (e) { toast(e.message) } }} />قارن</label></div>
          <div className="row">{badges.map(([l, t]) => <span key={l} className={'badge ' + t}>{l}</span>)}<span className="badge gold">{TIER_LABEL[p.tier]}</span><span className="badge">{p.code}</span></div>
        </div>
        <div className="row top gap-12">
          <Link to={`/umrah/${p.id}`} className="thumb"><Art src={pkgPhoto(p, 300)} alt={p.title} hue={p.hue} icon={Landmark} h={96} /></Link>
          <Link to={`/umrah/${p.id}`} style={{ color: 'var(--ink)' }}><h3>{p.title}</h3></Link>
        </div>
        <div className="grid g-2 small" style={{ gap: 8 }}>
          <span className="row">{p.scope === 'domestic' ? <Bus size={16} /> : <Plane size={16} />}{p.departCity} · {p.transport}</span>
          <span className="row"><CalendarDays size={16} />{p.nights} ليالٍ · أقرب موعد {next ? fmtDate(next.date) : '—'}</span>
          {p.hotels.map((h) => <span key={h.hotelId} className="row"><BedDouble size={16} />{h.city === 'makkah' ? 'مكة' : 'المدينة'}: {hotelName(h.hotelId)} ({h.nights} ليالٍ)</span>)}
        </div>
        <div className="row wrap">
          {p.train && <span className="badge green"><TrainFront size={13} />قطار الحرمين</span>}
          {next && next.seatsLeft < 10 && <span className="badge red">تبقّى {next.seatsLeft} مقاعد</span>}
          <Score rating={p.rating} reviews={p.reviews} />
        </div>
      </div>
      <div className="price-col">
        <span className="muted xs">يبدأ من / للفرد</span>
        <span className="price-big"><Price sar={p.prices.quad} /></span>
        <div className="xs muted col gap-0">
          {Object.entries(ROOM_LABEL).map(([k, l]) => <span key={k} className="row between"><span>{l}</span><Price sar={p.prices[k]} /></span>)}
        </div>
        <Link to={`/umrah/${p.id}`} className="btn btn-primary btn-block mt-8">عرض الباقة</Link>
      </div>
    </article>
  )
}

export function PackageDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const { toast, setCartOpen } = useUI()
  const p = db.get('packages', id)
  const [depId, setDepId] = useState(p?.departures.find((d) => d.seatsLeft > 0)?.id)
  const [room, setRoom] = useState('double')
  const [pax, setPax] = useState(2)
  const [tab, setTab] = useState('overview')
  const [addTrain, setAddTrain] = useState(false)
  const [addTour, setAddTour] = useState(false)
  if (!p) return <div className="page"><Empty icon={Landmark} title="الباقة غير موجودة" /></div>
  const dep = p.departures.find((d) => d.id === depId)
  const fare = db.get('trainFares', 't1')
  const tour = db.get('tours', 'tr4')
  const extra = (addTrain && !p.train ? fare.economy * pax : 0) + (addTour ? tour.price * pax : 0)
  const total = p.prices[room] * pax + extra

  const add = (checkout) => {
    if (!dep) return toast('اختر موعد السفر')
    if (dep.seatsLeft < pax) return toast(`المتاح ${dep.seatsLeft} مقاعد فقط`)
    addToCart(packageItem(p, dep, room, pax))
    if (addTrain && !p.train) addToCart(trainItem(fare, 'economy', dep.date, '10:30', pax))
    if (addTour) addToCart(tourItem(tour, dep.date, pax))
    if (checkout) nav('/checkout')
    else { toast('أُضيفت الباقة إلى السلة', { label: 'عرض السلة', fn: () => setCartOpen(true) }) }
  }

  return (
    <div className="page">
      <div className="small muted mb-8"><Link to="/">الرئيسية</Link> / <Link to="/umrah">برامج العمرة</Link> / {p.code}</div>
      <div className="row between wrap top">
        <div className="col gap-4">
          <div className="row wrap"><span className="badge gold">{TIER_LABEL[p.tier]}</span><span className="badge">{p.code}</span>{p.train && <span className="badge green">قطار الحرمين</span>}</div>
          <h1 style={{ fontSize: 28 }}>{p.title}</h1>
          <div className="row wrap small muted"><MapPin size={15} />من {p.departCity} · {p.nights} ليالٍ · <Score rating={p.rating} reviews={p.reviews} /></div>
        </div>
        <div className="row"><SaveBtn kind="pkg" id={p.id} size="md" /><button className="btn btn-outline" onClick={() => { navigator.clipboard?.writeText(location.href); toast('تم نسخ رابط الباقة') }}><Share2 size={16} />مشاركة</button></div>
      </div>
      <div className="grid mt-16" style={{ gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: '150px 150px', gap: 8 }}>
        <Art src={pkgPhoto(p, 1100)} alt={p.title} hue={p.hue} icon={Landmark} h="100%" style={{ gridRow: 'span 2' }} />
        <Art src={photo('room', +p.id.slice(1), 500)} hue={p.hue + 60} icon={BedDouble} h="100%" label="الإقامة" />
        <Art src={photo(p.makkahFirst ? 'madinah' : 'makkah', +p.id.slice(1) + 3, 500)} hue={p.hue + 120} icon={BedDouble} h="100%" label={p.makkahFirst ? 'المدينة المنورة' : 'مكة المكرمة'} />
        <Art src={photo(p.train ? 'train' : 'bus', +p.id.slice(1), 500)} hue={p.hue + 180} icon={TrainFront} h="100%" label={p.train ? 'قطار الحرمين' : 'التنقلات'} />
        <Art src={photo('mosque', +p.id.slice(1), 500)} hue={p.hue + 240} icon={Users} h="100%" label="المزارات" />
      </div>

      <div className="checkout mt-24">
        <div className="col gap-16">
          <Tabs tabs={[['overview', 'نظرة عامة'], ['hotels', 'الفنادق'], ['dates', 'المواعيد'], ['policy', 'السياسات']]} value={tab} onChange={setTab} />
          {tab === 'overview' && (
            <div className="card pad col gap-16">
              <h3>مسار الرحلة</h3>
              <div className="timeline">
                <div className="tl-item"><b>اليوم 1 — الانطلاق من {p.departCity}</b><p className="muted small">{p.transport} إلى {p.makkahFirst ? 'جدة' : 'المدينة المنورة'}، الاستقبال والانتقال للفندق.</p></div>
                {p.hotels.map((h) => <div key={h.hotelId} className="tl-item"><b>{h.nights} ليالٍ في {h.city === 'makkah' ? 'مكة المكرمة' : 'المدينة المنورة'}</b><p className="muted small">{hotelName(h.hotelId)} {h.city === 'makkah' ? '· أداء العمرة مع المشرف' : '· زيارة المسجد النبوي والمزارات'}</p></div>)}
                <div className="tl-item"><b>اليوم {p.nights + 1} — العودة</b><p className="muted small">الانتقال للمطار والعودة إلى {p.departCity}.</p></div>
              </div>
              <h3>الباقة تشمل</h3>
              <div className="grid g-2" style={{ gap: 8 }}>{p.includes.map((i) => <span key={i} className="row small"><Check size={16} color="var(--green)" />{i}</span>)}</div>
            </div>
          )}
          {tab === 'hotels' && p.hotels.map((h) => {
            const ho = db.get('hotels', h.hotelId)
            return (
              <Link key={h.hotelId} to={`/hotels/${ho.id}`} className="card hover row gap-16" style={{ padding: 12, color: 'var(--ink)', textDecoration: 'none' }}>
                <Art src={hotelPhotos(ho, 400)[0]} alt={ho.name} hue={ho.hue} icon={BedDouble} h={110} style={{ width: 150, flexShrink: 0 }} />
                <div className="col gap-4"><b>{ho.name}</b><Stars n={ho.stars} /><span className="small muted">{ho.distanceM} م من الحرم · {h.nights} ليالٍ</span><Score rating={ho.rating} reviews={ho.reviews} /></div>
              </Link>
            )
          })}
          {tab === 'dates' && (
            <div className="card pad">
              <table className="table"><thead><tr><th>الذهاب</th><th>العودة</th><th>المقاعد</th><th /></tr></thead>
                <tbody>{p.departures.map((d) => (
                  <tr key={d.id}><td>{fmtDate(d.date)}</td><td>{fmtDate(d.returnDate)}</td>
                    <td>{d.seatsLeft ? <span className={'badge ' + (d.seatsLeft < 10 ? 'red' : 'green')}>{d.seatsLeft} متاح</span> : <span className="badge">مكتمل</span>}</td>
                    <td><button className="btn btn-sm btn-outline" disabled={!d.seatsLeft} onClick={() => setDepId(d.id)}>{d.id === depId ? 'محدد ✓' : 'اختيار'}</button></td></tr>
                ))}</tbody></table>
            </div>
          )}
          {tab === 'policy' && (
            <div className="card pad col gap-8 small">
              <h3>سياسة الإلغاء</h3>
              {settings().refundTiers.map((t) => <div key={t.label} className="kv"><span>{t.label}</span><b>استرداد {t.rate * 100}%</b></div>)}
              <p className="muted">تُحسب المدة من تاريخ طلب الإلغاء. رسوم التأشيرة الحكومية غير مستردة. <Link to="/policies/cancellation">السياسة الكاملة</Link></p>
            </div>
          )}
        </div>

        <aside className="summary card pad col gap-12">
          <div><span className="muted small">السعر للفرد</span><div className="price-big"><Price sar={p.prices[room]} /></div></div>
          <Field label="موعد السفر">
            <select className="select" value={depId || ''} onChange={(e) => setDepId(e.target.value)}>
              {p.departures.map((d) => <option key={d.id} value={d.id} disabled={!d.seatsLeft}>{fmtDate(d.date)} ← {fmtDate(d.returnDate)} {d.seatsLeft ? `(${d.seatsLeft} مقعد)` : '(مكتمل)'}</option>)}
            </select>
          </Field>
          <Field label="نوع الغرفة"><Chips options={Object.entries(ROOM_LABEL)} value={room} onChange={(v) => v && setRoom(v)} /></Field>
          <div className="row between"><span className="semi">عدد المسافرين</span><Counter value={pax} min={1} max={Math.min(12, dep?.seatsLeft || 1)} onChange={setPax} /></div>
          <hr className="divider" style={{ margin: 0 }} />
          <b className="small">أكمل رحلتك</b>
          {!p.train && <label className="check row between small"><span className="row"><input type="checkbox" checked={addTrain} onChange={(e) => setAddTrain(e.target.checked)} />قطار الحرمين مكة ↔ المدينة</span><Price sar={fare.economy} /></label>}
          <label className="check row between small"><span className="row"><input type="checkbox" checked={addTour} onChange={(e) => setAddTour(e.target.checked)} />{tour.title}</span><Price sar={tour.price} /></label>
          <hr className="divider" style={{ margin: 0 }} />
          <div className="kv total"><span>الإجمالي</span><Price sar={total} /></div>
          <button className="btn btn-primary btn-lg btn-block" onClick={() => add(true)}>احجز الآن</button>
          <button className="btn btn-outline btn-block" onClick={() => add(false)}><ShoppingCart size={16} />أضف إلى السلة</button>
          <p className="xs muted center">لن يتم خصم أي مبلغ قبل مراجعة الطلب</p>
        </aside>
      </div>
    </div>
  )
}

export function ComparePage() {
  const ids = compareList()
  const ps = ids.map((i) => db.get('packages', i)).filter(Boolean)
  const rows = [
    ['السعر (رباعية)', (p) => <Price sar={p.prices.quad} />],
    ['السعر (ثنائية)', (p) => <Price sar={p.prices.double} />],
    ['الفئة', (p) => TIER_LABEL[p.tier]],
    ['المدة', (p) => `${p.nights} ليالٍ`],
    ['الانطلاق', (p) => `${p.departCity} · ${p.transport}`],
    ['فندق مكة', (p) => { const h = db.get('hotels', p.hotels.find((x) => x.city === 'makkah')?.hotelId); return h ? `${h.name} (${h.distanceM} م)` : '—' }],
    ['فندق المدينة', (p) => { const h = db.get('hotels', p.hotels.find((x) => x.city === 'madinah')?.hotelId); return h ? `${h.name} (${h.distanceM} م)` : '—' }],
    ['قطار الحرمين', (p) => (p.train ? '✓' : '—')],
    ['التقييم', (p) => <Score rating={p.rating} />],
  ]
  return (
    <div className="page">
      <h1 className="mb-16">مقارنة الباقات<span className="dot">.</span></h1>
      {!ps.length ? <div className="card"><Empty icon={GitCompare} title="لم تختر باقات للمقارنة" text="اختر حتى 3 باقات من صفحة البرامج."><Link className="btn btn-dark" to="/umrah">تصفح البرامج</Link></Empty></div> : (
        <div className="card table-wrap">
          <table className="table">
            <thead><tr><th />{ps.map((p) => <th key={p.id} style={{ minWidth: 220 }}><Link to={`/umrah/${p.id}`}>{p.title}</Link><div><button className="btn-link btn xs" onClick={() => toggleCompare(p.id)}>إزالة</button></div></th>)}</tr></thead>
            <tbody>{rows.map(([l, f]) => <tr key={l}><td className="semi">{l}</td>{ps.map((p) => <td key={p.id}>{f(p)}</td>)}</tr>)}</tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export function HajjPage() {
  const { toast } = useUI()
  const s = settings().hajjSeason
  const ps = db.list('packages').filter((p) => p.kind === 'hajj')
  const [scope, setScope] = useState('domestic')
  const [form, setForm] = useState(null)
  const u = currentUser()
  const submit = (e) => {
    e.preventDefault()
    const f = Object.fromEntries(new FormData(e.target))
    createLead('hajj-waitlist', { ...f, season: s.name, packageId: form.id })
    setForm(null)
    toast('تم تسجيلك في قائمة الانتظار — سنتواصل معك فور فتح التسجيل')
  }
  return (
    <div className="page">
      <h1>برامج الحج<span className="dot">.</span></h1>
      <p className="muted">باقات حج معتمدة لحجاج الداخل (عبر نسك) والخارج.</p>
      <div className="banner mt-16 col gap-16">
        <div className="row between wrap"><b>موسم {s.name}</b><span className="badge amber">التسجيل مغلق حالياً — قائمة الانتظار مفتوحة</span></div>
        <div className="stepper">
          {[['بداية التقديم', s.applyStart], ['نهاية التقديم', s.applyEnd], ['القرعة', s.lottery], ['قائمة انتظار الموسم القادم', null]].map(([l, d], i) => (
            <div key={l} className={'s' + (i < 3 ? ' done' : ' cur')}><b>{i < 3 ? '✓' : i + 1}</b>{l}<span className="xs muted">{d ? fmtDate(d) : 'الآن'}</span></div>
          ))}
        </div>
      </div>
      <div className="row mt-24 mb-16"><Chips options={[['domestic', 'حجاج الداخل'], ['international', 'حجاج الخارج']]} value={scope} onChange={(v) => v && setScope(v)} /></div>
      <div className="col gap-12">
        {ps.filter((p) => p.scope === scope).map((p) => (
          <article key={p.id} className="result">
            <div className="main-col col gap-8">
              <div className="row"><span className="badge gold">{TIER_LABEL[p.tier]}</span><span className="badge">{p.code}</span></div>
              <h3>{p.title}</h3>
              <span className="small muted row"><Tent size={15} />{p.nights} أيام · من {p.departCity} · {p.transport}</span>
              <div className="row wrap">{p.includes.map((i) => <span key={i} className="badge green"><Check size={12} />{i}</span>)}</div>
            </div>
            <div className="price-col">
              <span className="muted xs">السعر التقديري للفرد</span>
              <span className="price-big"><Price sar={p.prices.quad} /></span>
              <button className="btn btn-dark btn-block" onClick={() => setForm(p)}>سجّل اهتمامك</button>
            </div>
          </article>
        ))}
      </div>
      {form && (
        <Modal onClose={() => setForm(null)} title="التسجيل المبكر للموسم القادم">
          <form className="col gap-12" onSubmit={submit}>
            <p className="small muted">{form.title}</p>
            <Field label="الاسم الكامل"><input required name="name" className="input" defaultValue={u?.name} /></Field>
            <Field label="رقم الجوال"><input required name="phone" className="input ltr" defaultValue={u?.phone} /></Field>
            <Field label="عدد الحجاج"><input required name="people" type="number" min={1} max={10} defaultValue={1} className="input" /></Field>
            <Field label="طريقة التنبيه"><select name="notify" className="select"><option>واتساب</option><option>رسالة نصية</option><option>بريد إلكتروني</option></select></Field>
            <button className="btn btn-primary btn-lg">تسجيل في قائمة الانتظار</button>
          </form>
        </Modal>
      )}
    </div>
  )
}
