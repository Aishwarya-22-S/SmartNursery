# GreenLeaf Nursery - Full-Stack Application

A smart nursery management platform with plant shopping, AI-assisted plant
health monitoring (simulated), and role-based access control for three user
roles: **Admin**, **Staff**, and **Customer**.

## What this is now

This started as a frontend-only demo (everything hard-coded / in
`localStorage`). It's now a **real full-stack app**:

```
React (Vite)  --->  Express REST API  --->  MongoDB
 :5173               :5000                   :27017
```

- **Auth is real**: JWT + bcrypt-hashed passwords, issued and verified by
  the backend. Nothing on the login form can choose a role - the backend
  looks the account up and decides.
- **Authorization is enforced server-side**: every protected API route
  checks the caller's role from a verified JWT, not just the frontend
  hiding a sidebar link. A customer's token cannot call an admin-only
  endpoint no matter what the browser shows.
- **Cart, wishlist, orders, payments, inventory, notifications and
  settings all live in MongoDB**, not `localStorage` or hard-coded arrays.
  Guests (not logged in) still get a working local-only cart so browsing
  the catalog before logging in behaves the same as it always did.
- **Totals are computed on the backend.** Checkout never trusts a total
  sent from the browser - the server reads the customer's persisted cart,
  validates stock, and calculates the amount itself.

The existing frontend's pages, layout, sidebar, dashboards, Settings and
navigation are all unchanged - only their data source changed, from
hard-coded/localStorage to real API calls.

## Project layout

```
greenleaf-nursery/
├── src/                 # the existing React/Vite frontend (unchanged UI)
│   ├── services/
│   │   ├── api.js         # NEW - central fetch wrapper, attaches the JWT
│   │   └── authService.js # login/register/session now call the backend
│   └── context/
│       └── AppContext.jsx # cart/wishlist/orders/notifications/settings
│                           # now sync with the backend instead of demo data
└── server/               # NEW - Express + MongoDB backend
    ├── config/db.js
    ├── models/            # User, Plant, Cart, Wishlist, Order, Payment,
    │                       # Notification, Settings
    ├── controllers/
    ├── middleware/         # JWT auth, role checks, error handling
    ├── routes/
    ├── seed/seedData.js    # sample admin/staff/customer + plants + order
    └── server.js
```

## Prerequisites

- Node.js 18+
- A MongoDB instance - either:
  - **Local**: install MongoDB Community Server and run `mongod`, or
  - **Atlas**: a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas),
    and use its connection string instead of the local one below.

## 1. Backend setup

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env` if needed (defaults work for a local MongoDB):

```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/greenleaf_nursery
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Seed some sample data (accounts + plant catalog + a demo order):

```bash
npm run seed
```

This creates:

| Role     | Email                    | Password |
|----------|---------------------------|----------|
| Admin    | `admin@greenleaf.com`     | `123456` |
| Staff    | `staff1@greenleaf.com` (also `staff2`, `staff3`) | `123456` |
| Customer | `customer@greenleaf.com`  | `123456` |

Start the backend:

```bash
npm run dev      # nodemon, auto-restarts on change
# or
npm start        # plain node
```

You should see:

```
MongoDB connected: 127.0.0.1/greenleaf_nursery
GreenLeaf Nursery backend running on http://localhost:5000
```

Verify it's alive: `curl http://localhost:5000/api/health` →
`{"success":true,"message":"Backend server is running"}`

## 2. Frontend setup

In a **second terminal**, from the project root (not `/server`):

```bash
npm install
cp .env.example .env.local   # already points VITE_API_URL at localhost:5000/api
npm run dev
```

Frontend: `http://localhost:5173`

The frontend calls the backend at `VITE_API_URL` (defaults to
`http://localhost:5000/api` if not set).

### Enable Google sign-in

