// Demo catalog. All money is SAR (base currency). Dates are relative to "today"
// so the demo never goes stale.
const day = 864e5
const iso = (d) => new Date(d).toISOString().slice(0, 10)
const inDays = (n) => iso(Date.now() + n * day)

export const SETTINGS = {
  brand: 'عمرتك',
  rates: { SAR: 1, EGP: 12.9, USD: 0.2667, EUR: 0.245 },
  vat: 0.15,
  municipality: 0.05,
  refundTiers: [
    { minDays: 31, rate: 0.9, label: 'قبل الرحلة بأكثر من 30 يوماً' },
    { minDays: 15, rate: 0.7, label: 'قبل الرحلة بـ 15 إلى 30 يوماً' },
    { minDays: 7, rate: 0.5, label: 'قبل الرحلة بـ 7 إلى 14 يوماً' },
    { minDays: 3, rate: 0.25, label: 'قبل الرحلة بـ 3 إلى 6 أيام' },
    { minDays: -9999, rate: 0, label: 'أقل من 3 أيام قبل الرحلة' },
  ],
  contacts: { phone: '+966 55 000 0000', whatsapp: '966550000000', email: 'care@umretak.test' },
  hajjSeason: { name: '1448هـ', open: false, applyStart: inDays(-41), applyEnd: inDays(-18), lottery: inDays(-15) },
}

export const HOTELS = [
  ['فندق فيرمونت برج الساعة', 'Fairmont Makkah Clock Tower', 'makkah', 'أجياد', 5, 50, 4.7, 1450],
  ['فندق بولمان زمزم مكة', 'Pullman Zamzam Makkah', 'makkah', 'أجياد', 5, 410, 4.6, 980],
  ['فندق مكارم أجياد', 'Makarem Ajyad', 'makkah', 'أجياد', 5, 600, 4.4, 825],
  ['أبراج الصفوة - البرج الثالث', 'Al Safwah Tower 3', 'makkah', 'المسفلة', 5, 150, 4.5, 1100],
  ['فندق برستيج المشاعر', 'Prestige Al Mashaer', 'makkah', 'العزيزية', 4, 1100, 4.5, 600],
  ['فندق مثابة', 'Mathaba Hotel', 'makkah', 'جرول', 4, 1430, 4.2, 420],
  ['فندق الإباء', 'Al Ebaa Hotel', 'makkah', 'جرول', 3, 1020, 4.0, 310],
  ['أبراج نوازي', 'Nawazi Towers', 'makkah', 'المسفلة', 4, 900, 4.1, 470],
  ['فندق الشهداء', 'Al Shohada Hotel', 'makkah', 'الشبيكة', 4, 300, 4.3, 690],
  ['أنوار المدينة موفنبيك', 'Anwar Al Madinah Mövenpick', 'madinah', 'المنطقة المركزية', 5, 100, 4.6, 890],
  ['فندق دار التقوى', 'Dar Al-Taqwa', 'madinah', 'المنطقة المركزية', 4, 50, 4.9, 760],
  ['فندق أنوار الزهراء', 'Anwar Al-Zahra', 'madinah', 'بني ظفر', 3, 690, 3.5, 260],
  ['فندق وقف عثمان بن عفان', 'Waqf Othman Bin Affan', 'madinah', 'بضاعة', 3, 840, 3.9, 280],
  ['فندق الفيروز الذهبي', 'Golden Fairouz', 'madinah', 'المنطقة المركزية', 4, 400, 4.5, 520],
  ['فندق موفنبيك هاجر', 'Mövenpick Hajar Tower', 'makkah', 'أجياد', 5, 120, 4.6, 1050],
  ['الماسة جراند', 'Al Massa Grand', 'makkah', 'العزيزية', 4, 800, 4.5, 450],
].map(([name, nameEn, city, area, stars, distanceM, rating, base], i) => ({
  id: 'h' + (i + 1),
  name, nameEn, city, area, stars, distanceM, rating,
  reviews: 120 + ((i * 97) % 1800),
  featured: i % 3 === 0,
  freeCancel: i % 2 === 0,
  amenities: ['واي فاي مجاني', 'إفطار', 'خدمة الغرف', 'مكيف', ...(stars >= 4 ? ['مطعم', 'إطلالة'] : []), ...(stars === 5 ? ['سبا', 'نقل للحرم', 'صالة رياضية'] : []), ...(i % 2 ? ['مواقف سيارات'] : [])],
  rooms: [
    { type: 'double', label: 'غرفة ثنائية', capacity: 2, price: base },
    { type: 'triple', label: 'غرفة ثلاثية', capacity: 3, price: Math.round(base * 1.3) },
    { type: 'quad', label: 'غرفة رباعية', capacity: 4, price: Math.round(base * 1.55) },
    ...(stars === 5 ? [{ type: 'suite', label: 'جناح بإطلالة على الحرم', capacity: 2, price: Math.round(base * 2.6) }] : []),
  ],
  about: `${name} وجهة فندقية ${stars === 5 ? 'فاخرة' : 'متميزة'} في ${city === 'makkah' ? 'مكة المكرمة' : 'المدينة المنورة'} تبعد ${distanceM} متر عن ${city === 'makkah' ? 'المسجد الحرام' : 'المسجد النبوي'}، مع خدمة استقبال على مدار الساعة وغرف واسعة.`,
  checkIn: '16:00', checkOut: '12:00',
  hue: (i * 37) % 360,
}))

