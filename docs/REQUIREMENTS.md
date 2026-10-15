# Umretak — Business Logic & System Requirements

Reference studied: go-umrah.com (crawled every public route on 2026-10-15).
This document defines the product, the improved business logic, and the system
architecture for a scalable, integration-ready Umrah/Hajj travel platform.
The repo ships a **working UI prototype** (React + localStorage) that implements
this spec end-to-end; the persistence layer is a swappable adapter.

---

## 1. What the reference site does (audit)

| Area | Route | Observed behaviour | Pain points |
|---|---|---|---|
| Home | `/` | Hero with service tiles, Hijri date, countdown to Ramadan/Hajj, featured umrah/hotels/visas/flights/tours/vehicles, reviews, train promo | Very long page, reviews duplicated, WhatsApp is the main CTA everywhere |
| Umrah | `/umrah`, `/umrah/:id` | 124 packages; filters (international/domestic, duration, tier); card shows code, airline, dates, hotels, seats left, room-type prices (quad/triple/double), compare; detail = 4-step booking (details → pilgrim data → payment → confirm) | Price shown only "from"; room-type pricing hidden in cards; compare not persistent |
| Hajj | `/hajj` | Season timeline (apply → lottery → result), international/domestic packages, early-registration form for next season, AI assistant | Season closed state = dead end |
| Hotels | `/hotels`, `/hotels/:id` | Search (city, check-in/out, guests/rooms, coupon), filters (city, area, stars, price, distance, rating, amenities); detail: rooms, amenities, location, reviews, policies; "request preliminary booking"; price often "on request"; VAT 15% + municipality 5% | Price on request breaks self-service |
| Visa | `/visa` | 10 visa products; filters (country, entry type, processing time), sort; card: fee, entry, stay, validity, processing, electronic/biometric, requirements, apply | Requirements list empty for some |
| Flights | `/flights` | One-way / round-trip / multi-city search, airports, date, passengers, airline | No real results surface |
| Transport | `/transport` | Vehicles (sedan 4, GMC 7, Staria 7, Hiace 12, Coaster 22, Bus 50) with luggage, features; 5 routes; train link | Price "on request" |
| Haramain train | `/haramain-train` | 5 stations, route price table (economy/business), durations | Static only |
| Tours | `/tours`, `/tours/:id` | 6 tours Makkah/Madinah basic/extended/full: duration, max group, stops, itinerary; "book now, no payment" | — |
| Store | `/store` | 37 products, 8 categories, tags filter, variants (size/colour), discounts, ratings, quick view, cart, delivery to hotels | Separate cart from services |
| Flexible request | `/flexible-request` | Custom-trip request form + pre-built flexible bundles (flight+visa+barcode+hotel+transport) | — |
| Spin wheel | `/spin` | Logged-in users spin for discount coupons | — |
| Search | `/search` | Global search tabs: all/hajj/umrah/hotels/tours | — |
| Reviews | `/add-review` | Pick service type (or linked booking when logged in), rating + text, published after moderation | — |
| Content | `/blog`, `/faq`, `/about`, `/licenses`, `/careers`, policies | Blog with categories; FAQ grouped; careers with rich filters & apply without account | — |
| Support | `/complaints` | Ticket form (complaint/suggestion/inquiry/praise, optional booking ref) with 48h SLA timeline | No ticket tracking |
| Account | `/login`, `/my-bookings`, `/profile` | Email/password + Google; bookings list | — |
| Global | header | Language AR, currency SAR/EGP, WhatsApp, AI chat | — |

Cancellation policy (kept as business rule): >30 days 90% refund, 15–30 → 70%,
7–14 → 50%, 3–6 → 25%, <3 → 0%. Full refund on death / platform cancellation;
up to 90% on medical; visa rejection → full minus government fee.

---

## 2. Improvements ("better tweaks")