The **Continue with Google** button uses Firebase Authentication. In the
[Firebase Console](https://console.firebase.google.com), create/select a
project, add a Web App, enable **Google** under **Authentication → Sign-in
method**, and add `localhost` plus the app's deployed hostname under
**Authentication → Settings → Authorized domains**. Copy the six Web App
config values into the matching `VITE_FIREBASE_*` entries in `.env.local`,
then restart the Vite frontend. Do not put a Firebase Admin SDK service
account key in frontend environment variables. New Google identities are
onboarded as Customer accounts unless an existing account with that verified
email already has a trusted role. Until all six values are configured, the
login page disables the Google button and directs users to email/password.

## 3. Log in

Seeded accounts continue to use their stored roles and password `123456`.
For local demos, first login with a new email whose name ends in `.admin`,
`.staff`, or `.customer` creates that account with the entered password and
routes it to the matching dashboard. Examples: `aishu.admin@example.com`,
`ajay.staff@example.com`, and `priya.customer@example.com`. The first-login
password must be at least six characters; later logins must use that same
password. Existing accounts are never re-assigned a role from their email.

This convenience is enabled by `EMAIL_ROLE_DEMO_MODE=true` only when
`NODE_ENV` is not `production`. It is **not safe for a public or production
deployment**: anyone who can reach such a development server could create an
Admin account by using an email ending in `.admin`. Disable it and provision
trusted accounts before deployment.

Staff can open the Plant Category catalogue (view/search/filter) and use the
Inventory Management page (view, add, edit, and delete inventory). Customer
accounts cannot access Inventory Management. These permissions are enforced
in both the frontend routes and backend API.

## API overview

All routes are under `/api`. Protected routes require
`Authorization: Bearer <token>`.

| Resource | Routes |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/google`, `GET /auth/me`, `POST /auth/logout` |
| Users | `GET/PUT /users/profile` (self), `GET /users`, `GET/PUT/DELETE /users/:id`, `PUT /users/:id/status` (admin) |
| Plants | `GET /plants`, `GET /plants/:id` (public); `POST/PUT/DELETE /plants/:id`, `PUT /plants/:id/restock` (admin) |
| Cart | `GET/POST /cart`, `PUT/DELETE /cart/:itemId`, `DELETE /cart` (customer) |
| Wishlist | `GET/POST /wishlist`, `DELETE /wishlist/:plantId` (customer) |
| Orders | `POST /orders` (customer, places from their cart), `GET /orders` (own for customer, all for admin/staff), `GET /orders/:id`, `PUT /orders/:id/status` (admin/staff), `DELETE /orders/:id` (admin) |
| Payments | `GET /payments`, `POST /payments`, `PUT /payments/:id/verify`, `PUT /payments/by-order/:orderId/verify` (admin/staff) |
| Inventory | `GET/POST /inventory`, `PUT/DELETE /inventory/:id` (admin/staff) - same underlying Plant collection as `/plants` |
| Notifications | `GET /notifications`, `POST /notifications` (admin/staff), `PUT /notifications/:id/read`, `PUT /notifications/read-all`, `DELETE /notifications/:id` |
| Settings | `GET/PUT /settings` (theme, font size, language, accent color) |

Orders and payments accept either the order's Mongo `_id` **or** its
human-friendly `orderNumber` (e.g. `ORD-1234`) in the URL - the frontend
only ever uses the latter, exactly as it did when orders were local state.

## Authentication & Authorization

- Passwords are hashed with **bcrypt** before being stored - never in
  plain text.
- Login/register return a **JWT** (default 7-day expiry) which the
  frontend stores and sends as `Authorization: Bearer <token>` on every
  request (`src/services/api.js`).
- `server/middleware/authMiddleware.js` verifies the JWT **and re-loads
  the user from MongoDB on every request**, so a role change or account
  suspension takes effect immediately - not just on the user's next login.
- `server/middleware/roleMiddleware.js` (`authorize(...roles)`) enforces
  which roles can call which routes. Admin always passes. A customer's
  token calling an admin-only route (e.g. `DELETE /users/:id`) gets a
  `403`, regardless of anything the frontend does.
- New accounts - including Google sign-ins - are always created with the
  `customer` role server-side. Nothing in any request body can set a role.

## Order & Payment Flow (now backend-driven)

```
Customer                          Backend                      Staff / Admin
   |                                  |                              |
   | Add to cart -----------------> Cart persisted in MongoDB        |
   | Checkout: pay method+address    |                                |
   |--------------------------------> Reads customer's persisted cart |
   |                                  Validates stock                 |
   |                                  Computes total (never trusts    |
   |                                  the browser's number)           |
   |                                  Creates Order + Payment(pending)|
   |                                  Decrements Plant stock          |
   |                                  Notifies Admin + Staff ---------|
   |                                                                  |
   |                                          Payment Verification:  |
   |                                          sees pending payments, |
   |                                          clicks Verify           |
   |<-------------------------------- Notifies customer -------------|
   |                                                                  |
   | Order Tracking shows live       Staff "Advance" moves the order |
   | status from MongoDB             through its status timeline ----|
   |<-------------------------------------------------------------- |
```

## Google Sign-In

The "Continue with Google" button uses a real Firebase Authentication
integration (`src/services/authService.js`). Once Firebase confirms the
identity client-side, the profile is sent to `POST /api/auth/google`,
which finds-or-creates the matching MongoDB user and issues a normal JWT
session - so a Google sign-in gets the exact same persistent cart, orders
and settings as an email/password account.

### To enable it

1. Create a project at the [Firebase Console](https://console.firebase.google.com)
2. Authentication → Sign-in method → enable **Google**
3. Project settings → General → copy your web app's config values
4. Fill them into the frontend's `.env.local` (see `.env.example`):
   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```
5. `npm install firebase` (not installed by default, to keep the base
   project lightweight)
6. Restart `npm run dev`.

Until all of the above is done, clicking "Continue with Google" shows a
clear "Google sign-in is not configured yet" message rather than silently
failing.

## Settings (Theme / Language / Font Size / Accent Color)

Still available from the ⚙️ dropdown in the navbar. For a logged-in user
these now persist to MongoDB (`Settings` model, one document per user) as
well as `localStorage`, so preferences follow the account across devices/
browsers, not just the one browser that set them.

## Testing the access control yourself

1. Log in as `customer@greenleaf.com`, then type `/admin` directly into
   the address bar → redirected to `/access-denied` (frontend), **and**
   any admin API call from dev tools with the customer's token returns
   `403` (backend).
2. Log in as `admin@greenleaf.com`, open Inventory, restock a plant → the
   new quantity shows immediately in the Plant Catalog too (same MongoDB
   record).
3. Log in as the customer, add plants to cart, checkout → the order
   appears in Order History (customer) and Payment Verification
   (admin/staff, in another browser/incognito window) - both reading from
   the same MongoDB `orders` collection.
4. Log out and back in (or refresh) → cart, wishlist, orders and settings
   are still there, because they were never only in `localStorage`.

## Known limitations

1. **No real payment gateway** - "Verify" flips a `Payment`/`Order` status
   in MongoDB; no money actually moves. This matches the original scope
   (a real gateway integration was explicitly out of scope).
2. **AI/IoT pages are still simulated** - Disease Detection, Plant Health,
   IoT Dashboard and the Chatbot remain frontend-only demo features (no
   real model, no real sensors), unchanged from before. Nothing in the
   task asked for real backends for these.
3. **Google Sign-In** needs your own Firebase project + `npm install
   firebase` to actually authenticate - it will not work out of the box.
4. This was built and tested against MongoDB structurally (schema
   validation, route wiring, auth flow) in an environment without local
   network access to run a live `mongod` instance. **Run `npm run seed`
   and click through Login → Cart → Checkout → Payment Verification once
   yourself** after setup to confirm everything behaves as expected in
   your environment.

## License

© 2024 GreenLeaf Nursery. All rights reserved.