const AIRLINES = ['مصر للطيران', 'الخطوط السعودية', 'طيران ناس', 'طيران أديل', 'فلاي دبي', 'الخطوط التركية']
const PKG_NAMES = ['الزاد', 'النسائم', 'الشروق', 'العروج', 'المنار', 'الجود', 'الفلاح', 'المقاصد', 'السكينة', 'الريان', 'البشائر', 'الطمأنينة']
const CITIES = [
  ['القاهرة', 'international'], ['الإسكندرية', 'international'], ['دبي', 'international'], ['إسطنبول', 'international'],
  ['الرياض', 'domestic'], ['الدمام', 'domestic'],
]
const TIERS = ['economy', 'premium', 'luxury']
const mk = HOTELS.filter((h) => h.city === 'makkah')
const md = HOTELS.filter((h) => h.city === 'madinah')

export const PACKAGES = Array.from({ length: 24 }, (_, i) => {
  const [departCity, scope] = CITIES[i % CITIES.length]
  const tier = TIERS[i % 3]
  const nights = [6, 7, 9, 13, 14, 20][i % 6]
  const pool = (arr) => arr.filter((h) => (tier === 'luxury' ? h.stars === 5 : tier === 'premium' ? h.stars >= 4 : h.stars <= 4))
  const hm = pool(mk)[i % pool(mk).length]
  const hd = pool(md)[i % pool(md).length]
  const makkahFirst = i % 2 === 0
  const mN = Math.ceil(nights * 0.6)
  const base = (scope === 'domestic' ? 1400 : 3300) + nights * (tier === 'luxury' ? 520 : tier === 'premium' ? 330 : 190)
  const departures = [8, 15, 23, 37, 52].map((d, k) => {
    const seats = 40
    return { id: `d${i}-${k}`, date: inDays(d + (i % 5)), returnDate: inDays(d + (i % 5) + nights), seats, seatsLeft: Math.max(0, seats - ((i * 7 + k * 11) % 38)) }
  })
  return {
    id: 'p' + (i + 1),
    kind: 'umrah',
    code: `${['ABS', 'RAB', 'ABO'][i % 3]}-${String(100 + i).padStart(3, '0')}`,
    title: `رحلة ${PKG_NAMES[i % PKG_NAMES.length]}: عمرة ${nights + 1} أيام - ${makkahFirst ? 'مكة أولاً' : 'المدينة أولاً'}`,
    scope, tier, nights, departCity, makkahFirst,
    transport: scope === 'domestic' ? 'حافلة VIP' : AIRLINES[i % AIRLINES.length],
    train: i % 3 !== 2,
    hotels: (makkahFirst ? [[hm, mN], [hd, nights - mN]] : [[hd, nights - mN], [hm, mN]]).map(([h, n]) => ({ city: h.city, hotelId: h.id, nights: n })),
    departures,
    prices: { quad: base, triple: Math.round(base * 1.12), double: Math.round(base * 1.3) },
    includes: [
      scope === 'domestic' ? 'النقل البري من مدينتك' : 'تذاكر الطيران الدولي',
      'الإقامة في الفنادق المذكورة',
      ...(scope === 'international' ? ['التأشيرة الإلكترونية'] : []),
      'الانتقالات الداخلية بحافلات مكيفة',
      'مزارات مكة والمدينة',
      'مشرف ديني مرافق',
      ...(i % 3 !== 2 ? ['قطار الحرمين السريع'] : []),
      ...(tier !== 'economy' ? ['إفطار يومي'] : []),
    ],
    rating: +(4 + ((i * 13) % 10) / 10).toFixed(1),
    reviews: 30 + ((i * 41) % 300),
    hue: (i * 29 + 20) % 360,
  }
})

