import { photo, tourPhoto, vehiclePhoto, visaPhoto } from '../lib/media'
import GeoMap, { HARAM, STATION_LATLNG } from '../GeoMap'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Car, Check, Clock, FileText, Luggage, MapPinned, Stamp, TrainFront, Users } from 'lucide-react'
import { db } from '../lib/db'
import { addDays, addToCart, money, today, tourItem, trainItem, transportItem, vehiclePrice, visaItem } from '../lib/logic'
import { STATIONS, TRAIN_TIMES } from '../lib/seed'
import { Art, Chips, Counter, Empty, Field, mins, Modal, Price, Stars, useUI } from '../ui'
import { CheckList, FilterBlock } from './Packages'

const iso = (d) => new Date(d).toISOString().slice(0, 10)
const useAdded = () => {
  const { toast, setCartOpen } = useUI()
  return (msg = 'أُضيفت إلى السلة') => toast(msg, { label: 'عرض السلة', fn: () => setCartOpen(true) })
}

/* ---------------------------------------------------------------- visas */
const VTYPE = { umrah: 'عمرة', tourist: 'سياحية', transit: 'ترانزيت', visit: 'زيارة', barcode: 'باركود' }
export function VisaPage() {
  const [sp] = useSearchParams()
  const all = db.list('visas')
  const added = useAdded()
  const [types, setTypes] = useState(sp.get('type') ? [sp.get('type')] : [])
  const [country, setCountry] = useState('')
  const [entry, setEntry] = useState([])
  const [fast, setFast] = useState(false)
  const [sort, setSort] = useState('rec')
  const [reqs, setReqs] = useState(null)
  const [apply, setApply] = useState(null)
  const [people, setPeople] = useState(1)
  const list = all.filter((v) => (!types.length || types.includes(v.type)) && (!country || v.country === country) && (!entry.length || entry.includes(v.entry)) && (!fast || v.processingDays <= 3))
    .sort({ rec: () => 0, fast: (a, b) => a.processingDays - b.processingDays, cheap: (a, b) => a.fee - b.fee }[sort])
  return (
    <div className="page">
      <h1>التأشيرات<span className="dot">.</span></h1>
      <p className="muted mb-16">معالجة سريعة وموثوقة لتأشيرات العمرة والسياحة والزيارة — متطلبات ومدد إصدار واضحة.</p>
      <div className="results">
        <aside className="filters card pad-s" tabIndex={0} aria-label="الفلاتر">
          <b>{list.length} من {all.length} تأشيرة</b>
          <FilterBlock title="النوع"><CheckList options={Object.entries(VTYPE)} value={types} onChange={setTypes} /></FilterBlock>
          <FilterBlock title="الدولة"><select className="select" value={country} onChange={(e) => setCountry(e.target.value)}><option value="">جميع الدول</option>{[...new Set(all.map((v) => v.country))].map((c) => <option key={c}>{c}</option>)}</select></FilterBlock>
          <FilterBlock title="نوع الدخول"><CheckList options={[['single', 'سفرة واحدة'], ['multiple', 'دخول متعدد']]} value={entry} onChange={setEntry} /></FilterBlock>
          <label className="check row between" style={{ paddingTop: 12 }}><span>إصدار خلال 3 أيام</span><input type="checkbox" checked={fast} onChange={(e) => setFast(e.target.checked)} /></label>
        </aside>
        <div className="col gap-12">
          <div className="row between"><span className="small muted">ترتيب</span><Chips options={[['rec', 'الموصى به'], ['fast', 'الأسرع إصداراً'], ['cheap', 'الأقل رسوماً']]} value={sort} onChange={(v) => v && setSort(v)} /></div>
          {!list.length && <div className="card"><Empty icon={Stamp} title="لا توجد تأشيرات مطابقة" /></div>}
          {list.map((v) => (
            <article key={v.id} className="result">
              <div className="main-col col gap-12">
                <div className="row"><span className="badge">{v.country}</span><span className="badge blue">{VTYPE[v.type]}</span><span className={'badge ' + (v.mode === 'electronic' ? 'green' : 'amber')}>{v.mode === 'electronic' ? 'إلكترونية — بدون بصمة' : 'تتطلب بصمة'}</span></div>
                <div className="row gap-12"><Art src={visaPhoto(v, 200)} alt="" icon={Stamp} hue={200} h={64} style={{ width: 64, flexShrink: 0 }} /><h3>{v.title}</h3></div>
                <div className="grid g-4 small" style={{ gap: 8 }}>
                  <div><span className="muted xs">الدخول</span><div className="semi">{v.entry === 'single' ? 'سفرة واحدة' : 'متعدد'}</div></div>
                  <div><span className="muted xs">مدة الإقامة</span><div className="semi">{v.stayDays} يوم</div></div>
                  <div><span className="muted xs">الصلاحية</span><div className="semi">{v.validityDays} يوم</div></div>
                  <div><span className="muted xs">المعالجة</span><div className="semi">{v.processingDays} أيام</div></div>
                </div>
                <button className="btn btn-link small" style={{ alignSelf: 'flex-start' }} onClick={() => setReqs(v)}><FileText size={15} />عرض المتطلبات ({v.requirements.length})</button>
              </div>
              <div className="price-col">
                <span className="muted xs">رسوم المعالجة</span>
                <span className="price-big"><Price sar={v.fee} /></span>
                <button className="btn btn-primary btn-block" onClick={() => { setPeople(1); setApply(v) }}>قدّم الآن</button>
              </div>
            </article>
          ))}
        </div>
      </div>
      {reqs && <Modal onClose={() => setReqs(null)} title="المتطلبات"><div className="col">{reqs.requirements.map((r) => <span key={r} className="row"><Check size={16} color="var(--green)" />{r}</span>)}</div></Modal>}
      {apply && (
        <Modal onClose={() => setApply(null)} title={apply.title}>
          <div className="col gap-12">
            <div className="notice">ستُطلب بيانات الجواز لكل متقدم في خطوة بيانات المسافرين عند الدفع.</div>
            <div className="row between"><b>عدد المتقدمين</b><Counter value={people} min={1} max={10} onChange={setPeople} /></div>
            <div className="kv total"><span>الإجمالي</span><Price sar={apply.fee * people} /></div>
            <button className="btn btn-primary btn-lg" onClick={() => { addToCart(visaItem(apply, people)); setApply(null); added() }}>أضف للسلة</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

/* ------------------------------------------------------------ transport */
const CLS = { sedan: 'سيدان', vip: 'VIP', van: 'فان', minibus: 'حافلة صغيرة', bus: 'باص' }
export function TransportPage() {
  const routes = db.list('routes')
  const added = useAdded()
  const [routeId, setRouteId] = useState(routes[0].id)
  const [date, setDate] = useState(iso(addDays(today(), 7)))
  const [time, setTime] = useState('10:00')
  const [pax, setPax] = useState(4)
  const [cls, setCls] = useState('')
  const route = routes.find((r) => r.id === routeId)
  const vs = db.list('vehicles').filter((v) => v.passengers >= pax && (!cls || v.cls === cls))
  return (
    <div className="page">
      <h1>النقل الخاص<span className="dot">.</span></h1>
      <p className="muted mb-16">سيارات VIP وفانات وحافلات بسائقين محترفين بين المطارات والفنادق والمدن — بسعر ثابت للمسار.</p>
      <div className="card pad-s searchbar mb-16">
        <div className="seg"><label>المسار</label><select value={routeId} onChange={(e) => setRouteId(e.target.value)}>{routes.map((r) => <option key={r.id} value={r.id}>{r.from} → {r.to}</option>)}</select></div>
        <div className="seg"><label>التاريخ</label><input type="date" value={date} min={iso(today())} onChange={(e) => setDate(e.target.value)} /></div>
        <div className="seg" style={{ maxWidth: 140 }}><label>الوقت</label><input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></div>
        <div className="seg" style={{ maxWidth: 180 }}><label>الركاب</label><Counter value={pax} min={1} max={50} onChange={setPax} /></div>
      </div>
      <div className="row between wrap mb-16"><span className="small muted">{route.km} كم · {vs.length} مركبة مناسبة</span><Chips options={[['', 'الكل'], ...Object.entries(CLS)]} value={cls} onChange={setCls} /></div>
      {!vs.length && <div className="card"><Empty icon={Car} title="لا توجد مركبة بهذه السعة" text="قلّل عدد الركاب أو اختر فئة أخرى." /></div>}
      <div className="grid g-3">
        {vs.map((v) => (
          <div key={v.id} className="card" style={{ overflow: 'hidden' }}>
            <Art src={vehiclePhoto(v, 600)} alt={v.name} hue={v.hue} icon={Car} h={160} radius={0} label={CLS[v.cls]} />
            <div className="pad col gap-8">
              <h3>{v.name}</h3>
              <div className="row small gap-16"><span className="row"><Users size={15} />{v.passengers} ركاب</span><span className="row"><Luggage size={15} />{v.bags} حقائب</span></div>
              <div className="row wrap">{v.features.map((f) => <span key={f} className="badge">{f}</span>)}</div>
              <div className="row between mt-8"><span className="price-big" style={{ fontSize: 22 }}><Price sar={vehiclePrice(v, route)} /></span><span className="xs muted">للرحلة</span></div>
              <button className="btn btn-primary btn-block" onClick={() => { addToCart(transportItem(v, route, date, time)); added() }}>اختيار المركبة</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- train */
export function TrainPage() {
  const fares = db.list('trainFares')
  const added = useAdded()
  const [from, setFrom] = useState(STATIONS[0])
  const [to, setTo] = useState(STATIONS[4])
  const [date, setDate] = useState(iso(addDays(today(), 5)))
  const [pax, setPax] = useState(2)
  const [cls, setCls] = useState('economy')
  const fare = fares.find((f) => (f.from === from && f.to === to) || (f.from === to && f.to === from))
  return (
    <div className="page">
      <div className="photo-hero mb-16" style={{ minHeight: 240 }}>
        <Art src={photo('train', 1, 1400)} alt="قطار سريع" hue={160} h="100%" className="shade" />
        <div className="inner"><span className="badge orange">300 كم/ساعة</span><h1 className="mt-8" style={{ color: '#fff' }}>قطار الحرمين السريع<span className="dot">.</span></h1><p style={{ opacity: .85 }}>خمس محطات، رحلات يومية، ودرجتان — بتأكيد فوري.</p></div>
      </div>
      <div className="card pad-s searchbar mb-16">
        <div className="seg"><label>من</label><select value={from} onChange={(e) => setFrom(e.target.value)}>{STATIONS.map((s) => <option key={s}>{s}</option>)}</select></div>
        <div className="seg"><label>إلى</label><select value={to} onChange={(e) => setTo(e.target.value)}>{STATIONS.map((s) => <option key={s}>{s}</option>)}</select></div>
        <div className="seg"><label>التاريخ</label><input type="date" value={date} min={iso(today())} onChange={(e) => setDate(e.target.value)} /></div>
        <div className="seg" style={{ maxWidth: 170 }}><label>الركاب</label><Counter value={pax} min={1} max={9} onChange={setPax} /></div>
        <div className="seg" style={{ maxWidth: 170 }}><label>الدرجة</label><select value={cls} onChange={(e) => setCls(e.target.value)}><option value="economy">اقتصادية</option><option value="business">رجال الأعمال</option></select></div>
      </div>
      {!fare ? <div className="card"><Empty icon={TrainFront} title="لا توجد رحلة مباشرة بين المحطتين" text="اختر محطتين مختلفتين على نفس الخط." /></div> : (
        <div className="col gap-8">
          {TRAIN_TIMES.map((t, i) => {
            const left = (i * 37 + date.length * 3) % 60
            const [h, m] = t.split(':').map(Number)
            const arr = h * 60 + m + fare.mins
            return (
              <div key={t} className="result">
                <div className="main-col row gap-16 wrap">
                  <TrainFront />
                  <b className="ltr" style={{ fontSize: 18 }}>{t} – {String(Math.floor(arr / 60) % 24).padStart(2, '0')}:{String(arr % 60).padStart(2, '0')}</b>
                  <span className="muted small grow">{from} → {to} · {mins(fare.mins)} · مباشر</span>
                  {left < 12 ? <span className="badge red">{left || 'لا'} مقاعد</span> : <span className="badge green">متاح</span>}
                </div>
                <div className="price-col"><span className="price-big" style={{ fontSize: 22 }}><Price sar={fare[cls] * pax} /></span><span className="xs muted">{pax} راكب</span>
                  <button className="btn btn-primary btn-block" disabled={left === 0} onClick={() => { addToCart(trainItem({ ...fare, from, to }, cls, date, t, pax)); added() }}>احجز</button></div>
              </div>
            )
          })}
        </div>
      )}
      <div className="section-title"><h2>محطات قطار الحرمين</h2></div>
      <div className="card pad-s">
        <GeoMap height={380} active={from}
          markers={[...STATIONS.map((s) => ({ id: s, latlng: STATION_LATLNG[s], label: s, title: s, type: 'station' })), ...Object.entries(HARAM).map(([c, x]) => ({ id: 'haram-' + c, latlng: x.latlng, title: x.name, type: 'haram' }))]}
          onPick={(s) => (s === from ? setTo(s) : setFrom(s))}
          line={['مكة المكرمة (الرصيفة)', 'جدة (السليمانية)', 'مطار جدة (KAIA)', 'رابغ (KAEC)', 'المدينة المنورة'].map((s) => STATION_LATLNG[s])} />
        <p className="xs muted mt-8">اضغط على محطة لتعيينها كمحطة مغادرة. المواقع تقريبية.</p>
      </div>
      <div className="section-title"><h2>أسعار التذاكر التقريبية</h2></div>
      <div className="card table-wrap"><table className="table"><thead><tr><th>المسار</th><th>اقتصادية</th><th>رجال الأعمال</th><th>المدة</th></tr></thead>
        <tbody>{fares.map((f) => <tr key={f.id}><td>{f.from} ↔ {f.to}</td><td><Price sar={f.economy} /></td><td><Price sar={f.business} /></td><td>{mins(f.mins)}</td></tr>)}</tbody></table></div>
    </div>
  )
}

/* ---------------------------------------------------------------- tours */
export function ToursPage() {
  const added = useAdded()
  const [city, setCity] = useState('')
  const [pick, setPick] = useState(null)
  const [date, setDate] = useState(iso(addDays(today(), 3)))
  const [people, setPeople] = useState(2)
  const list = db.list('tours').filter((t) => !city || t.city === city)
  return (
    <div className="page">
      <div className="photo-hero mb-16" style={{ minHeight: 240 }}>
        <Art src={photo('madinah', 2, 1400)} alt="المسجد النبوي" hue={30} h="100%" className="shade" />
        <div className="inner"><h1 style={{ color: '#fff' }}>جولات المواقع المقدسة<span className="dot">.</span></h1><p style={{ opacity: .85 }}>جولات دينية وتاريخية مع مرشدين معتمدين — انطلاق من فندقك وعودة إليه.</p></div>
      </div>
      <div className="mb-16"><Chips options={[['', 'كل المواقع'], ['makkah', 'مكة المكرمة'], ['madinah', 'المدينة المنورة']]} value={city} onChange={setCity} /></div>
      <div className="grid g-3">
        {list.map((t) => (
          <div key={t.id} className="card" style={{ overflow: 'hidden' }}>
            <Art src={tourPhoto(t, 600)} alt={t.title} hue={t.hue} icon={MapPinned} h={170} radius={0} label={t.city === 'makkah' ? 'مكة' : 'المدينة'} />
            <div className="pad col gap-8">
              <div className="row"><Stars n={5} size={11} /><span className="small">{t.rating}</span></div>
              <h3>{t.title}</h3>
              <div className="row small gap-16 muted"><span className="row"><Clock size={14} />{t.hours} ساعات</span><span className="row"><Users size={14} />حتى {t.maxGroup}</span></div>
              <div className="timeline small">{t.stops.map((s) => <div key={s} className="tl-item" style={{ paddingBottom: 6 }}>{s}</div>)}</div>
              <div className="row between"><b><Price sar={t.price} /> <span className="xs muted">/ للفرد</span></b><button className="btn btn-primary" onClick={() => setPick(t)}>احجز</button></div>
            </div>
          </div>
        ))}
      </div>
      {pick && (
        <Modal onClose={() => setPick(null)} title={pick.title}>
          <div className="col gap-12">
            <Field label="تاريخ الجولة"><input type="date" className="input" value={date} min={iso(today())} onChange={(e) => setDate(e.target.value)} /></Field>
            <div className="row between"><b>عدد الأشخاص</b><Counter value={people} min={1} max={pick.maxGroup} onChange={setPeople} /></div>
            <div className="kv total"><span>الإجمالي</span><span className="ltr">{money(pick.price * people)}</span></div>
            <button className="btn btn-primary btn-lg" onClick={() => { addToCart(tourItem(pick, date, people)); setPick(null); added() }}>أضف للسلة</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
