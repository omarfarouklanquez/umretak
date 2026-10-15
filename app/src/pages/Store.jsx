import { productPhoto } from '../lib/media'
import { Ihram, Lantern, Star8, Tasbih, Zamzam } from '../icons'
import { Backpack, BatteryCharging, SprayCan, Sparkle } from 'lucide-react'
const CAT_ICON = { ihram: Ihram, zamzam: Zamzam, worship: Tasbih, perfume: SprayCan, gifts: Lantern, travel: Backpack, care: Sparkle, tech: BatteryCharging }
import { useState } from 'react'
import { ShoppingBag, Star, Truck } from 'lucide-react'
import { db } from '../lib/db'
import { addToCart, productItem } from '../lib/logic'
import { PRODUCT_CATS } from '../lib/seed'
import { Art, Chips, Counter, Empty, Field, Modal, Price, SaveBtn, useUI } from '../ui'

export default function StorePage() {
  const { toast, setCartOpen } = useUI()
  const all = db.list('products')
  const [cat, setCat] = useState('')
  const [tags, setTags] = useState([])
  const [sale, setSale] = useState(false)
  const [sort, setSort] = useState('pop')
  const [q, setQ] = useState('')
  const [view, setView] = useState(null)
  const [opts, setOpts] = useState({})
  const [qty, setQty] = useState(1)
  const allTags = [...new Set(all.flatMap((p) => p.tags))]
  const list = all.filter((p) => (!cat || p.cat === cat) && tags.every((t) => p.tags.includes(t)) && (!sale || p.compareAt) && p.name.includes(q.trim()))
    .sort({ pop: (a, b) => b.reviews - a.reviews, low: (a, b) => a.price - b.price, high: (a, b) => b.price - a.price, rating: (a, b) => b.rating - a.rating }[sort])

  const open = (p) => { setView(p); setQty(1); setOpts(Object.fromEntries(Object.entries(p.variants || {}).map(([k, v]) => [k, v[0]]))) }
  const add = (p, o = {}, n = 1) => {
    if (p.stock < n) return toast('الكمية غير متوفرة')
    addToCart(productItem(p, o, n))
    setView(null)
    toast('أُضيف إلى السلة', { label: 'عرض السلة', fn: () => setCartOpen(true) })
  }

  return (
    <div className="page">
      <div className="row between wrap">
        <div><h1>المتجر<span className="dot">.</span></h1><p className="muted">إحرام، أدوات الصلاة، زمزم، هدايا — مع توصيل مجاني لفنادق مكة والمدينة.</p></div>
        <span className="badge green"><Truck size={14} />توصيل لفندقك خلال 24 ساعة</span>
      </div>
      <div className="grid mt-16" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(104px, 1fr))', gap: 10 }}>
        {[['', 'الكل', Star8], ...Object.entries(PRODUCT_CATS).map(([k, l]) => [k, l, CAT_ICON[k]])].map(([k, l, Ico]) => (
          <button key={k} onClick={() => setCat(k)} className={'card col center' + (cat === k ? ' on' : '')} style={{ padding: '14px 6px', cursor: 'pointer', alignItems: 'center', gap: 6, borderColor: cat === k ? 'var(--dark)' : undefined, boxShadow: cat === k ? 'inset 0 0 0 1px var(--dark)' : undefined }}>
            <Ico size={28} color={cat === k ? 'var(--brand-2)' : 'var(--ink)'} /><span className="xs semi">{l}</span>
          </button>
        ))}
      </div>
      <div className="row wrap between mt-16">
        <div className="row wrap"><span className="small muted">يناسب:</span><Chips multi options={allTags.map((t) => [t, t])} value={tags} onChange={setTags} /><button className={'chip' + (sale ? ' on' : '')} onClick={() => setSale(!sale)}>عليه خصم</button></div>
        <div className="row"><input className="input" style={{ width: 200, height: 36 }} placeholder="ابحث في المتجر" value={q} onChange={(e) => setQ(e.target.value)} aria-label="بحث في المتجر" />
          <select className="select" style={{ width: 150, height: 36 }} value={sort} onChange={(e) => setSort(e.target.value)} aria-label="ترتيب"><option value="pop">الأكثر طلباً</option><option value="low">السعر: الأقل</option><option value="high">السعر: الأعلى</option><option value="rating">الأعلى تقييماً</option></select></div>
      </div>
      <p className="small muted mt-16">{list.length} منتج</p>
      {!list.length && <div className="card mt-16"><Empty icon={ShoppingBag} title="لا توجد منتجات مطابقة" /></div>}
      <div className="grid g-4 mt-8">
        {list.map((p) => (
          <div key={p.id} className="card col gap-0" style={{ overflow: 'hidden' }}>
            <div style={{ position: 'relative' }}>
              <Art src={productPhoto(p, 500)} alt={p.name} hue={p.hue} icon={ShoppingBag} h={170} radius={0} />
              <div className="row" style={{ position: 'absolute', top: 8, insetInlineStart: 8 }}>{p.featured && <span className="badge dark">مميز</span>}{p.compareAt && <span className="badge red">-{Math.round((1 - p.price / p.compareAt) * 100)}%</span>}</div>
              <button className="btn btn-sm" style={{ position: 'absolute', bottom: 8, insetInlineEnd: 8 }} onClick={() => open(p)}>عرض سريع</button>
            </div>
            <div style={{ padding: 12 }} className="col gap-4 grow">
              <b className="small" style={{ minHeight: 40 }}>{p.name}</b>
              <span className="row xs"><Star size={12} fill="currentColor" strokeWidth={0} />{p.rating} <span className="muted">({p.reviews})</span></span>
              <div className="row"><b><Price sar={p.price} /></b>{p.compareAt && <s className="xs muted ltr"><Price sar={p.compareAt} /></s>}</div>
              {p.stock < 25 && <span className="xs" style={{ color: 'var(--red)' }}>تبقّى {p.stock} فقط</span>}
              <div className="row mt-8">
                {p.variants ? <button className="btn btn-dark btn-sm grow" onClick={() => open(p)}>اختر الخيارات</button> : <button className="btn btn-primary btn-sm grow" onClick={() => add(p)}>أضف إلى السلة</button>}
                <SaveBtn kind="product" id={p.id} />
              </div>
            </div>
          </div>
        ))}
      </div>
      {view && (
        <Modal wide onClose={() => setView(null)} title={view.name}>
          <div className="grid g-2">
            <Art src={productPhoto(view, 900)} alt={view.name} hue={view.hue} icon={ShoppingBag} h={300} />
            <div className="col gap-12">
              <div className="row"><b className="price-big"><Price sar={view.price} /></b>{view.compareAt && <s className="muted ltr"><Price sar={view.compareAt} /></s>}</div>
              <span className="small row"><Star size={14} fill="currentColor" strokeWidth={0} />{view.rating} · {view.reviews} تقييم · {PRODUCT_CATS[view.cat]}</span>
              {Object.entries(view.variants || {}).map(([k, vals]) => (
                <Field key={k} label={k === 'size' ? 'المقاس' : 'اللون'}><Chips options={vals.map((v) => [v, v])} value={opts[k]} onChange={(v) => v && setOpts({ ...opts, [k]: v })} /></Field>
              ))}
              <div className="row between"><b>الكمية</b><Counter value={qty} min={1} max={view.stock} onChange={setQty} /></div>
              <button className="btn btn-primary btn-lg" onClick={() => add(view, opts, qty)}>أضف إلى السلة — <Price sar={view.price * qty} /></button>
              <p className="xs muted">متوفر {view.stock} قطعة · توصيل مجاني لفندقك</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
