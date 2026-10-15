import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BedDouble, Car, Check, Plane, Sparkles, Stamp } from 'lucide-react'
import { db } from '../lib/db'
import {
  addDays, addToCart, AIRPORTS, createLead, flightItem, hotelItem, money, searchFlights, today, trainItem, transportItem, vehiclePrice, visaItem,
} from '../lib/logic'
import { Counter, Field, Price, Stars, Stepper, useUI } from '../ui'

const iso = (d) => new Date(d).toISOString().slice(0, 10)
const STEPS = ['الرحلة', 'الطيران', 'التأشيرة', 'فندق مكة', 'فندق المدينة', 'التنقلات', 'المراجعة']

// Self-service version of the reference site's "flexible request":
// assemble flight + visa + hotels + transport with a live total.
export default function Builder() {
  const nav = useNavigate()
  const { toast } = useUI()
  const [s, setS] = useState(0)
  const [from, setFrom] = useState('CAI')
  const [arrive, setArrive] = useState('JED')
  const [start, setStart] = useState(iso(addDays(today(), 21)))
  const [mN, setMN] = useState(5)
  const [dN, setDN] = useState(4)
  const [pax, setPax] = useState(2)
  const [flight, setFlight] = useState(null)
  const [visa, setVisa] = useState(null)
  const [hm, setHm] = useState(null)
  const [hd, setHd] = useState(null)
  const [vehicle, setVehicle] = useState(null)
  const [train, setTrain] = useState(true)
  const rooms = Math.ceil(pax / 2)
  const hotels = db.list('hotels')
  const visas = db.list('visas').filter((v) => ['umrah', 'tourist'].includes(v.type) && v.country === 'السعودية')
  const flights = from === 'NONE' ? [] : searchFlights({ from, to: arrive, date: start }).sort((a, b) => a.price - b.price).slice(0, 5)
  const routes = db.list('routes')
  const fare = db.get('trainFares', 't1')
  const firstCity = arrive === 'MED' ? 'madinah' : 'makkah'
  const mStart = firstCity === 'makkah' ? start : iso(addDays(start, dN))
  const dStart = firstCity === 'madinah' ? start : iso(addDays(start, mN))

  const items = [
    flight && flightItem(flight, pax),
    visa && visaItem(visa, pax),
    hm && hotelItem(hm, hm.rooms[0], mStart, mN, rooms),
    hd && hotelItem(hd, hd.rooms[0], dStart, dN, rooms),
    vehicle && transportItem(vehicle, routes[0], start, '12:00'),
    train && trainItem(fare, 'economy', firstCity === 'makkah' ? dStart : mStart, '10:30', pax),
  ].filter(Boolean)
  const total = items.reduce((t, i) => t + i.unitPrice * i.qty, 0)

  const toCart = () => { items.forEach(addToCart); toast('أُضيفت رحلتك كاملة إلى السلة'); nav('/checkout') }
  const quote = () => { createLead('flexible', { from, arrive, start, nights: mN + dN, pax, items: items.map((i) => i.title), estimate: total }); toast('أرسلنا طلبك — سيصلك عرض مخصص خلال ساعات') }
  const pickCard = (on, onClick, children, key) => <button key={key} type="button" onClick={onClick} className={'radio-card' + (on ? ' on' : '')} style={{ background: 'var(--surface)', textAlign: 'start', width: '100%' }}>{children}</button>

  return (
    <div className="page">
      <span className="badge orange"><Sparkles size={13} />جديد</span>
      <h1 className="mt-8">صمّم رحلتك<span className="dot">.</span></h1>
      <p className="muted mb-16">اختر كل جزء من رحلتك بنفسك وشاهد السعر الإجمالي لحظياً — أو أرسلها لنا لنصمم لك عرضاً أفضل.</p>
      <div className="card pad mb-16"><Stepper steps={STEPS} current={s} /></div>
      <div className="checkout">
        <div className="card pad col gap-16">
          {s === 0 && (<>
            <h2>تفاصيل الرحلة</h2>
            <div className="grid g-2">
              <Field label="السفر من"><select className="select" value={from} onChange={(e) => setFrom(e.target.value)}><option value="NONE">داخل المملكة (بدون طيران)</option>{AIRPORTS.filter(([c]) => !['JED', 'MED'].includes(c)).map(([c, n]) => <option key={c} value={c}>{n}</option>)}</select></Field>
              <Field label="الوصول إلى"><select className="select" value={arrive} onChange={(e) => setArrive(e.target.value)}><option value="JED">جدة (مكة أولاً)</option><option value="MED">المدينة (المدينة أولاً)</option></select></Field>
              <Field label="تاريخ البداية"><input type="date" className="input" value={start} min={iso(today())} onChange={(e) => setStart(e.target.value)} /></Field>
              <Field label="المسافرون"><Counter value={pax} min={1} max={10} onChange={setPax} /></Field>
              <Field label="ليالي مكة"><Counter value={mN} min={1} max={20} onChange={setMN} /></Field>
              <Field label="ليالي المدينة"><Counter value={dN} min={0} max={20} onChange={setDN} /></Field>
            </div>
          </>)}
          {s === 1 && (<>
            <h2><Plane size={20} /> الطيران إلى {arrive === 'JED' ? 'جدة' : 'المدينة'}</h2>
            {from === 'NONE' ? <p className="muted">اخترت السفر من داخل المملكة — سننتقل للخطوة التالية.</p> : flights.map((f) => pickCard(flight?.id === f.id, () => setFlight(flight?.id === f.id ? null : f), (
              <div className="row between grow"><div><b className="ltr">{f.dep} – {f.arr}</b><div className="small muted">{f.airline} · {f.stops ? 'توقف واحد' : 'مباشر'}</div></div><b className="ltr">{money(f.price)}</b></div>
            ), f.id))}
          </>)}
          {s === 2 && (<>
            <h2><Stamp size={20} /> التأشيرة</h2>
            {pickCard(!visa, () => setVisa(null), <span>لدي تأشيرة / إقامة سارية</span>)}
            {visas.map((v) => pickCard(visa?.id === v.id, () => setVisa(v), <div className="row between grow"><div><b>{v.title}</b><div className="small muted">إصدار خلال {v.processingDays} أيام</div></div><b className="ltr">{money(v.fee)}</b></div>, v.id))}
          </>)}
          {(s === 3 || s === 4) && (() => {
            const city = s === 3 ? 'makkah' : 'madinah'
            const cur = s === 3 ? hm : hd
            const set = s === 3 ? setHm : setHd
            const n = s === 3 ? mN : dN
            return (<>
              <h2><BedDouble size={20} /> فندق {city === 'makkah' ? 'مكة المكرمة' : 'المدينة المنورة'} — {n} ليالٍ · {rooms} غرفة</h2>
              {!n ? <p className="muted">لا ليالي في هذه المدينة.</p> : hotels.filter((h) => h.city === city).sort((a, b) => a.distanceM - b.distanceM).map((h) => pickCard(cur?.id === h.id, () => set(cur?.id === h.id ? null : h), (
                <div className="row between grow"><div><b>{h.name}</b><div className="small muted row"><Stars n={h.stars} size={11} /> · {h.distanceM} م من الحرم</div></div><div className="col gap-0" style={{ alignItems: 'flex-end' }}><b className="ltr">{money(h.rooms[0].price * n * rooms)}</b><span className="xs muted ltr">{money(h.rooms[0].price)} / ليلة</span></div></div>
              ), h.id))}
            </>)
          })()}
          {s === 5 && (<>
            <h2><Car size={20} /> التنقلات</h2>
            <p className="small muted">استقبال من المطار: {routes[0].from} → {routes[0].to}</p>
            {pickCard(!vehicle, () => setVehicle(null), <span>بدون استقبال خاص</span>)}
            {db.list('vehicles').filter((v) => v.passengers >= pax).slice(0, 3).map((v) => pickCard(vehicle?.id === v.id, () => setVehicle(v), <div className="row between grow"><span>{v.name} · حتى {v.passengers} ركاب</span><b className="ltr">{money(vehiclePrice(v, routes[0]))}</b></div>, v.id))}
            {dN > 0 && <label className="check row between"><span className="row"><input type="checkbox" checked={train} onChange={(e) => setTrain(e.target.checked)} />قطار الحرمين بين مكة والمدينة ({pax} مقعد)</span><b className="ltr">{money(fare.economy * pax)}</b></label>}
          </>)}
          {s === 6 && (<>
            <h2>مراجعة رحلتك</h2>
            {items.map((i, k) => <div key={k} className="kv"><span><Check size={15} color="var(--green)" /> {i.title}<div className="xs muted">{i.subtitle}</div></span><b className="ltr nowrap">{money(i.unitPrice * i.qty)}</b></div>)}
            {!items.length && <p className="muted">لم تختر أي خدمة بعد.</p>}
          </>)}
          <div className="row between mt-16">
            <button className="btn btn-outline" disabled={!s} onClick={() => setS(s - 1)}>السابق</button>
            {s < 6 ? <button className="btn btn-dark" onClick={() => setS(s === 0 && from === 'NONE' ? 2 : s + 1)}>{s === 1 && !flight && from !== 'NONE' ? 'تخطي' : 'التالي'}</button> : <div className="row"><button className="btn btn-outline" onClick={quote} disabled={!items.length}>اطلب عرضاً أفضل</button><button className="btn btn-primary" disabled={!items.length} onClick={toCart}>احجز الرحلة</button></div>}
          </div>
        </div>
        <aside className="summary card pad col gap-8">
          <h3>رحلتك</h3>
          <span className="small muted">{start} · {mN + dN} ليالٍ · {pax} مسافر</span>
          {items.map((i, k) => <div key={k} className="kv small"><span>{i.title}</span><span className="ltr nowrap">{money(i.unitPrice * i.qty)}</span></div>)}
          <div className="kv total"><span>الإجمالي التقديري</span><Price sar={total} /></div>
          <span className="xs muted">للفرد تقريباً <Price sar={total / pax} /> · الضرائب تُحتسب عند الدفع</span>
        </aside>
      </div>
    </div>
  )
}
