import { useRef, useState } from 'react'
import { ChevronRight, KeyRound, Mail, ShieldCheck } from 'lucide-react'
import { login, register, userExists } from '../lib/logic'
import { Art, Field, Modal, useUI } from '../ui'
import { photo } from '../lib/media'
import { BrandMark } from '../icons'

// Mirrors the reference flow: start → email → (password | set-up → verify code)
export default function AuthModal() {
  const { closeAuth, auth, toast } = useUI()
  const [step, setStep] = useState('start')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [pass, setPass] = useState('')
  const [optIn, setOptIn] = useState(true)
  const [err, setErr] = useState('')
  const [code, setCode] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const refs = useRef([])

  const done = (u) => { toast(`أهلاً ${u.name}`); closeAuth(); auth?.next?.() }
  const go = (s) => { setErr(''); setStep(s) }

  const submitEmail = (e) => {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErr('أدخل بريداً إلكترونياً صحيحاً')
    go(userExists(email) ? 'password' : 'setup')
  }
  const submitPass = (e) => {
    e.preventDefault()
    try { done(login(email, pass)) } catch (x) { setErr(x.message) }
  }
  const submitSetup = (e) => {
    e.preventDefault()
    if (name.trim().length < 2) return setErr('أدخل اسمك')
    if (pass.length < 6) return setErr('كلمة المرور 6 أحرف على الأقل')
    const c = String(Math.floor(100000 + Math.random() * 900000))
    setCode(c)
    toast(`رمز التحقق التجريبي: ${c}`)
    go('verify')
  }
  const typeOtp = (i, v) => {
    const d = v.replace(/\D/g, '').slice(-1)
    const next = otp.map((x, k) => (k === i ? d : x))
    setOtp(next)
    if (d && i < 5) refs.current[i + 1]?.focus()
    if (next.join('').length === 6) {
      if (next.join('') !== code) { setErr('الرمز غير صحيح'); return }
      try { done(register({ name, email, pass })) } catch (x) { setErr(x.message) }
    }
  }

  const Back = ({ to }) => <button className="btn btn-link mb-16" onClick={() => go(to)}><ChevronRight size={16} />رجوع</button>
  const Hero = ({ icon: I }) => (
    <div style={{ height: 130, borderRadius: 14, background: 'var(--peach)', display: 'grid', placeItems: 'center', marginBottom: 18 }}>
      <I size={64} color="var(--brand)" strokeWidth={1.4} />
    </div>
  )

  return (
    <Modal onClose={closeAuth} title="">
      {step === 'start' && (
        <div className="col gap-12">
          <div className="brand"><BrandMark size={34} /><span className="logo">{['ع', 'م', 'ر', 'ت', 'ك'].map((c) => <span key={c}>{c}</span>)}</span></div>
          <Art src={photo('makkah', 9, 800)} alt="الكعبة المشرفة ليلاً" hue={28} h={150} style={{ marginBottom: 6 }} />
          <h2>سجّل الدخول أو أنشئ حساباً</h2>
          <p className="muted small">تابع أسعارك، احفظ رحلاتك، واحصل على عروض حصرية للأعضاء.</p>
          <button className="btn btn-outline btn-lg btn-block" onClick={() => go('email')}><Mail size={18} />المتابعة بالبريد الإلكتروني</button>
          <div className="row"><button className="btn btn-outline grow" onClick={() => toast('ربط Google متاح عند ربط مزود الهوية (OAuth)')}>Google</button><button className="btn btn-outline grow" onClick={() => toast('ربط Apple متاح عند ربط مزود الهوية (OAuth)')}>Apple</button></div>
          <div className="notice"><span>حساب تجريبي: <b className="ltr">user@umretak.test / user123</b></span></div>
          <button className="btn btn-soft btn-sm" onClick={() => done(login('user@umretak.test', 'user123'))}>دخول كعميل تجريبي</button>
          <p className="xs muted">بالتسجيل فإنك توافق على <a href="#/policies/terms">الشروط</a> و<a href="#/policies/privacy">سياسة الخصوصية</a>.</p>
        </div>
      )}
      {step === 'email' && (
        <form onSubmit={submitEmail} className="col gap-12">
          <Back to="start" />
          <h2>ما بريدك الإلكتروني؟</h2>
          <Field label="البريد الإلكتروني" error={err}><input autoFocus className="input ltr" style={{ display: 'block' }} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" /></Field>
          <button className="btn btn-primary btn-lg btn-block">متابعة</button>
        </form>
      )}
      {step === 'password' && (
        <form onSubmit={submitPass} className="col gap-12">
          <Back to="email" />
          <Hero icon={KeyRound} />
          <h2>مرحباً بعودتك</h2>
          <p className="muted small">أدخل كلمة المرور لـ <b className="ltr">{email}</b></p>
          <Field label="كلمة المرور" error={err}><input autoFocus className="input" type="password" value={pass} onChange={(e) => setPass(e.target.value)} /></Field>
          <button className="btn btn-primary btn-lg btn-block">تسجيل الدخول</button>
          <button type="button" className="btn btn-link" onClick={() => toast('سيصلك رابط إعادة التعيين عند ربط خدمة البريد')}>نسيت كلمة المرور؟</button>
        </form>
      )}
      {step === 'setup' && (
        <form onSubmit={submitSetup} className="col gap-12">
          <Back to="email" />
          <Hero icon={ShieldCheck} />
          <h2>لنجهّز حسابك</h2>
          <p className="muted small">سننشئ حساباً لـ <b className="ltr">{email}</b></p>
          <Field label="الاسم الكامل"><input autoFocus className="input" value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="كلمة المرور" error={err}><input className="input" type="password" value={pass} onChange={(e) => setPass(e.target.value)} /></Field>
          <label className="check"><input type="checkbox" checked={optIn} onChange={(e) => setOptIn(e.target.checked)} />أرسل لي أفضل العروض بالبريد</label>
          <button className="btn btn-primary btn-lg btn-block">إنشاء الحساب</button>
        </form>
      )}
      {step === 'verify' && (
        <div className="col gap-12">
          <Back to="setup" />
          <Hero icon={Mail} />
          <h2>تحقق من بريدك الإلكتروني</h2>
          <p className="muted small">أرسلنا رمزاً من 6 أرقام إلى <b className="ltr">{email}</b>. أدخله خلال 10 دقائق.</p>
          <div className="otp">
            {otp.map((d, i) => (
              <input key={i} ref={(el) => (refs.current[i] = el)} inputMode="numeric" aria-label={`الرقم ${i + 1}`} value={d} autoFocus={i === 0}
                onChange={(e) => typeOtp(i, e.target.value)} onKeyDown={(e) => e.key === 'Backspace' && !d && i > 0 && refs.current[i - 1]?.focus()} />
            ))}
          </div>
          {err && <p className="err-text center">{err}</p>}
          <p className="xs muted center">لم يصلك الرمز؟ <button className="btn-link btn" onClick={() => { const c = String(Math.floor(100000 + Math.random() * 900000)); setCode(c); setOtp(['', '', '', '', '', '']); toast(`رمز جديد: ${c}`) }}>أرسل رمزاً جديداً</button></p>
        </div>
      )}
    </Modal>
  )
}