export const HAJJ = [
  { id: 'hj1', kind: 'hajj', code: 'NSK-A', title: 'حج الداخل — الباقة الاقتصادية (مخيمات منى)', scope: 'domestic', tier: 'economy', nights: 6, departCity: 'مكة المكرمة', transport: 'حافلات', hotels: [], includes: ['مخيمات منى مكيفة', 'وجبات', 'نقل المشاعر'], prices: { quad: 10500, triple: 10500, double: 10500 } },
  { id: 'hj2', kind: 'hajj', code: 'NSK-B', title: 'حج الداخل — باقة الضيافة المميزة', scope: 'domestic', tier: 'premium', nights: 6, departCity: 'الرياض', transport: 'حافلات VIP', hotels: [], includes: ['مخيمات مطورة', 'بوفيه مفتوح', 'قطار المشاعر'], prices: { quad: 16800, triple: 16800, double: 16800 } },
  { id: 'hj3', kind: 'hajj', code: 'NSK-C', title: 'حج الداخل — أبراج منى', scope: 'domestic', tier: 'luxury', nights: 6, departCity: 'جدة', transport: 'حافلات VIP', hotels: [], includes: ['أبراج منى', 'وجبات فندقية', 'قطار المشاعر'], prices: { quad: 32000, triple: 32000, double: 32000 } },
  { id: 'hj4', kind: 'hajj', code: 'INT-1', title: 'حج الخارج — برنامج 21 يوم (فنادق العزيزية)', scope: 'international', tier: 'premium', nights: 20, departCity: 'القاهرة', transport: 'مصر للطيران', hotels: [], includes: ['طيران', 'تأشيرة الحج', 'سكن العزيزية', 'مخيمات منى'], prices: { quad: 38000, triple: 41000, double: 45000 } },
].map((p, i) => ({ ...p, departures: [], rating: 4.6, reviews: 40 + i * 13, hue: 30 + i * 40, seasonClosed: true }))

export const VISAS = [
  ['تأشيرة العمرة الإلكترونية', 'umrah', 'السعودية', 'single', 30, 90, 2, 'electronic', 520],
  ['تأشيرة عمرة + باركود العمرة المصرية', 'umrah', 'مصر', 'single', 30, 90, 3, 'electronic', 1010],
  ['تأشيرة سياحية إلكترونية (سنة متعددة)', 'tourist', 'السعودية', 'multiple', 90, 365, 5, 'electronic', 535],
  ['تأشيرة سياحية بالبصمة (إنجاز)', 'tourist', 'السعودية', 'single', 90, 90, 7, 'biometric', 620],
  ['تأشيرة ترانزيت 4 أيام (ستوب أوفر)', 'transit', 'السعودية', 'single', 4, 90, 2, 'electronic', 140],
  ['تأشيرة إلكترونية للجنسية الفرنسية', 'tourist', 'السعودية', 'single', 70, 365, 3, 'electronic', 1085],
  ['تأشيرة سياحية للجنسية الإثيوبية', 'tourist', 'السعودية', 'multiple', 90, 365, 5, 'biometric', 1125],
  ['باركود التأشيرة السياحية', 'barcode', 'مصر', 'single', 7, 7, 3, 'electronic', 525],
  ['تأشيرة زيارة عائلية', 'visit', 'السعودية', 'multiple', 90, 365, 10, 'biometric', 780],
  ['تأشيرة دخول تركيا الإلكترونية', 'tourist', 'تركيا', 'single', 30, 180, 3, 'electronic', 260],
].map(([title, type, country, entry, stayDays, validityDays, processingDays, mode, fee], i) => ({
  id: 'v' + (i + 1), title, type, country, entry, stayDays, validityDays, processingDays, mode, fee,
  requirements: ['صورة جواز سفر ساري 6 أشهر', 'صورة شخصية بخلفية بيضاء', ...(mode === 'biometric' ? ['حضور مركز التأشيرات للبصمة'] : []), ...(type === 'umrah' ? ['شهادة تطعيم الحمى الشوكية'] : []), ...(type === 'visit' ? ['خطاب دعوة من المقيم'] : [])],
}))

