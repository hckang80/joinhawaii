# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Approach

Read existing files before writing. Don't re-read unless changed.
Thorough in reasoning, concise in output.
Skip files over 100KB unless required.
No sycophantic openers or closing fluff.
No emojis or em-dashes.
Do not guess APIs, versions, flags, commit SHAs, or package names. Verify by reading code or docs before asserting.

## Commands

```bash
bun run dev          # Next.js dev server with Turbopack
bun run build        # Production build
bun run type-check   # TypeScript check (no emit)
bun run lint         # ESLint
bun run lint:fix     # ESLint with auto-fix
bun run format       # Prettier write
bun run format:check # Prettier check
bun run ci           # Full check: type-check + lint + format:check + build
bun run ci:fix       # Auto-fix: lint:fix + format
```

There are no tests. There is no single-test command.

## Architecture

**Stack**: Next.js 15 (App Router, Turbopack, React Compiler), React 19, TypeScript, Supabase, TanStack Query v5, react-hook-form, @legendapp/state, Radix UI Themes, CSS Modules.

### Route groups

- `(dashboard)` -- authenticated admin UI with sidebar/header layout. All routes require `manage` permission.
- `(popup)` -- pages opened as new browser windows (e.g. `/progress`). Communicates back to the opener via `postMessage`.
- `login` -- public auth page.
- `api/` -- Next.js Route Handlers; all DB access goes through these, not direct Supabase calls from the client.

### Authentication and authorization

`src/middleware.ts` delegates to `src/lib/supabase/middleware.ts`. Every request (except `/`, `/login`, `/error`, static assets) is gated. After confirming a Supabase session, it calls `/api/auth/profile` to verify the user has the `manage` permission. Non-managers receive a 404 response.

Exception: `/reservations/preview` can be accessed without a session if a valid `token` + `reservation_id` query param pair is present (JWT issued by `src/lib/supabase/reservation-jwt.ts`).

### Data layer

- **`src/http/index.ts`** -- all fetch calls (client-callable functions). Used by both client components and API routes.
- **`src/lib/supabase/client.ts`** -- browser Supabase client.
- **`src/lib/supabase/server.ts`** -- server Supabase client (used in Route Handlers and Server Components).
- **`src/lib/supabase/queries/reservation.ts`** -- shared Supabase query helpers called from Route Handlers.
- **`src/lib/queries/index.ts`** -- TanStack Query `queryOptions` factories (`productsQueryOptions`, `reservationQueryOptions`).

### Page/component file conventions

- `page.tsx` -- Server Component; passes minimal props or renders a client container.
- `__client.container.tsx` -- Client Component holding the bulk of interactivity (queries, mutations, form state).
- Form sub-components (e.g. `FlightForm.tsx`, `HotelForm.tsx`) receive `data`, `mutation`, and `handleAdditionalOptions` as props (typed via `ProductFormProps` in `src/types/index.ts`).

### State management

- **Server state**: TanStack Query. The `reservationQueryOptions` is shared between the form page and other views; refetch is triggered on window focus and on `postMessage` from popup windows.
- **Local UI state**: `@legendapp/state` (`observable()`). Used for ephemeral overlay/dialog state (e.g. `AdditionalOptionsEditor` open state in the reservation form container).
- **Form state**: react-hook-form `useForm` / `Controller`. All product forms are controlled.

### Types

`src/types/index.ts` is the single type file. Most domain types (`Client`, `Flight`, `Hotel`, `Tour`, `Car`, `Insurance`, `ProductValues`, etc.) are derived from the `default*Values` constants in `src/constants/index.ts` using `typeof`. The `Database` interface mirrors Supabase table schemas and is used to type Supabase query calls.

### Reservation ID format

`YYYYMMDD-JH###` (e.g. `20260619-JH001`). Generated in `POST /api/reservation` by querying the latest reservation for the day and incrementing the sequence.

### Product types

`flight | hotel | tour | rental_car | insurance`. The plural table names (`flights`, `hotels`, `tours`, `rental_cars`, `insurances`) are used as Supabase table identifiers and in the `ReservationProducts` type. Each product record stores `total_amount` (USD) and `exchange_rate`; KRW values (`total_amount_krw`, `total_cost_krw`) are computed at read time in the API, never stored.

### API routes

| Route                       | Methods          | Purpose                              |
| --------------------------- | ---------------- | ------------------------------------ |
| `/api/reservation`          | GET, POST, PATCH | Reservation CRUD                     |
| `/api/product`              | GET, DELETE      | Product list and deletion            |
| `/api/product/status`       | PATCH            | Update individual product status     |
| `/api/product/options`      | GET, PATCH       | Additional options per product       |
| `/api/send-reservation-pdf` | POST             | Email PDF via nodemailer + puppeteer |
| `/api/location-images`      | GET              | Supabase Storage image listing       |
| `/api/auth/profile`         | GET              | Check user permissions               |
| `/api/auth/callback`        | GET              | Supabase OAuth callback              |

### Supabase RPC functions

- `create_reservation` -- atomic insert of reservation + related tables.
- `calculate_reservation_total` -- recalculates and updates stored totals; called after PATCH.
- `update_product_status` -- updates a single product's status and returns new totals.

### Styling

CSS Modules (`.module.css` co-located with components). Radix UI Themes provides the design system primitives. `clsx` for conditional class names. `print.css` at app root handles print layout for vouchers and confirmation sheets.
