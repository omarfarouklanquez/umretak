import { hotelPhotos, photo } from '../lib/media'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { BedDouble, Car, Check, Map as MapIcon, MapPin, ShieldCheck } from 'lucide-react'
import { db } from '../lib/db'
import { addDays, addToCart, hotelItem, today } from '../lib/logic'
import { Art, Chips, Counter, Empty, Field, Price, SaveBtn, Score, scoreLabel, Stars, Tabs, useUI } from '../ui'
import { CheckList, FilterBlock } from './Packages'

const iso = (d) => new Date(d).toISOString().slice(0, 10)
const CITY = { makkah: 'مكة المكرمة', madinah: 'المدينة المنورة' }

// Stylised map: the Haram in the centre, hotels placed by real walking distance.
export function HaramMap({ hotels, city, onPick, active }) {
  const R = 140
  const max = Math.max(1500, ...hotels.map((h) => h.distanceM))
  return (
    <svg viewBox="-160 -160 320 320" style={{ width: '100%', maxHeight: 340, background: '#e8efe9', borderRadius: 12 }} role="img" aria-label="خريطة المسافة إلى الحرم">
      {[500, 1000, 1500].map((m) => <g key={m}><circle r={(m / max) * R} fill="none" stroke="#c9d7cc" strokeDasharray="4 4" /><text y={-(m / max) * R - 3} fontSize="9" textAnchor="middle" fill="#6b7b70">{m} م</text></g>)}
      <rect x="-9" y="-9" width="18" height="18" fill="var(--kaaba)" rx="2" />
      <rect x="-9" y="-4" width="18" height="2.5" fill="#c9a227" />
      <text y="24" fontSize="10" textAnchor="middle" fontWeight="700">{city === 'madinah' ? 'المسجد النبوي' : 'المسجد الحرام'}</text>
      {hotels.map((h, i) => {
        const a = (i * 137.5 * Math.PI) / 180
        const r = Math.max(24, (h.distanceM / max) * R)
        const x = Math.cos(a) * r, y = Math.sin(a) * r
        const on = active === h.id
        return (
          <g key={h.id} transform={`translate(${x} ${y})`} style={{ cursor: 'pointer' }} onClick={() => onPick?.(h.id)}>
            <rect x="-26" y="-11" width="52" height="20" rx="10" fill={on ? 'var(--dark)' : '#fff'} stroke="var(--dark)" strokeWidth=".6" />
            <text y="3" fontSize="9" textAnchor="middle" fontWeight="700" fill={on ? '#fff' : 'var(--ink)'}>{h.rooms[0].price}</text>
          </g>
        )
      })}
    </svg>
  )
}

const AMEN = ['واي فاي مجاني', 'إفطار', 'نقل للحرم', 'مواقف سيارات', 'سبا', 'إطلالة']