export const ROUTES = [
  { id: 'r1', from: 'مطار جدة', to: 'فنادق مكة', km: 95, factor: 1 },
  { id: 'r2', from: 'فنادق مكة', to: 'فنادق المدينة', km: 450, factor: 3.2 },
  { id: 'r3', from: 'مطار المدينة', to: 'فنادق المدينة', km: 20, factor: 0.6 },
  { id: 'r4', from: 'فنادق مكة', to: 'مطار جدة', km: 95, factor: 1 },
  { id: 'r5', from: 'مزارات مكة / المدينة', to: 'جولة 4 ساعات', km: 40, factor: 0.9 },
]

export const VEHICLES = [
  ['سيدان', 'sedan', 4, 3, 220, ['تكييف', 'سائق محترف', 'مقاعد مريحة']],
  ['جمس يوكن', 'vip', 7, 5, 420, ['رحابة عالية', 'جلد فاخر', 'سائق محترف']],
  ['هيونداي ستاريا', 'van', 7, 8, 330, ['أبواب واسعة', 'مساحة أمتعة', 'تكييف']],
  ['تويوتا هايس', 'van', 12, 12, 450, ['مساحة أمتعة كبيرة', 'تكييف']],
  ['كوستر', 'minibus', 22, 20, 750, ['مناسب للمجموعات', 'ميكروفون']],
  ['باص 50 راكب', 'bus', 50, 50, 1300, ['مرشد', 'دورة مياه', 'شاشات']],
].map(([name, cls, passengers, bags, base, features], i) => ({ id: 'c' + (i + 1), name, cls, passengers, bags, base, features, hue: 200 + i * 20 }))

export const STATIONS = ['مكة المكرمة (الرصيفة)', 'جدة (السليمانية)', 'مطار جدة (KAIA)', 'رابغ (KAEC)', 'المدينة المنورة']
export const TRAIN_FARES = [
  { id: 't1', from: 'مكة المكرمة (الرصيفة)', to: 'المدينة المنورة', economy: 190, business: 410, mins: 130 },
  { id: 't2', from: 'مكة المكرمة (الرصيفة)', to: 'جدة (السليمانية)', economy: 55, business: 125, mins: 35 },
  { id: 't3', from: 'جدة (السليمانية)', to: 'المدينة المنورة', economy: 150, business: 340, mins: 105 },
  { id: 't4', from: 'مطار جدة (KAIA)', to: 'المدينة المنورة', economy: 150, business: 340, mins: 115 },
  { id: 't5', from: 'مطار جدة (KAIA)', to: 'مكة المكرمة (الرصيفة)', economy: 60, business: 130, mins: 45 },
  { id: 't6', from: 'رابغ (KAEC)', to: 'المدينة المنورة', economy: 95, business: 210, mins: 70 },
]
export const TRAIN_TIMES = ['06:00', '08:00', '10:30', '13:00', '15:30', '18:00', '20:30', '22:00']

export const TOURS = [
  ['زيارة المدينة المنورة — الباقة الأساسية', 'madinah', 4, 20, 60, ['جبل أحد وشهداء أحد', 'مسجد قباء', 'مسجد القبلتين']],
  ['زيارة المدينة المنورة — الباقة الموسعة', 'madinah', 6, 20, 90, ['جبل أحد', 'مسجد قباء', 'مسجد القبلتين', 'البقيع (من الخارج)', 'مزارع النخيل وسوق التمور']],
  ['زيارة المدينة المنورة — الباقة الشاملة', 'madinah', 8, 18, 135, ['جبل أحد', 'مسجد قباء', 'مسجد القبلتين', 'الخندق والمساجد السبعة', 'مجمع طباعة المصحف', 'مزارع النخيل']],
  ['زيارة مكة المكرمة — الباقة الأساسية', 'makkah', 4, 20, 60, ['جبل النور وغار حراء', 'عرفات وجبل الرحمة', 'مزدلفة ومنى']],
  ['زيارة مكة المكرمة — الباقة الموسعة', 'makkah', 6, 20, 95, ['غار حراء', 'جبل ثور', 'عرفات', 'مزدلفة', 'منى والجمرات']],
  ['زيارة مكة المكرمة — الباقة الشاملة', 'makkah', 8, 18, 140, ['غار حراء', 'جبل ثور', 'المشاعر المقدسة', 'معرض الحرمين', 'متحف كسوة الكعبة']],
].map(([title, city, hours, maxGroup, price, stops], i) => ({ id: 'tr' + (i + 1), title, city, hours, maxGroup, price, stops, rating: 4.8, hue: 20 + i * 25 }))

