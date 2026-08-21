# Suqly

Suqly is a digital commerce and business management platform for small
businesses. It lets a business **Owner** create a store, manage products,
and fulfill orders, while a **Customer** browses stores, adds items to a
per-business cart (a "Zembil"), and places orders.

This is an MVP: two user roles, no employees, no payment gateway, no
delivery/address handling, and in-app notifications only.

## Tech Stack

**Backend**
- NestJS (TypeScript, REST API)
- PostgreSQL + Prisma ORM (v7, with the `prisma-client` generator and a
  `pg` driver adapter)
- JWT authentication (`@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`)
- `bcrypt` for password hashing
- `class-validator` / `class-transformer` for request validation
- Docker (Postgres runs in a container via `docker-compose.yml`)

**Frontend**
- Next.js (App Router) + React + TypeScript
- Plain `fetch` + `useState` (no styling framework yet, no
  React Hook Form / TanStack Query — kept intentionally minimal for the
  MVP; see "Known limitations" below)

## Project Structure

```
suqly/
├── docker-compose.yml   # Postgres container definition
├── backend/              # NestJS API
│   ├── prisma/
│   │   ├── schema.prisma       # all 9 models + enums
│   │   └── migrations/
│   ├── prisma.config.ts        # Prisma 7 connection config
│   └── src/
│       ├── prisma/              # PrismaService/PrismaModule (DB access)
│       ├── auth/                 # register/login, JWT, role guards
│       ├── business/             # store creation/management
│       ├── categories/           # product categories per business
│       ├── products/             # CRUD + publish/unpublish
│       ├── cart/                 # Zembil (per-business shopping cart)
│       ├── orders/                # order placement + status flow
│       └── notifications/        # in-app notifications
└── frontend/              # Next.js UI
    └── app/
        ├── page.tsx              # register / login
        ├── dashboard/page.tsx    # Owner: business, categories, products, orders
        └── store/page.tsx        # Customer: browse, cart, place orders
```

## Data Model

Core entities: `User`, `Business`, `Category`, `Product`, `Cart`,
`CartItem`, `Order`, `OrderItem`, `Notification`.

Key relationships:
- A `User` with role `OWNER` has **one** `Business` (one-to-one).
- A `Business` has many `Category` and `Product` rows.
- A `Cart` (Zembil) belongs to one customer **and** one business — a
  customer has a separate Zembil per business they shop from.
- An `Order` always belongs to exactly one `Business` — products from
  different businesses can never be combined into a single order.
- `OrderItem` stores its own `priceAtPurchase`, so deleting a `Product`
  later never destroys historical order data.

## Business Rules Enforced

- **Products start unpublished.** `published` defaults to `false` at the
  schema level; the owner must explicitly publish a product before
  customers can see it.
- **Adding to a Zembil never touches stock.** Stock is only checked and
  decremented when an order is actually placed, inside a Prisma
  transaction — preventing overselling under concurrent requests.
- **Cancelling an order restores stock.**
- **One business per order**, enforced by the Cart's
  `@@unique([customerId, businessId])` and by only ever reading one
  business's cart when placing an order.
- **Order status flow is validated**, matching the spec exactly:
  `Pending → Processing → Ready → Completed`, or `Pending → Cancelled`.
  There is no separate "Accepted" status — Pending → Processing already
  means the owner accepted the order. Illegal jumps (e.g. Pending →
  Completed directly) are rejected.
- **Customers only register with name + phone** (no address); store
  address/logo/motto/description live on `Business`, not `User`.
- Both roles authenticate with **phone + password** (no email field).

## API Overview

```
POST   /auth/register
POST   /auth/login
GET    /auth/me                          (JWT required)

POST   /business                          (OWNER)
GET    /business/me                       (OWNER)
PATCH  /business/me                       (OWNER)
GET    /business/:id                      (public)

POST   /categories                        (OWNER)
GET    /categories?businessId=1           (public)
PATCH  /categories/:id                    (OWNER, own business only)
DELETE /categories/:id                    (OWNER, own business only)

POST   /products                          (OWNER)
GET    /products?businessId=1             (public, published only)
GET    /products/mine                     (OWNER, includes drafts)
GET    /products/:id                      (public)
PATCH  /products/:id                      (OWNER, own business only)
DELETE /products/:id                      (OWNER, own business only)
PATCH  /products/:id/publish              (OWNER)
PATCH  /products/:id/unpublish            (OWNER)

GET    /carts                             (CUSTOMER)
GET    /carts/:businessId                 (CUSTOMER)
POST   /carts/:businessId/items           (CUSTOMER)
PATCH  /carts/:businessId/items/:id       (CUSTOMER)
DELETE /carts/:businessId/items/:id       (CUSTOMER)

POST   /orders                            (CUSTOMER)
GET    /orders                            (OWNER: their orders, CUSTOMER: their own)
GET    /orders/:id                        (owner or the customer who placed it)
PATCH  /orders/:id/status                 (OWNER)

GET    /notifications                     (JWT required)
PATCH  /notifications/:id/read            (JWT required)
```

## Setup

### Prerequisites
- Node.js
- Docker (with the daemon running — `systemctl start docker` on Linux,
  or the Docker Desktop app on macOS/Windows)

### 1. Start Postgres

From the repo root (`suqly/`):
```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
npm install
```

Create `backend/.env`:
```
DATABASE_URL="postgresql://suqly:password@localhost:5432/suqly?schema=public"
JWT_SECRET="change_this_to_a_long_random_string"
```

Run migrations and generate the Prisma client:
```bash
npx prisma migrate dev
npx prisma generate
```

Start the server:
```bash
npm run start:dev
```
Runs on `http://localhost:3000`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:3001`.

## Demo Flow

1. Register as an **Owner** → land on the dashboard
2. Create a business, add a category, add a product, publish it
3. Register as a **Customer** in a separate browser/incognito window
4. Browse products, add the published one to your Zembil
5. Place the order
6. Back on the Owner dashboard, advance the order:
   Processing → Ready → Completed (or Cancel — this restores stock)

## Known Limitations (by design, matches MVP scope)

- No payment gateway — customers pay outside the platform; owners mark
  orders `Completed` manually.
- No delivery / customer address handling.
- No SMS/WhatsApp/Telegram/push notifications — in-app only.
- No employee accounts — only `OWNER` and `CUSTOMER` roles.
- Frontend has no styling framework yet (plain HTML elements) and uses
  `localStorage` for the JWT — fine for an MVP demo, would need
  revisiting before any real production use.