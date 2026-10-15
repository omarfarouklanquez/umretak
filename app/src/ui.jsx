import { createContext, useContext, useEffect, useState } from 'react'
import { Heart, Minus, Plus, Star, X } from 'lucide-react'
import { isSaved, money, ORDER_STATUS, toggleSaved } from './lib/logic'

/* ---------- app-level UI context: toast, auth modal, cart drawer ---------- */
export const UICtx = createContext(null)
export const useUI = () => useContext(UICtx)

export function UIProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const [auth, setAuth] = useState(null) // null | {next?: fn}
  const [cartOpen, setCartOpen] = useState(false)
  const toast = (text, action) => {
    const id = Math.random()
    setToasts((t) => [...t, { id, text, action }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600)
  }
  const value = { toast, auth, openAuth: (next) => setAuth({ next }), closeAuth: () => setAuth(null), cartOpen, setCartOpen }
  return (
    <UICtx.Provider value={value}>
      {children}
      <div className="toasts" role="status">
        {toasts.map((t) => (
          <div className="toast" key={t.id}>
            {t.text}
            {t.action && <button className="btn-link" style={{ color: '#ffb48a' }} onClick={t.action.fn}>{t.action.label}</button>}
          </div>
        ))}
      </div>
    </UICtx.Provider>
  )
}

/* ---------- primitives ---------- */
export function Modal({ onClose, children, wide, title }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className={'modal' + (wide ? ' wide' : '')} role="dialog" aria-modal="true" aria-label={title}>
        {onClose && <button className="icon-btn modal-x" onClick={onClose} aria-label="إغلاق"><X size={20} /></button>}
        <div className="modal-body">
          {title && <h2 className="mb-16" style={{ paddingInlineEnd: 32 }}>{title}</h2>}
          {children}
        </div>
      </div>
    </div>
  )
}

export function Drawer({ onClose, children }) {
  return (
    <div className="drawer-wrap" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className="drawer">{children}</aside>
    </div>
  )
}

export const Field = ({ label, error, children, hint }) => (
  <label className="field">
    {label && <span>{label}</span>}
    {children}
    {hint && !error && <small className="muted xs">{hint}</small>}
    {error && <small className="err-text">{error}</small>}
  </label>
)

export const Toggle = ({ on, onChange, label }) => (
  <button type="button" role="switch" aria-checked={on} aria-label={label} className={'toggle' + (on ? ' on' : '')} onClick={() => onChange(!on)} />
)

export const Counter = ({ value, onChange, min = 0, max = 99, label }) => (
  <span className="counter" aria-label={label}>
    <button type="button" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="إنقاص"><Minus size={14} /></button>
    <b>{value}</b>
    <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="زيادة"><Plus size={14} /></button>
  </span>
)

export const Stars = ({ n, size = 13 }) => (
  <span className="stars" aria-label={`${n} نجوم`}>
    {Array.from({ length: n }, (_, i) => <Star key={i} size={size} fill="currentColor" strokeWidth={0} />)}
  </span>
)

export const scoreLabel = (r) => (r >= 4.7 ? 'استثنائي' : r >= 4.4 ? 'ممتاز' : r >= 4 ? 'جيد جداً' : r >= 3.5 ? 'جيد' : 'مقبول')
export const Score = ({ rating, reviews }) => (
  <span className="row gap-4 small">
    <span className="score">{(rating * 2).toFixed(1)}</span>
    <b>{scoreLabel(rating)}</b>
    {reviews != null && <span className="muted">({reviews.toLocaleString('en-US')})</span>}
  </span>
)

export const Price = ({ sar, className = '' }) => <span className={'ltr ' + className}>{money(sar)}</span>

export const StatusBadge = ({ status, map = ORDER_STATUS }) => {
  const [label, tone] = map[status] || [status, '']
  return <span className={'badge ' + tone}>{label}</span>
}

// Photo with brand-art fallback: gradient + icon shows while loading or if the image fails/offline.
export function Art({ hue = 30, icon: Icon, h = 160, label, radius, children, style, src, alt = '', className = '' }) {
  return (
    <div className={'art ' + className} style={{ height: h, borderRadius: radius, background: `linear-gradient(135deg, hsl(${hue} 52% 46%), hsl(${(hue + 45) % 360} 58% 26%))`, ...style }}>
      {Icon && <Icon size={typeof h === 'number' ? Math.min(56, h / 3) : 48} strokeWidth={1.4} />}
      {src && <img className="art-img" src={src} alt={alt} loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none' }} />}
      {label && <span className="art-tag">{label}</span>}
      {children}
    </div>
  )
}

export function SaveBtn({ kind, id, size = 'sm' }) {
  const { toast } = useUI()
  const on = isSaved(kind, id)
  return (
    <button
      className={'btn btn-outline btn-' + size}
      onClick={(e) => { e.stopPropagation(); e.preventDefault(); toast(toggleSaved(kind, id) ? 'تم الحفظ في المفضلة' : 'تمت الإزالة من المفضلة') }}
      aria-pressed={on}
    >
      <Heart size={15} fill={on ? 'var(--red)' : 'none'} color={on ? 'var(--red)' : 'currentColor'} /> {on ? 'محفوظ' : 'حفظ'}
    </button>
  )
}

export const Empty = ({ icon: Icon, title, text, children }) => (
  <div className="empty">
    {Icon && <Icon size={44} strokeWidth={1.3} />}
    <h3 style={{ color: 'var(--ink)' }}>{title}</h3>
    {text && <p>{text}</p>}
    {children}
  </div>
)

export const Stepper = ({ steps, current }) => (
  <div className="stepper">
    {steps.map((s, i) => (
      <div key={s} className={'s' + (i < current ? ' done' : i === current ? ' cur' : '')}>
        <b>{i < current ? '✓' : i + 1}</b>
        {s}
      </div>
    ))}
  </div>
)

export const Tabs = ({ tabs, value, onChange }) => (
  <div className="tabs" role="tablist">
    {tabs.map(([k, label]) => (
      <button key={k} role="tab" aria-selected={value === k} className={'tab' + (value === k ? ' on' : '')} onClick={() => onChange(k)}>{label}</button>
    ))}
  </div>
)

export const Chips = ({ options, value, onChange, multi }) => (
  <div className="row wrap">
    {options.map(([k, label]) => {
      const on = multi ? value.includes(k) : value === k
      return (
        <button key={k} type="button" className={'chip' + (on ? ' on' : '')} onClick={() => onChange(multi ? (on ? value.filter((x) => x !== k) : [...value, k]) : on ? '' : k)}>
          {label}
        </button>
      )
    })}
  </div>
)

export const fmtDate = (d, opts = { day: 'numeric', month: 'short', year: 'numeric' }) => (d ? new Date(d).toLocaleDateString('ar-EG', opts) : '—')
export const fmtTime = (d) => new Date(d).toLocaleString('ar-EG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
export const mins = (m) => `${Math.floor(m / 60)}س ${m % 60}د`
