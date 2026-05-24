# Students of Islamic Law Forum

A bilingual (English/Arabic) community platform for students of Islamic law grounded in the Salafi methodology. Features posts, stories, halaqah chat rooms, live sessions, a book library, knowledge tests, member profiles, and an admin panel.

## Run & Operate

- Workflows start automatically: `artifacts/api-server` (port 8080) and `artifacts/students-forum` (port 25398)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server exec tsx src/seed.ts` — reseed database (idempotent)
- Required env secrets: `DATABASE_URL`, `SESSION_SECRET`
- Optional env secrets: `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`, `ADMIN_PANEL_PASSWORD`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS v4, wouter routing, TanStack Query
- API: Express 5 + express-session (cookie auth)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod, drizzle-zod
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild
- Fonts: Amiri (serif Arabic), Outfit (EN sans), Cairo (AR sans)
- Storage: Replit Object Storage (via `/api/storage/`)

## Where things live

- `artifacts/students-forum/src/` — React frontend
  - `pages/` — all page components (landing, login, register, home, feed, halaqah, sessions, library, tests, members, profile, admin)
  - `components/` — shared components (PostCard, StoryTray, Pattern, InitialsAvatar, etc.)
  - `hooks/` — custom hooks
  - `lib/` — i18n provider, utilities
- `artifacts/api-server/src/routes/` — Express route handlers
- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `lib/db/src/schema/` — Drizzle schema (source of truth for DB)
- `lib/api-client-react/src/generated/` — auto-generated React Query hooks (do not edit)
- `lib/api-zod/src/generated/` — auto-generated Zod validators (do not edit)

## Architecture decisions

- Cookie-session auth via `express-session` with `SameSite=None; Secure` for cross-origin mTLS proxy compatibility
- Chat groups are gender-restricted server-side (403 on mismatch); listing filtered by viewer gender
- Drizzle `inArray()` emits broken row-syntax SQL in this version — use the `inIds(col, ids)` helper in routes
- `lib/api-zod/src/index.ts` must only `export * from "./generated/api"` — exporting types separately causes name collisions
- Imagery policy: NO images of people/faces/living beings; only Arabic calligraphy, geometric SVG (`Pattern.tsx`), initials avatars
- NEVER wrap `<Link>` children in `<a>` — wouter v3 Link renders its own anchor

## Product

Students of Islamic Law Forum (مجلس طلاب العلم): A quiet online majlis for seekers of knowledge. Members can post to a feed, share stories, join gender-segregated halaqah chat rooms, attend/publish live sessions, browse a library of Islamic books, take knowledge tests, and view member profiles. Admins can manage content, users, books, and meetings.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Run `pnpm --filter @workspace/api-spec run codegen` after changing `lib/api-spec/openapi.yaml`
- After pulling schema or spec changes, rebuild project refs: `pnpm --filter @workspace/api-zod exec tsc -b` and `pnpm --filter @workspace/db exec tsc -b`
- Do not run `pnpm dev` at workspace root — no dev script exists there by design
- Default admin credentials: `admin` / `password123` (seeded)
- Admin panel also protected by `ADMIN_PANEL_PASSWORD` env var (default `admin1234`) for non-main-admins

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
