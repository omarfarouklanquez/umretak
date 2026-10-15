import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeftRight, Briefcase, Check, Luggage, Plane, Search, TrendingUp, X } from 'lucide-react'
import { db } from '../lib/db'
import { addDays, addToCart, AIRPORTS, airportName, currentUser, flightItem, money, searchFlights, today } from '../lib/logic'
import { Counter, Empty, mins, Modal, Price, Toggle, useUI } from '../ui'
import { CheckList, FilterBlock } from './Packages'

const iso = (d) => new Date(d).toISOString().slice(0, 10)

export default function FlightsPage() {
  const [sp, setSp] = useSearchParams()
  const nav = useNavigate()
  const { toast, setCartOpen, openAuth } = useUI()
  const [from, setFrom] = useState(sp.get('from') || 'CAI')
  const [to, setTo] = useState(sp.get('to') || 'JED')
  const [date, setDate] = useState(sp.get('date') || iso(addDays(today(), 10)))
  const [pax, setPax] = useState(+sp.get('pax') || 1)
  const [cabin, setCabin] = useState(sp.get('cabin') || 'economy')
  const [stops, setStops] = useState(['0', '1'])
  const [airlines, setAirlines] = useState([])
  const [bagOnly, setBagOnly] = useState(false)
  const [sort, setSort] = useState('best')
  const [fare, setFare] = useState(null)
  const q = { from: sp.get('from'), to: sp.get('to'), date: sp.get('date'), cabin: sp.get('cabin') || 'economy' }
  const results = useMemo(() => searchFlights(q), [q.from, q.to, q.date, q.cabin])
  const allAir = [...new Set(results.map((f) => f.airline))]
  const list = results
    .filter((f) => stops.includes(String(f.stops)) && (!airlines.length || airlines.includes(f.airline)) && (!bagOnly || f.bag))
    .sort({ price: (a, b) => a.price - b.price, quick: (a, b) => a.mins - b.mins, best: (a, b) => a.price / 10 + a.mins - (b.price / 10 + b.mins) }[sort])
  const cheapest = [...list].sort((a, b) => a.price - b.price)[0]
  const quickest = [...list].sort((a, b) => a.mins - b.mins)[0]
  const best = [...list].sort((a, b) => a.price / 10 + a.mins - (b.price / 10 + b.mins))[0]
  const alertKey = `${q.from}-${q.to}-${q.date}`
  const alert = db.list('alerts').find((a) => a.key === alertKey && a.userId === currentUser()?.id)

  const search = (e) => { e?.preventDefault(); setSp({ from, to, date, pax, cabin }) }
  const strip = q.date ? [-3, -2, -1, 0, 1, 2, 3].map((d) => { const dd = iso(addDays(q.date, d)); const r = searchFlights({ ...q, date: dd }); return { dd, p: Math.min(...r.map((f) => f.price)) } }).filter((x) => x.dd >= iso(today())) : []
  const lo = Math.min(...strip.map((s) => s.p)), hi = Math.max(...strip.map((s) => s.p))

  const toggleAlert = () => {
    if (!currentUser()) return openAuth(toggleAlert)
    if (alert) { db.remove('alerts', alert.id); toast('تم إيقاف تتبع السعر') }
    else { db.insert('alerts', { key: alertKey, userId: currentUser().id, label: `${airportName(q.from)} → ${airportName(q.to)}`, date: q.date, price: cheapest?.price }); toast('بدأ التتبع — سننبهك عند تغير السعر') }
  }
  const choose = (f, plus) => {
    addToCart(flightItem({ ...f, price: f.price + (plus ? 150 : 0), fare: plus ? 'standard' : 'basic' }, pax))
    setFare(null)
    toast('أُضيفت الرحلة إلى السلة', { label: 'إتمام الحجز', fn: () => nav('/checkout') })
    setCartOpen(false)
  }

  return (
    <div className="page">
      <form className="card pad-s searchbar mb-16" onSubmit={search}>
        <div className="seg"><label>من</label><select value={from} onChange={(e) => setFrom(e.target.value)}>{AIRPORTS.map(([c, n]) => <option key={c} value={c}>{n} ({c})</option>)}</select></div>
        <button type="button" className="btn btn-soft btn-icon" style={{ alignSelf: 'center' }} onClick={() => { setFrom(to); setTo(from) }} aria-label="تبديل"><ArrowLeftRight size={16} /></button>
        <div className="seg"><label>إلى</label><select value={to} onChange={(e) => setTo(e.target.value)}>{AIRPORTS.map(([c, n]) => <option key={c} value={c}>{n} ({c})</option>)}</select></div>
        <div className="seg"><label>التاريخ</label><input type="date" value={date} min={iso(today())} onChange={(e) => setDate(e.target.value)} /></div>
        <div className="seg" style={{ maxWidth: 170 }}><label>المسافرون</label><Counter value={pax} min={1} max={9} onChange={setPax} /></div>
        <div className="seg" style={{ maxWidth: 150 }}><label>الدرجة</label><select value={cabin} onChange={(e) => setCabin(e.target.value)}><option value="economy">سياحية</option><option value="business">رجال الأعمال</option></select></div>
        <button className="search-go" aria-label="بحث"><Search size={22} /></button>
      </form>

      {!q.from ? <div className="card"><Empty icon={Plane} title="ابحث عن رحلتك المثالية" text="حدد مطار المغادرة والوصول والتاريخ ثم اضغط بحث." /></div> : (
        <div className="results">
          <aside className="filters col gap-12">
            <div className="card pad-s col">
              <span className="row semi"><TrendingUp size={18} color="var(--green)" />{cheapest && cheapest.price < 800 ? 'احجز الآن' : 'انتظر قليلاً'}</span>
              <span className="small muted">{cheapest && cheapest.price < 800 ? 'نتوقع ارتفاع الأسعار خلال الأيام القادمة.' : 'قد تنخفض الأسعار — فعّل التتبع.'}</span>
              <hr className="divider" style={{ margin: '6px 0' }} />
              <div className="row between"><b className="small">تتبع الأسعار</b><Toggle on={!!alert} onChange={toggleAlert} label="تتبع الأسعار" /></div>
            </div>
            <div className="card pad-s">
              <b>{list.length} من {results.length} رحلة</b>
              <FilterBlock title="التوقف"><CheckList options={[['0', 'مباشر'], ['1', 'توقف واحد']]} value={stops} onChange={setStops} counts={{ 0: results.filter((f) => !f.stops).length, 1: results.filter((f) => f.stops).length }} /></FilterBlock>
              <FilterBlock title="شركات الطيران"><CheckList options={allAir.map((a) => [a, a])} value={airlines} onChange={setAirlines} /></FilterBlock>
              <label className="check row between" style={{ paddingTop: 12 }}><span>تشمل حقيبة مسجلة</span><input type="checkbox" checked={bagOnly} onChange={(e) => setBagOnly(e.target.checked)} /></label>
            </div>
          </aside>
          <div className="col gap-12">
            <div className="row" style={{ overflowX: 'auto' }}>
              {strip.map((s) => (
                <button key={s.dd} onClick={() => { setDate(s.dd); setSp({ ...Object.fromEntries(sp), date: s.dd }) }} className="card"
                  style={{ padding: '8px 12px', cursor: 'pointer', minWidth: 96, border: s.dd === q.date ? '2px solid var(--dark)' : undefined, background: s.p === lo ? 'var(--green-soft)' : s.p === hi ? 'var(--red-soft)' : 'var(--surface)' }}>
                  <div className="xs muted">{new Date(s.dd).toLocaleDateString('ar-EG', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
                  <b className="small ltr">{money(s.p)}</b>
                </button>
              ))}
            </div>
            <div className="sorttabs">
              {[['price', 'الأرخص', cheapest], ['best', 'الأفضل', best], ['quick', 'الأسرع', quickest]].map(([k, l, f]) => (
                <button key={k} className={'sorttab' + (sort === k ? ' on' : '')} onClick={() => setSort(k)}><b>{l}</b><span>{f ? `${money(f.price)} · ${mins(f.mins)}` : '—'}</span></button>
              ))}
            </div>
            {!list.length && <div className="card"><Empty icon={Plane} title="لا توجد رحلات مطابقة" text="جرّب تاريخاً آخر أو أزل بعض الفلاتر." /></div>}
            {list.map((f) => (
              <article key={f.id} className="result">
                <div className="main-col col gap-12">
                  <div className="row wrap">{f === best && <span className="badge blue">الأفضل</span>}{f === cheapest && <span className="badge green">الأرخص</span>}{f.seatsLeft < 4 && <span className="badge red">{f.seatsLeft} مقاعد بهذا السعر</span>}</div>
                  <div className="row gap-16 wrap">
                    <span className="avatar" style={{ background: 'var(--dark)', color: '#fff' }}>{f.code}</span>
                    <div className="col gap-0"><b style={{ fontSize: 18 }} className="ltr">{f.dep} – {f.arr}</b><span className="small muted">{f.airline}</span></div>
                    <div className="col gap-0 grow center"><b className="small">{f.stops ? 'توقف واحد' : 'مباشر'}</b><span className="xs muted">{f.from} ← {f.to}</span></div>
                    <div className="col gap-0"><b>{mins(f.mins)}</b><span className="xs muted">{airportName(f.from)} → {airportName(f.to)}</span></div>
                  </div>
                  <div className="row small muted gap-16"><span className="row"><Briefcase size={15} />حقيبة يد</span><span className="row">{f.bag ? <Luggage size={15} color="var(--green)" /> : <X size={15} color="var(--red)" />}{f.bag ? `حقيبة ${f.bag} كجم` : 'بدون حقيبة مسجلة'}</span></div>
                </div>
                <div className="price-col">
                  <span className="price-big"><Price sar={f.price} /></span>
                  <span className="xs muted">{cabin === 'business' ? 'رجال الأعمال' : 'سياحية'} · للفرد</span>
                  <button className="btn btn-primary btn-block" onClick={() => setFare(f)}>اختر</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
      {fare && (
        <Modal wide onClose={() => setFare(null)} title="اختر نوع التذكرة">
          <div className="grid g-2">
            {[[false, 'الأساسية', ['حقيبة يد 7 كجم', fare.bag ? `حقيبة ${fare.bag} كجم` : 'بدون حقيبة مسجلة', 'اختيار المقعد برسوم'], ['تغيير التذكرة', 'استرداد']],
              [true, 'المرنة', ['حقيبة يد 7 كجم', 'حقيبة 23 كجم', 'اختيار مقعد مجاني', 'تغيير مجاني مرة واحدة'], ['استرداد كامل']]].map(([plus, l, yes, no]) => (
              <div key={l} className="card pad col gap-8">
                <div className="row between"><h3>{l}</h3><b className="ltr">{money(fare.price + (plus ? 150 : 0))}</b></div>
                {yes.map((y) => <span key={y} className="row small"><Check size={15} color="var(--green)" />{y}</span>)}
                {no.map((n) => <span key={n} className="row small muted"><X size={15} />{n}</span>)}
                <button className={'btn btn-block mt-8 ' + (plus ? 'btn-primary' : 'btn-dark')} onClick={() => choose(fare, plus)}>اختيار — {pax} مسافر</button>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  )
}