1. **One cart for everything** — packages, hotels, visas, flights, transport, train, tours and store items share a single cart and one checkout. A trip is built like a basket.
2. **Trip Builder** — the flexible request becomes a self-service builder: pick flight + visa + Makkah hotel + Madinah hotel + transport → live total → add to cart or send as quote request.
3. **Transparent pricing** — every item has a computable price; "on request" is replaced by an indicative price + "request quote" path. Taxes (VAT 15 %, municipality 5 % for hotels) are shown as line items.
4. **Room-type pricing on package cards** (quad/triple/double) with live recalculation per traveler count.
5. **Persistent compare & wishlist** for packages and hotels.
6. **Order timeline & self-service cancellation** with refund preview computed from the policy above.
7. **Ticket tracking** for complaints/inquiries (status + replies) instead of fire-and-forget forms.
8. **Hajj closed season → waitlist** with notification preference instead of a dead end.
9. **Coupons engine** shared by spin wheel, admin campaigns and checkout.
10. **Multi-currency** with a single base currency (SAR) and converted display.
11. **Admin console** to manage catalog, orders, tickets, reviews, coupons, users and settings.

---

## 3. Domain model

All entities: `id`, `createdAt`, `updatedAt`. Money stored in **SAR minor-safe numbers** (base currency); display converts.

| Entity | Key fields |
|---|---|
| User | name, email, phone, passwordHash*, role (`customer`/`admin`/`agent`), nationality, favorites[], compare[] |
| Package (umrah/hajj) | kind, code, title, scope (`international`/`domestic`), tier (`economy`/`premium`/`luxury`), nights, departCity, airline, departures[{date, returnDate, seats, seatsLeft}], hotels[{city, hotelId, nights}], includes[], prices{quad, triple, double}, rating |
| Hotel | name, nameEn, city, area, stars, distanceM, rating, amenities[], rooms[{type, capacity, pricePerNight}], policies, featured |
| Visa | title, country, entry (`single`/`multiple`), stayDays, validityDays, processingDays, mode (`electronic`/`biometric`), fee, requirements[] |
| Flight | airline, from, to, date, depart/arrive time, cabin, stops, price, seatsLeft |
| Vehicle | name, class, passengers, bags, features[], pricePerTrip by route |
| Route | id, from, to (5 standard intercity routes) |
| TrainFare | from, to, economy, business, duration |
| Tour | title, city, hours, maxGroup, stops[], itinerary[], price |
| Product | name, category, price, compareAt, rating, reviews, variants{size[], color[]}, tags[], stock |
| Cart | items[{kind, refId, title, unitPrice, qty, meta}] (one per user/session) |
| Order | number `UM-YYYY-#####`, userId, items[], travelers[], contact, payment{method, status}, totals{subtotal, discount, taxes, total}, coupon, status, timeline[], travelDate |
| Coupon | code, type (`percent`/`fixed`), value, minTotal, expiresAt, usesLeft, scope (kinds[]) |
| Review | userId, orderId?, serviceKind, rating, text, status (`pending`/`approved`/`rejected`) |
| Ticket | number, type (complaint/suggestion/inquiry/praise), subject, body, orderRef, status, replies[] |
| Lead | kind (`flexible`/`hajj-waitlist`/`quote`), payload, status |
| Job / Application | job: title, dept, city, type, mode, level ; application: jobId, name, email, cv link |
| Post | title, category, excerpt, body, date, readMins |
| FAQ | group, q, a |
| Settings | currencies/rates, taxes, contacts, cancellation tiers |

### Order state machine
```
pending_payment ──pay──▶ confirmed ──fulfil──▶ completed
      │                     │
      └──cancel──▶ cancelled ◀──cancel (refund per policy)── 
confirmed ──admin──▶ in_progress (visa processing / docs) ──▶ completed
```
Each transition appends to `timeline` with actor and note.

