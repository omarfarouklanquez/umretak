import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  BedDouble, Briefcase, Car, CircleHelp, Heart, LifeBuoy, LogOut, Menu,
  Newspaper, Plane, Search, ShoppingBag, ShoppingCart, Sparkles, Stamp, Trash2, TrainFront, User, X,
} from 'lucide-react'
import { cart, clearCart, currentUser, logout, money, removeFromCart, setCurrency, currency, setQty, totals, KINDS, settings } from './lib/logic'
import { Counter, Drawer, Empty, useUI } from './ui'
import AuthModal from './pages/Auth'
import { BrandMark, CrescentStar, Kaaba, MinaTent, Mosque, Star8 } from './icons'

export const NAV = [
  ['/umrah', 'برامج العمرة', Kaaba],
  ['/hajj', 'برامج الحج', MinaTent],
  ['/hotels', 'الفنادق', BedDouble],
  ['/flights', 'الطيران', Plane],
  ['/visa', 'التأشيرات', Stamp],
  ['/transport', 'النقل الخاص', Car],
  ['/train', 'قطار الحرمين', TrainFront],
  ['/tours', 'الجولات والمزارات', Mosque],
  ['/store', 'المتجر', ShoppingBag],
]
const TOOLS = [
  ['/builder', 'صمّم رحلتك', Sparkles],
  ['/trips', 'رحلاتي', Briefcase],
  ['/saved', 'المفضلة', Heart],
  ['/spin', 'عجلة الحظ', CrescentStar],
]
const HELP = [
  ['/support', 'الدعم والشكاوى', LifeBuoy],
  ['/blog', 'المدونة', Newspaper],
  ['/faq', 'الأسئلة الشائعة', CircleHelp],
  ['/about', 'من نحن', Star8],
]

export const Logo = () => (
  <Link to="/" className="brand" aria-label="عمرتك — الرئيسية">
    <BrandMark size={36} />
    <span className="logo">{['ع', 'م', 'ر', 'ت', 'ك'].map((c) => <span key={c}>{c}</span>)}</span>
  </Link>
)

export default function Layout() {
  const [open, setOpen] = useState(false)
  const { auth, cartOpen, setCartOpen } = useUI()
  return (
    <div className="app">
      <TopBar onMenu={() => setOpen(!open)} />
      <div className="body">
        <nav className={'rail' + (open ? ' open' : '')} aria-label="التنقل" onClick={() => window.innerWidth < 760 && setOpen(false)}>
          {[NAV, TOOLS, HELP].map((group, gi) => (
            <div key={gi} className="col gap-0">
              {gi > 0 && <hr />}
              {group.map(([to, label, Icon]) => (
                <NavLink key={to} to={to} title={label}><Icon size={20} style={{ flexShrink: 0 }} /><span className="lbl">{label}</span></NavLink>
              ))}
            </div>
          ))}
        </nav>
        <main className="main">
          <Outlet />
          <Footer />
        </main>
      </div>
      {auth && <AuthModal />}
      {cartOpen && <CartDrawer onClose={() => setCartOpen(false)} />}
    </div>
  )
}

function TopBar({ onMenu }) {
  const nav = useNavigate()
  const { openAuth, setCartOpen, toast } = useUI()
  const [q, setQ] = useState('')
  const [menu, setMenu] = useState(false)
  const user = currentUser()
  const count = cart().reduce((s, i) => s + 1, 0)
  return (
    <header className="topbar">
      <button className="icon-btn" onClick={onMenu} aria-label="القائمة"><Menu size={22} /></button>
      <Logo />
      <form className="grow row" style={{ maxWidth: 460, marginInline: 'auto' }} onSubmit={(e) => { e.preventDefault(); nav('/search?q=' + encodeURIComponent(q)) }}>
        <div className="seg" style={{ minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: 8, padding: '0 12px' }}>
          <Search size={16} className="muted" />
          <input aria-label="بحث" placeholder="ابحث عن باقة، فندق، تأشيرة…" value={q} onChange={(e) => setQ(e.target.value)} style={{ fontWeight: 500 }} />
        </div>
      </form>
      <select className="select" style={{ width: 84, height: 36 }} value={currency()} onChange={(e) => setCurrency(e.target.value)} aria-label="العملة">
        {Object.keys(settings().rates).map((c) => <option key={c}>{c}</option>)}
      </select>
      <Link to="/saved" className="icon-btn" aria-label="المفضلة"><Heart size={21} fill="currentColor" /></Link>
      <button className="icon-btn" onClick={() => setCartOpen(true)} aria-label="السلة">
        <ShoppingCart size={21} />
        {count > 0 && <span className="bubble">{count}</span>}
      </button>
      {user ? (
        <div style={{ position: 'relative' }}>
          <button className="avatar" style={{ border: 0, cursor: 'pointer' }} onClick={() => setMenu(!menu)} aria-label="الحساب">{user.name[0]}</button>
          {menu && (
            <div className="card" style={{ position: 'absolute', insetInlineEnd: 0, top: 44, width: 240, padding: 8, zIndex: 60, boxShadow: 'var(--shadow-lg)' }} onClick={() => setMenu(false)}>
              <div style={{ padding: '8px 10px' }}><b>{user.name}</b><div className="muted xs">{user.email}</div></div>
              <hr className="divider" style={{ margin: '6px 0' }} />
              {[['/account', 'حسابي', User], ['/trips', 'رحلاتي', Briefcase], ['/support', 'تذاكر الدعم', LifeBuoy]].map(([to, l, I]) => (
                <Link key={to} to={to} className="row" style={{ padding: '8px 10px', color: 'var(--ink)', borderRadius: 8 }}><I size={17} />{l}</Link>
              ))}
              <button className="btn btn-ghost btn-block" style={{ justifyContent: 'flex-start' }} onClick={() => { logout(); toast('تم تسجيل الخروج'); nav('/') }}><LogOut size={17} />تسجيل الخروج</button>
            </div>
          )}
        </div>
      ) : (
        <button className="btn btn-outline btn-sm" onClick={() => openAuth()}><User size={16} />دخول</button>
      )}
    </header>
  )
}

