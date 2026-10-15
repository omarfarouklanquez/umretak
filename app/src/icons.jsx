// Umretak Islamic icon set — 24px grid, 1.6 stroke, currentColor (lucide-compatible API).
const I = (paths) => function Icon({ size = 24, strokeWidth = 1.6, color = 'currentColor', style, className, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style} className={className} aria-hidden="true" {...rest}>
      {paths}
    </svg>
  )
}

export const Kaaba = I(<>
  <path d="M4 8l8-4 8 4v10l-8 4-8-4z" /><path d="M4 8l8 4 8-4M12 12v10" />
  <path d="M4 10.6l8 4 8-4" strokeWidth="2.2" stroke="var(--gold, #b48a2c)" />
  <path d="M15 19.3v-3.2l2-1v3.2" />
</>)
export const Tawaf = I(<>
  <path d="M9 10.5l3-1.5 3 1.5v4l-3 1.5-3-1.5z" /><path d="M9 10.5l3 1.5 3-1.5M12 12v4" />
  <path d="M20.5 12a8.5 8.5 0 1 1-2.5-6" /><path d="M18.4 2.6l-.4 3.4 3.4.3" />
</>)
export const Mosque = I(<>
  <path d="M2 21h20" /><path d="M6 21v-7h12v7" /><path d="M6.5 14c0-3.4 2.5-6 5.5-6s5.5 2.6 5.5 6" />
  <path d="M12 8V5.5" /><path d="M12.9 3.4a1.2 1.2 0 1 1-1.4-.9" />
  <path d="M10.5 21v-2.6a1.5 1.5 0 0 1 3 0V21" />
  <path d="M3 21v-9.5l.75-2 .75 2V21M19.5 21v-9.5l.75-2 .75 2V21" />
</>)
export const GreenDome = I(<>
  <path d="M5 21h14" /><path d="M6.5 21v-6h11v6" /><path d="M7 15c0-4.2 2.2-7.5 5-7.5s5 3.3 5 7.5" />
  <path d="M12 7.5V4.5M10.8 4.5h2.4" /><path d="M9 18h6" />
</>)
export const Minaret = I(<>
  <path d="M9 22V11h6v11" /><path d="M8 11h8M8.5 15.5h7" /><path d="M10 11V7.5h4V11" />
  <path d="M10 7.5c0-2 1-3.5 2-4.5 1 1 2 2.5 2 4.5" /><path d="M12 3V1.5" />
</>)
export const ClockTower = I(<>
  <path d="M8.5 22V9.5h7V22" /><path d="M7.5 9.5h9" /><path d="M10 9.5V6.5h4v3" /><path d="M12 6.5V2" />
  <circle cx="12" cy="13" r="2" /><path d="M12 12.2V13l.6.4" /><path d="M5 22v-6h3.5M19 22v-6h-3.5" />
</>)
export const Crescent = I(<path d="M15.5 3.2A8.8 8.8 0 1 0 20.8 16a7.2 7.2 0 0 1-5.3-12.8z" />)
export const CrescentStar = I(<>
  <path d="M13.5 3.2A8.8 8.8 0 1 0 18.8 16a7.2 7.2 0 0 1-5.3-12.8z" />
  <path d="M18.5 6.5l.7 1.5 1.6.2-1.2 1.1.3 1.6-1.4-.8-1.4.8.3-1.6-1.2-1.1 1.6-.2z" />
</>)
export const Lantern = I(<>
  <path d="M12 1.5V3.5" /><path d="M9.5 6h5L13.5 3.5h-3z" /><path d="M8.5 6L7 10v5.5L8.5 19h7l1.5-3.5V10L15.5 6" />
  <path d="M12 8.5v8M7 10h10" /><path d="M9.5 19l1 2.5h3l1-2.5" />
</>)
export const Tasbih = I(<>
  {Array.from({ length: 11 }, (_, k) => {
    const a = (Math.PI * 2 * k) / 12 - Math.PI / 2 + Math.PI / 12
    return <circle key={k} cx={12 + Math.cos(a) * 6.3} cy={9 + Math.sin(a) * 6.3} r="1.15" />
  })}
  <path d="M12 15.3v3" /><path d="M10.3 22l1.7-3.7 1.7 3.7" />
</>)
export const Quran = I(<>
  <path d="M12 6.8C9.6 5.4 6.6 5.3 4 6.3v8.9c2.6-1 5.6-.9 8 .6 2.4-1.5 5.4-1.6 8-.6V6.3c-2.6-1-5.6-.9-8 .5z" />
  <path d="M12 6.8v9" /><path d="M6.5 21.5l11-5M17.5 21.5l-11-5" />
</>)
export const PrayerMat = I(<>
  <rect x="5" y="3" width="14" height="18" rx="1.2" /><path d="M8.5 18v-6.5a3.5 3.5 0 0 1 7 0V18z" />
  <path d="M7 3V1.5M10.3 3V1.5M13.7 3V1.5M17 3V1.5M7 22.5V21M17 22.5V21" />
</>)
export const Ihram = I(<>
  <path d="M8 3.5c1.2 1.6 6.8 1.6 8 0l3.5 4.5-2.5 2V21H7V10L4.5 8z" /><path d="M8 3.5L17 21" />
</>)
export const Zamzam = I(<>
  <path d="M10 2h4v2h-4z" /><path d="M9 4h6l1 3v13a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V7z" />
  <path d="M12 10.5c-1.6 2-2.2 3.2-2.2 4.2a2.2 2.2 0 0 0 4.4 0c0-1-.6-2.2-2.2-4.2z" />
</>)
export const Palm = I(<>
  <path d="M12 22V10.5" /><path d="M11 14.5h2M11 18h2" />
  <path d="M12 10.5C10.2 7 6.5 6 3 7.2M12 10.5c1.8-3.5 5.5-4.5 9-3.3M12 10.5c-2-1.6-5.6-.8-7.6 2.4M12 10.5c2-1.6 5.6-.8 7.6 2.4M12 10.5c-.4-3.2.4-6 2.5-8" />
  <circle cx="10.4" cy="12.4" r=".9" /><circle cx="13.6" cy="12.4" r=".9" />
</>)
export const MinaTent = I(<><path d="M2.5 20.5L12 4.5l9.5 16z" /><path d="M12 4.5v16" /><path d="M9 20.5l3-5 3 5" /><path d="M12 4.5V2.5" /></>)
export const Mihrab = I(<><path d="M5 21V11a7 7 0 0 1 14 0v10" /><path d="M9 21v-7a3 3 0 0 1 6 0v7" /><path d="M3 21h18" /></>)
export const Hills = I(<><path d="M2 19l5-7 3.5 4.5L14 11l8 8z" /><path d="M6.5 7.5h11M15 5l2.5 2.5L15 10M9 5L6.5 7.5 9 10" /></>)
export const Scissors = I(<><circle cx="6" cy="6" r="2.5" /><circle cx="6" cy="18" r="2.5" /><path d="M8 7.5l12 9M8 16.5l12-9" /></>)
export const Star8 = I(<><rect x="5.5" y="5.5" width="13" height="13" rx=".5" /><rect x="5.5" y="5.5" width="13" height="13" rx=".5" transform="rotate(45 12 12)" /><circle cx="12" cy="12" r="2.2" /></>)
export const Dua = I(<>
  <path d="M8 21v-4.5L4.8 12a1.3 1.3 0 0 1 2-1.6L9 13V5.5a1.2 1.2 0 0 1 2.4 0V12" />
  <path d="M16 21v-4.5l3.2-4.5a1.3 1.3 0 0 0-2-1.6L15 13V5.5a1.2 1.2 0 0 0-2.4 0V12" />
</>)

// Brand mark: Kaaba inside an eight-point star (khatam) — the Umretak seal.
export function BrandMark({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <rect x="7" y="7" width="26" height="26" rx="3" fill="var(--brand)" />
      <rect x="7" y="7" width="26" height="26" rx="3" fill="var(--brand-2)" transform="rotate(45 20 20)" />
      <path d="M13 16.5l7-3.5 7 3.5v8.5l-7 3.5-7-3.5z" fill="#16181a" />
      <path d="M13 18.7l7 3.5 7-3.5" stroke="#e7c06a" strokeWidth="1.6" fill="none" />
      <path d="M20 22.2V28.5" stroke="#3a3d40" strokeWidth=".8" />
    </svg>
  )
}

// The four rites of Umrah — used for the "رحلة العمرة" explainer.
export const RITES = [
  [Ihram, 'الإحرام', 'النية والتلبية من الميقات'],
  [Tawaf, 'الطواف', 'سبعة أشواط حول الكعبة'],
  [Hills, 'السعي', 'سبعة أشواط بين الصفا والمروة'],
  [Scissors, 'الحلق أو التقصير', 'التحلل من الإحرام'],
]
