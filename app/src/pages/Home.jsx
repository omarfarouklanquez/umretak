import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BedDouble, Gift, Moon, Plane, Search, ShoppingBag, Sparkles, Stamp, TrainFront } from 'lucide-react'
import { GreenDome, Kaaba, MinaTent, RITES } from '../icons'
import { hotelPhotos, photo, pkgPhoto } from '../lib/media'
const Landmark = Kaaba
const Tent = MinaTent
import { db } from '../lib/db'
import { addDays, AIRPORTS, pushRecent, today, TIER_LABEL } from '../lib/logic'
import { Art, Counter, fmtDate, Price, Score, Stars } from '../ui'

const TABS = [
  ['umrah', 'عمرة', Landmark],
  ['hotels', 'فنادق', BedDouble],
  ['flights', 'طيران', Plane],
  ['visa', 'تأشيرات', Stamp],
  ['hajj', 'حج', Tent],
]
const HEAD = { umrah: 'برامج العمرة', hotels: 'فنادق الحرمين', flights: 'رحلات الطيران', visa: 'التأشيرات', hajj: 'برامج الحج' }
const iso = (d) => d.toISOString().slice(0, 10)

export default function Home() {
  const [tab, setTab] = useState('umrah')
  const pkgs = db.list('packages').filter((p) => p.kind === 'umrah')
  const cheapest = [...pkgs].sort((a, b) => a.prices.quad - b.prices.quad).slice(0, 4)
  const hotels = db.list('hotels').filter((h) => h.distanceM <= 300).slice(0, 4)
  const reviews = db.list('reviews').filter((r) => r.status === 'approved').slice(0, 6)
  const recent = db.kv('recent', [])
  const hijri = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())

  return (
    <>
      <section className="hero">
        <div className="hero-in">
          <div className="col gap-24">
            <div className="row wrap small muted"><Moon size={15} /> {hijri} · {fmtDate(today(), { weekday: 'long', day: 'numeric', month: 'long' })}</div>
            <h1>قارن {HEAD[tab]} من عشرات الشركات المعتمدة<span className="dot">.</span></h1>
            <div className="svc-tabs" role="tablist">
              {TABS.map(([k, l, I]) => (
                <button key={k} role="tab" aria-selected={tab === k} className={'svc-tab' + (tab === k ? ' on' : '')} onClick={() => setTab(k)}><i><I size={22} /></i>{l}</button>
              ))}
            </div>
            <SearchForm tab={tab} />
          </div>
          <div className="collage" aria-hidden>
            <Art src={photo('makkah', 0, 700)} alt="الكعبة المشرفة وبرج الساعة" hue={28} icon={Landmark} h="100%" />
            <Art src={photo('madinah', 0, 500)} alt="المسجد النبوي" hue={160} icon={TrainFront} h="100%" />
            <Art src={photo('makkah', 9, 500)} alt="الكعبة ليلاً" hue={210} icon={Plane} h="100%" />
          </div>
        </div>
      </section>

      <div className="page">
        <div className="section-title"><h2>{recent.length ? 'عمليات البحث الأخيرة' : 'ابدأ رحلتك'}</h2></div>
        <div className="grid g-4">
          {recent.slice(0, 3).map((r) => (
            <Link to={r.to} key={r.at} className="card pad col" style={{ color: 'var(--ink)', minHeight: 170, textDecoration: 'none' }}>
              <div className="row"><span className="avatar" style={{ background: 'var(--dark)', color: '#fff', width: 30, height: 30 }}><Search size={14} /></span><b>{r.label}</b></div>
              <p className="muted small grow">{r.sub}</p>
              <div className="row between"><span className="muted small">عرض الأسعار</span><span className="search-go" style={{ width: 36, minHeight: 36 }}><Search size={16} /></span></div>
            </Link>
          ))}
          <div className="card pad col center" style={{ minHeight: 170, justifyContent: 'center', alignItems: 'center' }}>
            <b>ابدأ بحثاً جديداً</b>
            <div className="row mt-8">
              {TABS.slice(0, 4).map(([k, l, I]) => <button key={k} className="search-go" style={{ width: 36, minHeight: 36 }} title={l} onClick={() => { setTab(k); window.scrollTo({ top: 0, behavior: 'smooth' }) }}><I size={16} /></button>)}
            </div>
          </div>
        </div>

        <div className="section-title"><h2>عروض عمرة تبدأ من <Price sar={cheapest[0]?.prices.quad} /></h2><Link to="/umrah?sort=price">استكشف المزيد ←</Link></div>
        <div className="grid g-4">
          {cheapest.map((p) => (
            <Link key={p.id} to={`/umrah/${p.id}`} className="card hover" style={{ color: 'var(--ink)', textDecoration: 'none', overflow: 'hidden' }}>
              <Art src={pkgPhoto(p, 500)} alt={p.title} hue={p.hue} icon={Landmark} h={160} radius={0} label={TIER_LABEL[p.tier]} />
              <div style={{ padding: 14 }} className="col gap-4">
                <b style={{ lineHeight: 1.4 }}>{p.title}</b>
                <span className="muted small">{p.departCity} · {p.nights} ليالٍ · {p.transport}</span>
                <span className="muted small">أقرب موعد {fmtDate(p.departures[0]?.date)}</span>
                <b className="mt-8">من <Price sar={p.prices.quad} /></b>
              </div>
            </Link>
          ))}
        </div>

        <div className="section-title"><h2>أدوات المعتمر الذكي</h2></div>
        <div className="grid g-4">
          {[
            ['/builder', 'صمّم رحلتك', 'طيران + تأشيرة + فنادق + نقل بسعر واحد', Sparkles, 28, photo('plane', 1, 500)],
            ['/train', 'قطار الحرمين', 'مكة ↔ المدينة في ساعتين', TrainFront, 160, photo('train', 1, 500)],
            ['/spin', 'عجلة الحظ', 'اربح كوبون خصم كل يوم', Gift, 330, photo('lantern', 0, 500)],
            ['/store', 'متجر المعتمر', 'إحرام، زمزم، تمور وهدايا', ShoppingBag, 210, photo('tasbih', 0, 500)],
          ].map(([to, t, s, I, hue, img]) => (
            <Link key={to} to={to} className="card hover pad col" style={{ color: 'var(--ink)', textDecoration: 'none' }}>
              <b>{t}</b><span className="muted small">{s}</span>
              <Art src={img} hue={hue} icon={I} h={120} style={{ marginTop: 10 }} />
            </Link>
          ))}
        </div>

        <div className="section-title"><h2>رحلة العمرة في أربع خطوات</h2><Link to="/blog/b5">دليل المناسك ←</Link></div>
        <div className="card pad pattern grid g-4">
          {RITES.map(([Ico, t, s], i) => (
            <div key={t} className="rite"><i><Ico size={30} /></i><span className="xs muted">الخطوة {i + 1}</span><b>{t}</b><span className="small muted">{s}</span></div>
          ))}
        </div>

        <div className="section-title"><h2>وجهتك المباركة</h2></div>
        <div className="grid g-2">
          {[['makkah', 'مكة المكرمة', 'المسجد الحرام · برج الساعة · المشاعر', Kaaba, 4], ['madinah', 'المدينة المنورة', 'المسجد النبوي · قباء · أحد', GreenDome, 1]].map(([c, t, s, Ico, i]) => (
            <Link key={c} to={`/hotels?city=${c}`} className="photo-hero" style={{ textDecoration: 'none' }}>
              <Art src={photo(c, i, 1000)} alt={t} hue={30} h="100%" className="shade" />
              <div className="inner col gap-4"><Ico size={30} color="#fff" /><h2 style={{ color: '#fff' }}>{t}</h2><span style={{ opacity: .85 }}>{s}</span><span className="btn btn-primary btn-sm mt-8" style={{ alignSelf: 'flex-start' }}>فنادق {t}</span></div>
            </Link>
          ))}
        </div>

        <div className="section-title"><h2>فنادق على بُعد خطوات من الحرم</h2><Link to="/hotels?sort=distance">كل الفنادق ←</Link></div>
        <div className="grid g-4">
          {hotels.map((h) => (
            <Link key={h.id} to={`/hotels/${h.id}`} className="card hover" style={{ color: 'var(--ink)', textDecoration: 'none', overflow: 'hidden' }}>
              <Art src={hotelPhotos(h, 500)[0]} alt={h.name} hue={h.hue} icon={BedDouble} h={150} radius={0} label={`${h.distanceM} م من الحرم`} />
              <div style={{ padding: 14 }} className="col gap-4">
                <b>{h.name}</b>
                <Stars n={h.stars} />
                <Score rating={h.rating} reviews={h.reviews} />
                <span><b><Price sar={h.rooms[0].price} /></b> <span className="muted small">/ ليلة</span></span>
              </div>
            </Link>
          ))}
        </div>

        <div className="section-title"><h2>آراء ضيوف الرحمن</h2><Link to="/reviews">أضف تقييمك ←</Link></div>
        <div className="grid g-3">
          {reviews.map((r) => (
            <div key={r.id} className="card pad col">
              <div className="row"><span className="avatar">{r.name[0]}</span><div><b>{r.name}</b><div><Stars n={r.rating} size={12} /></div></div></div>
              <p className="small">{r.text}</p>
            </div>
          ))}
        </div>

        <Link to="/train" className="photo-hero mt-40" style={{ textDecoration: 'none', minHeight: 220 }}>
          <Art src={photo('train', 0, 1400)} alt="قطار سريع" hue={160} h="100%" className="shade" />
          <div className="inner row between wrap" style={{ width: '100%' }}>
            <div><span className="badge orange">300 كم/ساعة</span><h2 style={{ color: '#fff', marginTop: 8 }}>قطار الحرمين السريع</h2><p style={{ opacity: .85 }}>احجز مقعدك بين مكة وجدة والمدينة بتأكيد فوري.</p></div>
            <span className="btn btn-primary btn-lg">احجز رحلتك</span>
          </div>
        </Link>
      </div>
    </>
  )
}