const CATS = {
  ihram: 'ملابس إحرام', zamzam: 'زمزم وتمور', worship: 'أدوات العبادة', perfume: 'عطور وبخور',
  gifts: 'هدايا وتذكارات', travel: 'حقائب السفر', care: 'العناية الشخصية', tech: 'إلكترونيات',
}
export const PRODUCT_CATS = CATS
export const PRODUCTS = [
  ['طقم إحرام رجالي قطن مصري فاخر', 'ihram', 34, 45, 4.8, 214, { size: ['S', 'M', 'L', 'XL'] }, ['للرجال', 'أساسيات الإحرام']],
  ['حزام إحرام جلدي بجيوب مغلقة', 'ihram', 19, 26, 4.7, 168, { size: ['M', 'L'], color: ['أسود', 'بني'] }, ['للرجال']],
  ['عباءة صلاة نسائية خفيفة', 'ihram', 49, 65, 4.6, 92, { size: ['M', 'L', 'XL'], color: ['أسود', 'رمادي'] }, ['للنساء']],
  ['ماء زمزم معبأ 5 لتر', 'zamzam', 18, null, 4.9, 530, null, ['صنع في السعودية']],
  ['تمر عجوة المدينة فاخر 1 كجم', 'zamzam', 42, 55, 4.9, 402, { size: ['500 جم', '1 كجم'] }, ['مناسب للهدايا', 'صنع في السعودية']],
  ['سجادة صلاة سفر بجيب وبوصلة', 'worship', 17, 23, 4.8, 207, { color: ['أخضر', 'كحلي'] }, ['خفيف للسفر']],
  ['مصحف بغلاف جلدي مع حقيبة', 'worship', 26, 34, 4.9, 286, { color: ['بني', 'أسود'] }, ['مناسب للهدايا']],
  ['عداد تسبيح إلكتروني', 'worship', 12, 15, 4.5, 140, null, ['إلكترونيات']],
  ['عطر عود فاخر للرجال 100 مل', 'perfume', 58, 75, 4.8, 176, { size: ['50 مل', '100 مل'] }, ['للرجال']],
  ['دهن عود ملكي 12 مل', 'perfume', 89, 110, 4.7, 88, null, ['مناسب للهدايا']],
  ['بخور مبخرة كهربائية', 'perfume', 39, null, 4.4, 61, null, ['إلكترونيات']],
  ['مجسم الكعبة المشرفة التذكاري', 'gifts', 36, 46, 4.7, 159, { size: ['صغير', 'كبير'] }, ['مناسب للهدايا']],
  ['طقم هدايا العمرة المتكامل', 'gifts', 75, 95, 4.9, 141, null, ['مناسب للهدايا']],
  ['حقيبة ظهر خفيفة للحرم 20 لتر', 'travel', 29, 39, 4.7, 164, { color: ['أسود', 'رمادي'] }, ['خفيف للسفر']],
  ['حقيبة أحذية قماشية للحرم', 'travel', 9, 12, 4.6, 233, null, ['خفيف للسفر']],
  ['مظلة شمسية بحماية UV', 'travel', 19, 25, 4.6, 176, { color: ['أبيض', 'فضي'] }, ['للحر والشمس']],
  ['طقم عناية بدون عطر للمحرم', 'care', 16, 21, 4.8, 264, null, ['حلال بدون عطر', 'أساسيات الإحرام']],
  ['كريم تشققات القدم', 'care', 14, 18, 4.5, 120, null, ['للعناية بالقدمين']],
  ['بخاخ ماء مرطب للوجه', 'care', 11, null, 4.3, 77, null, ['للحر والشمس']],
  ['بطارية متنقلة 20000 مللي أمبير', 'tech', 34, 45, 4.7, 203, { color: ['أسود', 'أبيض'] }, ['إلكترونيات']],
  ['شريحة بيانات سعودية 30 يوم', 'tech', 45, 60, 4.6, 310, { size: ['20GB', 'غير محدود'] }, ['إلكترونيات']],
  ['مروحة رقبة محمولة', 'tech', 25, 32, 4.4, 98, null, ['للحر والشمس', 'إلكترونيات']],
].map(([name, cat, price, compareAt, rating, reviews, variants, tags], i) => ({ id: 'pr' + (i + 1), name, cat, price, compareAt, rating, reviews, variants, tags, stock: 20 + ((i * 17) % 90), featured: i % 4 === 0, hue: (i * 47) % 360 }))

