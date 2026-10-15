# Admin Console — Spec (deferred)

The admin console is **not built yet**. This spec is ready for when it is. It reuses
the same data layer (`app/src/lib/db.js`) and domain logic (`app/src/lib/logic.js`)
as the customer app. These functions already exist: `kpis()`, `setStatus()`,
`markPaid()`, `cancelOrder()`, `replyTicket()`, `ensureSeed(true)`.

## Visual pattern (from the KAYAK for Business admin hub, frames 259–287)
- Left sub-nav with collapsible groups. Top: "← Back to site".
- Peach welcome banner (`--peach #fdecd9`) with a quick-start guide stepper (Overview → Orders → Catalog → Users → Next steps). The banner can be dismissed.
- "Admin hub" grid of tiles: icon, title and one-line description.
- Tables use the shared `.table`. Detail views open in a `.modal.wide`.
- Route: `/admin/*`. Only `role === 'admin'` can open it; everyone else is redirected to `/`. Seeded admin account: `admin@umretak.test` / `admin123`.

## Sections

| Section | Route | Purpose | Actions |
|---|---|---|---|
| Hub | `/admin` | KPIs: revenue collected, order count, average order value, pending payment, open tickets, reviews to moderate, new leads, events sent. Bar list of revenue by service kind. Latest 5 orders. Tiles to every section. | Dismiss guide |
| Orders | `/admin/orders` | Search by number, name or email. Filter by status. Columns: number, customer, services, date, payment, status, total. | Open detail → record payment (`markPaid`), move to `in_progress`, `completed`, or cancel by the platform (full refund). Add a note that the customer sees on their timeline. View the audit timeline. |
| Catalog | `/admin/catalog` | One editor for every collection: packages, hotels, visas, vehicles, routes, trainFares, tours, products, posts, faq, jobs. | Add from a template of the first row, edit, delete. Changes appear on the site immediately. In production, replace the generic JSON editor with schema-validated forms. |
| Tickets | `/admin/tickets` | Tabs: open / answered / closed. | Reply (sets status to `answered`), close. |
| Reviews | `/admin/reviews` | Tabs: pending / approved / rejected. Order-linked reviews show a "verified" badge. | Approve, reject. |
| Leads | `/admin/leads` | Flexible trips, the Hajj waitlist, quote requests, job applications. | Pipeline status: new → contacted → won / lost. |
| Coupons | `/admin/coupons` | Campaign coupons. Spin-wheel coupons tied to a user are hidden. | Create (code, percent/fixed, value, minimum total, service kind, uses, expiry). Activate/deactivate toggle. |
| Users | `/admin/users` | Name, email, order count, sign-up date. | Change role: customer / agent / admin. The seed admin's role is locked. |
| Integrations | `/admin/integrations` | Webhook subscriptions (seeded: ERP, WhatsApp, CRM). Event outbox log, which reads the `events` collection that `emit()` writes. API contract reference. | Add or remove webhooks, toggle them on/off. |
| Settings | `/admin/settings` | Exchange rates (EGP/USD/EUR per 1 SAR), VAT %, municipality % (hotels), contacts. | Save. Reset demo data (`ensureSeed(true)`) after a confirm modal. |

## Events published (already emitted by the customer app)
`order.created`, `order.confirmed`, `order.in_progress`, `order.completed`,
`order.cancelled`, `ticket.created`, `lead.created`, `user.registered`.

## Production notes
- Enforce RBAC on the server. The admin UI only reflects it.
- Write an audit-log entry for every admin action (actor, before, after).
- Sign webhooks with HMAC-SHA256 and retry with backoff. Keep a dead-letter queue.
- Agents (B2B role) see only their own tenant's catalog and orders (`tenantId`).