function SearchForm({ tab }) {
  const nav = useNavigate()
  const [city, setCity] = useState('')
  const [tier, setTier] = useState('')
  const [month, setMonth] = useState('')
  const [pax, setPax] = useState(2)
  const [hcity, setHcity] = useState('makkah')
  const [cin, setCin] = useState(iso(new Date(Date.now() + 14 * 864e5)))
  const [cout, setCout] = useState(iso(new Date(Date.now() + 18 * 864e5)))
  const [rooms, setRooms] = useState(1)
  const [from, setFrom] = useState('CAI')
  const [to, setTo] = useState('JED')
  const [date, setDate] = useState(iso(new Date(Date.now() + 10 * 864e5)))
  const [vtype, setVtype] = useState('umrah')
  const [paxOpen, setPaxOpen] = useState(false)
  const cities = [...new Set(db.list('packages').filter((p) => p.kind === 'umrah').map((p) => p.departCity))]

  const go = (to, label, sub) => { pushRecent({ to, label, sub }); nav(to) }
  const submit = (e) => {
    e.preventDefault()
    if (tab === 'umrah') go(`/umrah?city=${city}&tier=${tier}&month=${month}&pax=${pax}`, `عمرة${city ? ' من ' + city : ''}`, `${month || 'أي موعد'} · ${pax} مسافر`)
    if (tab === 'hotels') go(`/hotels?city=${hcity}&in=${cin}&out=${cout}&rooms=${rooms}&guests=${pax}`, hcity === 'makkah' ? 'فنادق مكة المكرمة' : 'فنادق المدينة المنورة', `${cin} ← ${cout} · ${rooms} غرفة`)
    if (tab === 'flights') go(`/flights?from=${from}&to=${to}&date=${date}&pax=${pax}`, `${from} → ${to}`, `${date} · ${pax} مسافر`)
    if (tab === 'visa') go(`/visa?type=${vtype}`, 'تأشيرات', vtype)
    if (tab === 'hajj') nav('/hajj')
  }
  const paxSeg = (
    <div className="seg" style={{ maxWidth: 180 }}>
      <label>المسافرون</label>
      <button type="button" className="btn-link btn" style={{ color: 'var(--ink)', fontWeight: 600, justifyContent: 'flex-start' }} onClick={() => setPaxOpen(!paxOpen)}>{pax} مسافر{tab === 'hotels' ? ` · ${rooms} غرفة` : ''}</button>
      {paxOpen && (
        <div className="card pad-s col" style={{ position: 'absolute', top: 58, insetInlineStart: 0, width: 240, zIndex: 20, boxShadow: 'var(--shadow-lg)' }}>
          <div className="row between"><span>البالغون</span><Counter value={pax} min={1} max={12} onChange={setPax} /></div>
          {tab === 'hotels' && <div className="row between"><span>الغرف</span><Counter value={rooms} min={1} max={6} onChange={setRooms} /></div>}
          <button type="button" className="btn btn-dark btn-sm" onClick={() => setPaxOpen(false)}>تم</button>
        </div>
      )}
    </div>
  )
  return (
    <form className="searchbar" onSubmit={submit}>
      {tab === 'umrah' && (<>
        <div className="seg"><label>مدينة الانطلاق</label><select value={city} onChange={(e) => setCity(e.target.value)}><option value="">كل المدن</option>{cities.map((c) => <option key={c}>{c}</option>)}</select></div>
        <div className="seg"><label>شهر السفر</label><input type="month" value={month} min={iso(today()).slice(0, 7)} onChange={(e) => setMonth(e.target.value)} /></div>
        <div className="seg" style={{ maxWidth: 150 }}><label>الفئة</label><select value={tier} onChange={(e) => setTier(e.target.value)}><option value="">الكل</option>{Object.entries(TIER_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
        {paxSeg}
      </>)}
      {tab === 'hotels' && (<>
        <div className="seg"><label>الوجهة</label><select value={hcity} onChange={(e) => setHcity(e.target.value)}><option value="makkah">مكة المكرمة</option><option value="madinah">المدينة المنورة</option></select></div>
        <div className="seg"><label>الوصول</label><input type="date" value={cin} min={iso(today())} onChange={(e) => { setCin(e.target.value); if (e.target.value >= cout) setCout(addDays(e.target.value, 1)) }} /></div>
        <div className="seg"><label>المغادرة</label><input type="date" value={cout} min={addDays(cin, 1)} onChange={(e) => setCout(e.target.value)} /></div>
        {paxSeg}
      </>)}
      {tab === 'flights' && (<>
        <div className="seg"><label>من</label><select value={from} onChange={(e) => setFrom(e.target.value)}>{AIRPORTS.map(([c, n]) => <option key={c} value={c}>{n} ({c})</option>)}</select></div>
        <div className="seg"><label>إلى</label><select value={to} onChange={(e) => setTo(e.target.value)}>{AIRPORTS.map(([c, n]) => <option key={c} value={c}>{n} ({c})</option>)}</select></div>
        <div className="seg"><label>تاريخ الذهاب</label><input type="date" value={date} min={iso(today())} onChange={(e) => setDate(e.target.value)} /></div>
        {paxSeg}
      </>)}
      {tab === 'visa' && (
        <div className="seg"><label>نوع التأشيرة</label><select value={vtype} onChange={(e) => setVtype(e.target.value)}><option value="umrah">عمرة</option><option value="tourist">سياحية</option><option value="transit">ترانزيت</option><option value="visit">زيارة</option><option value="">الكل</option></select></div>
      )}
      {tab === 'hajj' && <div className="seg"><label>موسم الحج</label><b>استعرض باقات الحج أو سجّل في قائمة انتظار الموسم القادم</b></div>}
      <button className="search-go" aria-label="بحث"><Search size={22} /></button>
    </form>
  )
}