export function HotelsPage() {
  const [sp] = useSearchParams()
  const all = db.list('hotels')
  const [city, setCity] = useState(sp.get('city') || '')
  const [stars, setStars] = useState([])
  const [minScore, setMinScore] = useState(0)
  const [maxDist, setMaxDist] = useState(1500)
  const [amen, setAmen] = useState([])
  const [freeCancel, setFreeCancel] = useState(false)
  const [sort, setSort] = useState(sp.get('sort') || 'rec')
  const [showMap, setShowMap] = useState(true)
  const [active, setActive] = useState(null)
  const nights = sp.get('in') && sp.get('out') ? Math.max(1, (new Date(sp.get('out')) - new Date(sp.get('in'))) / 864e5) : null

  const list = useMemo(() => all.filter((h) =>
    (!city || h.city === city) && (!stars.length || stars.includes(String(h.stars))) && h.rating * 2 >= minScore &&
    h.distanceM <= maxDist && amen.every((a) => h.amenities.includes(a)) && (!freeCancel || h.freeCancel),
  ).sort({ rec: (a, b) => (b.featured - a.featured) || b.rating - a.rating, price: (a, b) => a.rooms[0].price - b.rooms[0].price, distance: (a, b) => a.distanceM - b.distanceM, score: (a, b) => b.rating - a.rating }[sort]), [all, city, stars, minScore, maxDist, amen, freeCancel, sort])

  const q = sp.toString() ? '?' + sp.toString() : ''
  return (
    <div className="page">
      <div className="row between wrap mb-16">
        <div><h1>فنادق الحرمين<span className="dot">.</span></h1><p className="muted">الأسعار لليلة قبل الضرائب{nights ? ` · ${nights} ليالٍ من ${sp.get('in')}` : ''}.</p></div>
        <div className="row"><Chips options={[['', 'كل المدن'], ['makkah', 'مكة'], ['madinah', 'المدينة']]} value={city} onChange={setCity} /><button className="btn btn-outline btn-sm" onClick={() => setShowMap(!showMap)}><MapIcon size={15} />{showMap ? 'إخفاء الخريطة' : 'الخريطة'}</button></div>
      </div>
      <div className="results">
        <aside className="filters card pad-s" tabIndex={0} aria-label="الفلاتر">
          <b>{list.length} فندق</b>
          <FilterBlock title="تصنيف الفندق"><div className="row">{[3, 4, 5].map((s) => <button key={s} className={'chip' + (stars.includes(String(s)) ? ' on' : '')} onClick={() => setStars(stars.includes(String(s)) ? stars.filter((x) => x !== String(s)) : [...stars, String(s)])}>{s} ★</button>)}</div></FilterBlock>
          <FilterBlock title="تقييم الضيوف"><div className="row wrap">{[0, 7, 8, 9].map((s) => <button key={s} className={'chip' + (minScore === s ? ' on' : '')} onClick={() => setMinScore(s)}>{s ? s + '+' : 'الكل'}</button>)}</div></FilterBlock>
          <FilterBlock title="المسافة من الحرم">
            <input type="range" min={100} max={1500} step={50} value={maxDist} onChange={(e) => setMaxDist(+e.target.value)} style={{ width: '100%', accentColor: 'var(--ink)' }} aria-label="أقصى مسافة" />
            <div className="small muted">حتى {maxDist} متر</div>
          </FilterBlock>
          <FilterBlock title="المرافق"><CheckList options={AMEN.map((a) => [a, a])} value={amen} onChange={setAmen} /></FilterBlock>
          <label className="check row between" style={{ paddingTop: 12 }}><span>إلغاء مجاني</span><input type="checkbox" checked={freeCancel} onChange={(e) => setFreeCancel(e.target.checked)} /></label>
        </aside>
        <div className="col gap-12">
          {showMap && <div className="card pad-s"><HaramMap hotels={list.slice(0, 14)} city={city} active={active} onPick={(id) => { setActive(id); document.getElementById('h-' + id)?.scrollIntoView({ behavior: 'smooth', block: 'center' }) }} /></div>}
          <div className="row between wrap">
            <span className="small muted">ترتيب حسب</span>
            <Chips options={[['rec', 'الموصى به'], ['price', 'السعر'], ['distance', 'الأقرب للحرم'], ['score', 'التقييم']]} value={sort} onChange={(v) => v && setSort(v)} />
          </div>
          {!list.length && <div className="card"><Empty icon={BedDouble} title="لا توجد فنادق مطابقة" text="جرّب توسيع المسافة أو إزالة بعض المرافق." /></div>}
          {list.map((h) => (
            <article key={h.id} id={'h-' + h.id} className="result" style={{ outline: active === h.id ? '2px solid var(--dark)' : 'none' }} onMouseEnter={() => setActive(h.id)}>
              <div className="main-col row top gap-16">
                <Art src={hotelPhotos(h, 500)[0]} alt={h.name} hue={h.hue} icon={BedDouble} h={150} style={{ width: 200, flexShrink: 0 }} label={h.featured ? 'مميز' : null} />
                <div className="col gap-4 grow">
                  <Link to={`/hotels/${h.id}${q}`} style={{ color: 'var(--ink)' }}><h3>{h.name}</h3></Link>
                  <span className="xs muted">{h.nameEn}</span>
                  <div className="row"><Stars n={h.stars} /><span className="small muted">{CITY[h.city]} · {h.area}</span></div>
                  <Score rating={h.rating} reviews={h.reviews} />
                  <span className="small row"><MapPin size={14} />{h.distanceM} م من الحرم{h.distanceM <= 500 && <span className="badge green">مشياً</span>}</span>
                  <div className="row wrap">{h.freeCancel && <span className="badge green">إلغاء مجاني</span>}<span className="badge blue">تأكيد فوري</span></div>
                  <div><SaveBtn kind="hotel" id={h.id} /></div>
                </div>
              </div>
              <div className="price-col">
                <span className="price-big"><Price sar={h.rooms[0].price} /></span>
                <span className="xs muted">لليلة · + ضريبة 15% ورسوم بلدية 5%</span>
                {nights && <span className="small semi">{nights} ليالٍ: <Price sar={h.rooms[0].price * nights} /></span>}
                <Link to={`/hotels/${h.id}${q}`} className="btn btn-primary btn-block mt-8">عرض الغرف</Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}

export function HotelDetail() {
  const { id } = useParams()
  const [sp] = useSearchParams()
  const nav = useNavigate()
  const { toast, setCartOpen } = useUI()
  const h = db.get('hotels', id)
  const [tab, setTab] = useState('overview')
  const [cin, setCin] = useState(sp.get('in') || iso(addDays(today(), 14)))
  const [cout, setCout] = useState(sp.get('out') || iso(addDays(today(), 18)))
  const [rooms, setRooms] = useState(+sp.get('rooms') || 1)
  if (!h) return <div className="page"><Empty icon={BedDouble} title="الفندق غير موجود" /></div>
  const nights = Math.max(1, Math.round((new Date(cout) - new Date(cin)) / 864e5))
  const reviews = db.list('reviews').filter((r) => r.kind === 'hotel' && r.status === 'approved')
  const similar = db.list('hotels').filter((x) => x.city === h.city && x.id !== h.id).slice(0, 4)

  const book = (room, now) => {
    addToCart(hotelItem(h, room, cin, nights, rooms))
    if (now) nav('/checkout')
    else toast(`أُضيفت ${room.label} إلى السلة`, { label: 'عرض السلة', fn: () => setCartOpen(true) })
  }

  return (
    <div className="page">
      <div className="small muted mb-8"><Link to="/">الرئيسية</Link> / <Link to="/hotels">الفنادق</Link> / {h.name}</div>
      <div className="row between wrap top">
        <div className="col gap-4">
          <h1 style={{ fontSize: 28 }}>{h.name} <Stars n={h.stars} size={16} /></h1>
          <span className="muted small">{h.nameEn} · {CITY[h.city]}، {h.area}</span>
          <Score rating={h.rating} reviews={h.reviews} />
        </div>
        <div className="col" style={{ alignItems: 'flex-end' }}>
          <span className="price-big"><Price sar={h.rooms[0].price} /> <span className="small muted">/ ليلة</span></span>
          <div className="row"><SaveBtn kind="hotel" id={h.id} size="md" /><button className="btn btn-primary" onClick={() => setTab('rooms')}>اختر غرفتك</button></div>
        </div>
      </div>
      <div className="grid mt-16" style={{ gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: '140px 140px', gap: 8 }}>
        <Art src={hotelPhotos(h, 1000)[0]} alt={h.name} hue={h.hue} icon={BedDouble} h="100%" style={{ gridRow: 'span 2' }} />
        {['الغرف', 'الردهة', 'المطعم', h.stars === 5 ? 'المسبح' : 'الغرف'].map((l, i) => <Art key={i} src={hotelPhotos(h, 500)[i + 1]} alt={l} hue={h.hue + (i + 1) * 50} h="100%" label={l} />)}
      </div>
      <div className="mt-24"><Tabs tabs={[['overview', 'نظرة عامة'], ['rooms', 'الغرف والأسعار'], ['location', 'الموقع'], ['reviews', 'التقييمات'], ['amenities', 'المرافق'], ['policies', 'السياسات']]} value={tab} onChange={setTab} /></div>

      <div className="mt-16">
        {tab === 'overview' && (
          <div className="grid g-2">
            <div className="card pad col gap-12"><h3>عن الفندق</h3><p>{h.about}</p><div className="row wrap">{h.amenities.slice(0, 6).map((a) => <span key={a} className="badge">{a}</span>)}</div></div>
            <div className="grid g-2">
              <div className="card pad col" style={{ background: 'var(--green)', color: '#fff' }}><span className="price-big">{(h.rating * 2).toFixed(1)}</span><b>{scoreLabel(h.rating)}</b><span className="small">{h.reviews} تقييم</span></div>
              <div className="card pad col"><MapPin /><b>{h.distanceM} م</b><span className="small muted">من الحرم</span></div>
              <div className="card pad col"><ShieldCheck /><b>{h.freeCancel ? 'إلغاء مجاني' : 'حسب السياسة'}</b><span className="small muted">حتى 72 ساعة</span></div>
              <div className="card pad col"><Car /><b>نقل متاح</b><Link className="small" to="/transport">احجز مواصلات</Link></div>
            </div>
          </div>
        )}
        {tab === 'rooms' && (
          <div className="col gap-12">
            <div className="card pad-s searchbar">
              <div className="seg"><label>الوصول</label><input type="date" value={cin} min={iso(today())} onChange={(e) => { setCin(e.target.value); if (e.target.value >= cout) setCout(iso(addDays(e.target.value, 1))) }} /></div>
              <div className="seg"><label>المغادرة</label><input type="date" value={cout} min={iso(addDays(cin, 1))} onChange={(e) => setCout(e.target.value)} /></div>
              <div className="seg" style={{ maxWidth: 200 }}><label>الغرف</label><Counter value={rooms} min={1} max={6} onChange={setRooms} /></div>
            </div>
            {h.rooms.map((r) => (
              <article key={r.type} className="result">
                <div className="main-col row gap-16">
                  <Art src={photo('room', h.rooms.indexOf(r) + +h.id.slice(1), 400)} alt={r.label} hue={h.hue + 30} icon={BedDouble} h={100} style={{ width: 140, flexShrink: 0 }} />
                  <div className="col gap-4"><h3>{r.label}</h3><span className="small muted">حتى {r.capacity} أشخاص · {nights} ليالٍ · {rooms} غرفة</span>
                    <div className="row wrap"><span className="badge green"><Check size={12} />إفطار مشمول</span>{h.freeCancel && <span className="badge green">إلغاء مجاني</span>}</div></div>
                </div>
                <div className="price-col">
                  <span className="price-big"><Price sar={r.price} /></span>
                  <span className="xs muted">لليلة · الإجمالي <Price sar={r.price * nights * rooms} /> + ضرائب</span>
                  <button className="btn btn-primary btn-block" onClick={() => book(r, true)}>احجز</button>
                  <button className="btn btn-outline btn-block btn-sm" onClick={() => book(r, false)}>أضف للسلة</button>
                </div>
              </article>
            ))}
          </div>
        )}
        {tab === 'location' && <div className="card pad grid g-2"><HaramMap hotels={[h]} city={h.city} active={h.id} /><div className="col gap-8"><h3>الموقع</h3><p>{h.area}، {CITY[h.city]}</p><p className="muted">يبعد {h.distanceM} متر عن {h.city === 'makkah' ? 'المسجد الحرام' : 'المسجد النبوي'} — حوالي {Math.ceil(h.distanceM / 80)} دقيقة مشياً.</p></div></div>}
        {tab === 'reviews' && (
          <div className="grid" style={{ gridTemplateColumns: '260px 1fr' }}>
            <div className="card pad col"><span className="price-big">{(h.rating * 2).toFixed(1)}</span><b>{scoreLabel(h.rating)}</b>
              {[['الموقع', 9.4], ['النظافة', 8.6], ['الخدمة', 8.8], ['القيمة', 8.1]].map(([l, v]) => <div key={l}><div className="kv small"><span>{l}</span><b>{v}</b></div><div className="bar"><i style={{ width: v * 10 + '%' }} /></div></div>)}
            </div>
            <div className="col gap-12">{reviews.length ? reviews.map((r) => <div key={r.id} className="card pad"><div className="row"><span className="score">{r.rating * 2}</span><b>{r.name}</b></div><p className="mt-8">{r.text}</p></div>) : <div className="card"><Empty title="لا توجد تقييمات بعد" /></div>}</div>
          </div>
        )}
        {tab === 'amenities' && <div className="card pad grid g-3">{h.amenities.map((a) => <span key={a} className="row"><Check size={16} color="var(--green)" />{a}</span>)}</div>}
        {tab === 'policies' && <div className="card pad grid g-2"><div><b>تسجيل الدخول</b><p className="muted">من {h.checkIn}</p><b>تسجيل الخروج</b><p className="muted">حتى {h.checkOut}</p></div><div><b>الإلغاء والدفع المسبق</b><p className="muted">{h.freeCancel ? 'إلغاء مجاني حتى 72 ساعة قبل الوصول.' : 'تطبق سياسة الإلغاء العامة للمنصة.'}</p><b>الضرائب</b><p className="muted">ضريبة القيمة المضافة 15% ورسوم البلدية 5% تضاف عند الدفع.</p></div></div>}
      </div>

      <div className="section-title"><h2>قد يعجبك أيضاً</h2></div>
      <div className="grid g-4">
        {similar.map((x) => (
          <Link key={x.id} to={`/hotels/${x.id}`} className="card hover" style={{ overflow: 'hidden', color: 'var(--ink)', textDecoration: 'none' }}>
            <Art src={hotelPhotos(x, 500)[0]} alt={x.name} hue={x.hue} icon={BedDouble} h={120} radius={0} />
            <div style={{ padding: 12 }} className="col gap-4"><b>{x.name}</b><Stars n={x.stars} /><span><Price sar={x.rooms[0].price} /> <span className="muted xs">/ ليلة</span></span></div>
          </Link>
        ))}
      </div>
    </div>
  )
}