### Pricing rules
- Package line = price[roomType] × travelers.
- Hotel line = Σ nights × room.pricePerNight × rooms; taxes: VAT 15 % + municipality 5 % on hotel lines only.
- Other services: VAT 15 % included in shown price (displayed for transparency).
- Coupon applies to eligible lines before tax; `percent` capped at subtotal, `fixed` ≤ subtotal.
- Refund = paid total × refundRate(daysBeforeTravel) unless exception reason.

### Inventory rules
- Package departure `seatsLeft` decremented on confirm, restored on cancel.
- Flight seats likewise. Store stock decremented on confirm.

---

## 4. Functional requirements

**Customer**
- FR-1 Browse/search/filter/sort every catalog; global search across all kinds.
- FR-2 Detail page for every item with gallery placeholder, includes, policies, reviews.
- FR-3 Add any item to the unified cart with options (room type, dates, variants, travelers, route, class).
- FR-4 Checkout wizard: review → travelers/contact → payment method (card, mada, bank transfer, pay later) → confirmation with order number.
- FR-5 Trip Builder producing a combined cart or a quote lead.
- FR-6 Account: register/login, profile, my orders with timeline, cancel with refund preview, wishlist, compare.
- FR-7 Spin wheel once per user per 24 h, awarding a coupon to the account.
- FR-8 Reviews linked to orders, moderated.
- FR-9 Support tickets with tracking and replies.
- FR-10 Hajj early registration / waitlist; careers apply; flexible request.
- FR-11 Currency switcher (SAR/EGP/USD).

**Admin**
- FR-20 Dashboard KPIs (revenue, orders by status, open tickets, pending reviews).
- FR-21 Orders: list/filter, change status, add note.
- FR-22 Catalog CRUD for all collections (generic JSON editor + tables).
- FR-23 Moderate reviews; reply/close tickets; manage leads & applications.
- FR-24 Coupons CRUD; settings (rates, taxes); reset demo data.

## 5. Non-functional requirements
- RTL Arabic-first, responsive (360 px →), accessible (labels, focus, contrast).
- Performance: list pages paginated / virtualizable; images lazy.
- Security (production): hashed passwords, JWT/session cookies, RBAC, rate limiting, PCI via hosted payment page, audit log.
- Observability: structured logs, order events, web vitals.

## 6. Architecture & integration readiness

```
UI (React)  ──▶  services/api.js (domain logic, pricing, rules)
                        │
                        ▼
                 adapter interface  { list, get, create, update, remove, query }
                 ├── localStorageAdapter   (this prototype)
                 └── httpAdapter (REST / GraphQL)  ← swap in production
```
- **Adapter pattern**: all persistence goes through `db` (`src/lib/db.js`). Replacing it with an HTTP client requires no UI change.
- **Event bus**: `emit('order.confirmed', order)` etc. Integrations subscribe: email/SMS/WhatsApp, accounting, CRM, webhooks.
- **Provider slots** (production): flights (Amadeus/Sabre/Duffel), hotels (Hotelbeds/WebBeds/direct contracts), visa (Nusuk / MOFA), payments (Moyasar/HyperPay/Paymob/Stripe), train (SAR booking), maps, analytics.
- **Public REST API** (target): `/v1/{packages|hotels|visas|flights|vehicles|tours|products}` (GET list/detail), `/v1/cart`, `/v1/orders` (POST/GET/PATCH status), `/v1/tickets`, `/v1/reviews`, `/v1/coupons/validate`, outbound webhooks `order.*`, `ticket.*`, `review.*`, signed with HMAC.
- Multi-tenant ready: every entity can carry `tenantId` (agencies/B2B partners); pricing rules per tenant.

## 7. Prototype scope (this repo)
Everything in §4 is clickable with seeded data persisted in `localStorage`
(key prefix `umretak:`). Demo accounts: `admin@umretak.test` / `admin123`,
`user@umretak.test` / `user123`. "Reset demo data" in admin restores the seed.