export const POSTS = [
  ['فخ «أرخص عمرة»: أسرار لن تخبرك بها شركات السياحة', 'umrah', 6],
  ['ضوابط العمرة المصرية لموسم 1448هـ: تفاصيل رسمية', 'umrah', 5],
  ['التأشيرة السياحية السعودية بالبصمة عبر إنجاز: الدليل الكامل', 'guides', 7],
  ['دليلك لقطار الحرمين: المحطات، الأسعار، وأفضل الأوقات', 'travel', 5],
  ['مناسك العمرة خطوة بخطوة مع الأدعية', 'guides', 9],
  ['كيف تختار فندقك في مكة: المسافة مقابل السعر', 'travel', 4],
  ['ما الجديد في نسك لموسم الحج القادم؟', 'hajj', 5],
  ['قائمة تجهيز حقيبة المعتمر', 'guides', 3],
].map(([title, cat, mins], i) => ({
  id: 'b' + (i + 1), title, cat, mins, date: inDays(-(i * 9 + 3)), hue: 15 + i * 40,
  excerpt: 'محتوى موثوق يساعدك على التخطيط لرحلتك من البداية حتى العودة: نصائح عملية وتجارب حقيقية من معتمرين.',
  body: ['تبدأ رحلة العمرة بالنية الصادقة والتخطيط الجيد. في هذا الدليل نستعرض أهم النقاط التي يجب معرفتها قبل الحجز.', 'أولاً: قارن البرامج بناءً على المسافة الفعلية للفندق عن الحرم وليس على عدد النجوم فقط، فالمسافة تؤثر على راحتك اليومية أكثر من أي عامل آخر.', 'ثانياً: تأكد من أن السعر يشمل التأشيرة والانتقالات الداخلية والضرائب، واطلب تفصيلاً واضحاً لكل بند.', 'ثالثاً: اقرأ سياسة الإلغاء بعناية واحتفظ بنسخة من الحجز وأرقام التواصل.'],
}))
export const BLOG_CATS = { umrah: 'العمرة', hajj: 'الحج', travel: 'السفر والإقامة', guides: 'أدلة وإرشادات' }

export const FAQ = [
  ['عام', 'ما هي منصة عمرتك؟', 'منصة تجمع برامج العمرة والحج والفنادق والطيران والتأشيرات والنقل في مكان واحد مع مقارنة شفافة وسلة حجز واحدة.'],
  ['عام', 'هل المنصة مرخصة رسمياً؟', 'نعم، نعمل بترخيص وزارة السياحة ووزارة الحج والعمرة، وتجد أرقام التراخيص في أسفل كل صفحة.'],
  ['عام', 'في أي دول تعملون؟', 'نخدم المعتمرين من داخل المملكة ومن مصر والخليج وتركيا وجنوب شرق آسيا.'],
  ['الحجز', 'هل يمكنني حجز أكثر من خدمة معاً؟', 'نعم، كل الخدمات تضاف لسلة واحدة وتدفع مرة واحدة، أو استخدم مُصمم الرحلة لبناء رحلة كاملة.'],
  ['الحجز', 'كيف أعرف المقاعد المتاحة؟', 'كل موعد سفر يعرض عدد المقاعد المتبقية لحظياً ويتم حجز المقعد فور تأكيد الدفع.'],
  ['الفنادق', 'هل الأسعار شاملة الضرائب؟', 'أسعار الفنادق تظهر قبل الضريبة، وتضاف ضريبة القيمة المضافة 15% ورسوم البلدية 5% بوضوح في ملخص الدفع.'],
  ['التأشيرات', 'كم تستغرق التأشيرة؟', 'تختلف حسب النوع من يومين إلى عشرة أيام، والمدة موضحة على كل تأشيرة.'],
  ['التأشيرات', 'ماذا لو رُفضت التأشيرة؟', 'نسترد لك كامل المبلغ عدا رسوم التأشيرة الحكومية غير القابلة للاسترداد.'],
  ['الدفع', 'ما وسائل الدفع المتاحة؟', 'مدى، فيزا، ماستركارد، تحويل بنكي، أو الدفع لاحقاً خلال 24 ساعة لبعض الخدمات.'],
  ['الدفع', 'كيف أستخدم كوبون الخصم؟', 'أدخل الكود في ملخص الطلب قبل الدفع وسيُطبق على الخدمات المؤهلة تلقائياً.'],
  ['الدعم', 'كيف أتابع شكواي؟', 'من صفحة الدعم ستجد كل تذاكرك وحالتها وردود الفريق، ونلتزم بالرد خلال 48 ساعة عمل.'],
  ['الدعم', 'كيف ألغي حجزي؟', 'من رحلاتي اختر الحجز ثم «إلغاء الحجز»، وستظهر لك قيمة الاسترداد قبل التأكيد.'],
].map(([group, q, a], i) => ({ id: 'f' + i, group, q, a }))

