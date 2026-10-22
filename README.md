# Nook

A polished e-commerce starter built with Next.js App Router, React, Tailwind CSS, Framer Motion, Lucide, and MongoDB/Mongoose.

## Getting started

Requirements: Node.js 20+ and a MongoDB connection string.

1. Install packages with `npm install`.
2. Copy `.env.example` to `.env.local` and set `MONGO_URI`, a private `AUTH_SECRET` (at least 32 characters; generate one with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`), and optionally `OPENAI_API_KEY` for AI product search. `OPENAI_KEY` is also accepted for existing local setups.
3. Start the app with `npm run dev`.
4. Add/update the curated starter products by sending `POST http://localhost:3000/api/seed`.
5. Open [http://localhost:3000](http://localhost:3000).

The home page shows sample products if MongoDB is not configured or the catalog is empty. After seeding, the catalog endpoint supplies the live products.

## Project structure

```text
app/
  api/
    auth/route.js
    orders/route.js
    products/route.js
    requests/route.js
    seed/route.js
  components/
    CartProvider.tsx
    Navbar.tsx
  globals.css
  layout.tsx
  page.tsx
lib/
  db.js
  sample-products.ts
models/
  customRequest.js
  order.js
  product.js
  user.js
```

## Database models

- `User` stores a unique, normalized email, a password hash (never a raw password), and a customer/admin role.
- `Product` stores price, stock, category, images, ratings, tags, and featured status.
- `Order` stores item snapshots, totals, shipping address, payment method/status, and order status.
- `CustomRequest` stores customer contact details, requested item, optional budget, and request status.

All schemas use timestamps and model reuse to work with Next.js development reloads. The order schema requires an authenticated user's ID; authentication and write endpoints are follow-on work.

## API routes

- `GET /api/products` returns up to 48 featured/recent products.
- `POST /api/seed` adds or updates the curated sample products without deleting other catalog items.
- `POST /api/auth` creates an account or signs in; `GET /api/auth` checks the current session and `DELETE /api/auth` signs out.
- `POST /api/orders` saves a signed-in customer's order and stock changes in a MongoDB transaction; `GET /api/orders` lists that customer's orders.
- `POST /api/requests` saves a custom product request.
- `POST /api/search` parses shopping intent with OpenAI (`gpt-4o-mini`) when a key is available, then filters the MongoDB product list; it falls back to local keyword/budget matching if the service is unavailable.

`MONGO_URI` determines both the Atlas cluster and database. For example, a URI ending in `/test` stores data under the `test` database in Atlas. Create an account, submit an order, or submit a custom request to make the corresponding `users`, `orders`, and `customrequests` collections appear.

Order totals and item prices are calculated on the server from the MongoDB product records. Demo payment choices are recorded as pending; no actual payment is collected. Session cookies are HTTP-only and signed with `AUTH_SECRET`; passwords are stored using scrypt hashes. Customers can view their saved orders at `/account`. Product images use a local fallback when a remote image is unavailable.
