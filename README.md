# عمرتك — Umrah booking UI prototype

A complete, clickable UI. All data is seeded and every action persists to `localStorage`, with no backend.
The visual language is adapted from the KAYAK web reference (`design-ref/`) and recast for Umrah, in RTL Arabic.
The business rules follow `docs/REQUIREMENTS.md`.

```bash
cd app && npm install && npm run dev
```

- Demo account: `user@umretak.test` / `user123` (also available as a one-click button in the sign-in modal).
- Business-rule check: `node app/scripts/check-logic.mjs`
- Admin console: deferred, see `docs/ADMIN_CONSOLE.md`. A seeded admin account (`admin@umretak.test` / `admin123`) exists for later.

## Brand identity & assets
- **Brand mark:** the Kaaba inside an eight-point star (khatam), shown next to the tiled Arabic wordmark (`BrandMark` in `app/src/icons.jsx`).
- **Islamic icon set** (`app/src/icons.jsx`), built on the same 24px stroke grid as lucide: Kaaba, Tawaf, Mosque, GreenDome, Minaret, ClockTower, Crescent, CrescentStar, Lantern, Tasbih, Quran, PrayerMat, Ihram, Zamzam, Palm, MinaTent, Mihrab, Hills (Sa'i), Scissors (Halq), Star8, Dua.
- **Pattern:** a khatam lattice (`--khatam`) on the hero and in the dark footer. Gold (`--gold`) is used as a secondary accent next to the KAYAK-style orange.
- **Photography** (`app/src/lib/media.js`): about 170 curated Unsplash photos covering Makkah, Madinah, the clock tower, hotel rooms, lobbies and dining, the train, planes, mosque interiors, dates, tasbih, Quran, prayer mats, oud, passports, vehicles, desert and Jeddah. They are free to use under the Unsplash License and hotlinked from the Unsplash CDN. If a photo fails to load or you are offline, a branded gradient with an icon shows instead. For production, copy them to your own CDN and change `src()`.

## Structure
| Path | What |
|---|---|
| `app/src/lib/db.js` | Persistence adapter plus an event outbox. Swap it for an HTTP client to go live. |
| `app/src/lib/logic.js` | Pricing, taxes, coupons, cart, orders, inventory, refunds, auth, support, spin wheel. |
| `app/src/lib/seed.js` | Demo catalog. Dates are relative to today. |
| `app/src/index.css` | Design tokens and components (KAYAK-derived). |
| `app/src/pages/*` | Home, Umrah/Hajj/Compare, Hotels, Flights, Visa/Transport/Train/Tours, Store, Trip Builder, Checkout, Trips, Account/Saved/Spin, Blog/FAQ/About/Policies/Careers/Reviews/Support/Search. |