function CartDrawer({ onClose }) {
  const nav = useNavigate()
  const items = cart()
  const t = totals(items)
  return (
    <Drawer onClose={onClose}>
      <div className="row between" style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)' }}>
        <h2>سلة الرحلة</h2>
        <button className="icon-btn" onClick={onClose} aria-label="إغلاق"><X size={20} /></button>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: 20 }} className="col gap-12">
        {!items.length && <Empty icon={ShoppingCart} title="سلتك فارغة" text="أضف باقة أو فندق أو أي خدمة — كل شيء يُدفع مرة واحدة." />}
        {items.map((i) => (
          <div key={i.key} className="card pad-s col gap-4">
            <div className="row between top">
              <div className="grow">
                <span className="badge xs">{KINDS[i.kind]}</span>
                <div className="semi mt-8">{i.title}</div>
                <div className="muted xs">{i.subtitle}</div>
              </div>
              <button className="icon-btn" onClick={() => removeFromCart(i.key)} aria-label="حذف"><Trash2 size={17} /></button>
            </div>
            <div className="row between">
              <Counter value={i.qty} min={1} onChange={(v) => setQty(i.key, v)} label="الكمية" />
              <b className="ltr">{money(i.unitPrice * i.qty)}</b>
            </div>
          </div>
        ))}
      </div>
      {items.length > 0 && (
        <div style={{ padding: 20, borderTop: '1px solid var(--line)' }} className="col">
          <div className="kv"><span>المجموع الفرعي</span><b className="ltr">{money(t.subtotal)}</b></div>
          {t.vat > 0 && <div className="kv muted small"><span>ضرائب الفنادق (15% + 5%)</span><span className="ltr">{money(t.vat + t.municipality)}</span></div>}
          <button className="btn btn-primary btn-lg btn-block mt-8" onClick={() => { onClose(); nav('/checkout') }}>متابعة الدفع</button>
          <button className="btn btn-link" onClick={clearCart}>تفريغ السلة</button>
        </div>
      )}
    </Drawer>
  )
}

function Footer() {
  const s = settings()
  return (
    <footer className="footer pattern-dark" style={{ borderTop: '4px solid var(--brand)' }}>
      <div className="page" style={{ padding: 0 }}>
        <div className="row between wrap mb-16"><div className="row"><BrandMark size={44} /><div><b style={{ fontSize: 20 }}>{s.brand}</b><div className="muted small">كل خطوة نحو بيت الله — بثقة ووضوح.</div></div></div><div className="gold-rule" /></div>
        <div className="grid g-4">
          <div><h4 className="mb-8">الشركة</h4><Link to="/about">من نحن</Link><Link to="/careers">الوظائف</Link><Link to="/reviews">آراء العملاء</Link><Link to="/blog">المدونة</Link></div>
          <div><h4 className="mb-8">المساعدة</h4><Link to="/faq">الأسئلة الشائعة</Link><Link to="/support">الدعم والشكاوى</Link><Link to="/policies/cancellation">سياسة الإلغاء</Link><Link to="/policies/terms">الشروط والأحكام</Link><Link to="/policies/privacy">سياسة الخصوصية</Link></div>
          <div><h4 className="mb-8">خدماتنا</h4>{NAV.slice(0, 6).map(([to, l]) => <Link key={to} to={to}>{l}</Link>)}</div>
          <div><h4 className="mb-8">تواصل معنا</h4><a href={'tel:' + s.contacts.phone}><span className="ltr">{s.contacts.phone}</span></a><a href={'mailto:' + s.contacts.email}>{s.contacts.email}</a><p className="muted small mt-8">ترخيص وزارة السياحة 73104943 · السجل التجاري 4650260256</p><div className="row wrap mt-8">{['مدى', 'Visa', 'Mastercard', 'Apple Pay', 'تحويل بنكي'].map((p) => <span key={p} className="badge">{p}</span>)}</div></div>
        </div>
        <hr className="divider" />
        <p className="muted small">© {new Date().getFullYear()} {s.brand} — نموذج واجهة تفاعلي (البيانات محفوظة محلياً في متصفحك).</p>
      </div>
    </footer>
  )
}