export const JOBS = [
  { id: 'j1', title: 'مسؤول تطوير أعمال وتعاقدات فنادق', dept: 'الفنادق', city: 'مكة المكرمة', type: 'دوام كامل', mode: 'حضوري', level: '5+ سنوات' },
  { id: 'j2', title: 'أخصائي خدمة عملاء (موسمي)', dept: 'خدمة العملاء', city: 'المدينة المنورة', type: 'موسمي', mode: 'مختلط', level: '0-1 سنة' },
  { id: 'j3', title: 'مطور واجهات أمامية React', dept: 'التقنية', city: 'الرياض', type: 'دوام كامل', mode: 'عن بُعد', level: '2-4 سنوات' },
]

export const COUPONS = [
  { id: 'cp1', code: 'WELCOME10', type: 'percent', value: 10, minTotal: 0, kinds: [], usesLeft: 999, expiresAt: inDays(90), active: true },
  { id: 'cp2', code: 'UMRAH200', type: 'fixed', value: 200, minTotal: 3000, kinds: ['umrah'], usesLeft: 100, expiresAt: inDays(60), active: true },
  { id: 'cp3', code: 'STORE15', type: 'percent', value: 15, minTotal: 50, kinds: ['product'], usesLeft: 500, expiresAt: inDays(30), active: true },
]

export const REVIEWS = [
  ['عبدالرحمن', 'umrah', 5, 'خدمة ممتازة جزاكم الله خيرا، متعاونين جداً مع العميل.'],
  ['Hassan H.', 'visa', 5, 'Very fast and professional.'],
  ['محمد الغرباوي', 'visa', 5, 'تأشيرة الترانزيت طلعت خلال أيام وأنقذتني من ضياع حجوزات الفنادق.'],
  ['عزة محمود', 'hotel', 4, 'الفندق قريب جداً من الحرم والخدمة ممتازة.'],
  ['ياسمين وهبة', 'visa', 5, 'موقع محترم ومصداقية، أنصح أصدقائي دائماً بالتعامل معهم.'],
  ['أسماء مجدي', 'umrah', 5, 'شكراً جزيلاً لحسن تعاونكم، تنظيم رائع من البداية للنهاية.'],
  ['أحمد الزويلي', 'transport', 4, 'سائق محترم ومواعيد دقيقة، أنصح بخدمة الجمس للعائلات.'],
  ['شادي لاشين', 'tour', 5, 'مرشد ممتاز في جولة المدينة، معلومات تاريخية قيمة.'],
].map(([name, kind, rating, text], i) => ({ id: 'rv' + i, name, kind, rating, text, status: 'approved', createdAt: inDays(-(i * 5 + 2)) }))

export const WEBHOOKS = [
  { id: 'wh1', name: 'نظام المحاسبة (ERP)', url: 'https://erp.example.com/hooks/umretak', events: ['order.confirmed', 'order.cancelled'], active: true },
  { id: 'wh2', name: 'رسائل واتساب للعملاء', url: 'https://wa-gateway.example.com/notify', events: ['*'], active: true },
  { id: 'wh3', name: 'CRM', url: 'https://crm.example.com/api/leads', events: ['lead.created', 'ticket.created'], active: false },
]

export const USERS = [
  { id: 'u-admin', name: 'مدير النظام', email: 'admin@umretak.test', pass: 'admin123', role: 'admin', phone: '+966500000001' },
  { id: 'u-demo', name: 'سامي أحمد', email: 'user@umretak.test', pass: 'user123', role: 'customer', phone: '+966500000002', nationality: 'مصر', homeCity: 'القاهرة' },
]
