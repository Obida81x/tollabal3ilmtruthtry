# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### students-forum (`artifacts/students-forum`)
"Students of Islamic Law Forum" — React + Vite + Tailwind community site grounded in the Salafi methodology.

- Theme: parchment / emerald / gold; Amiri (serif) + Outfit (sans, EN) / Cairo (sans, AR). No emojis.
- Imagery policy: NO images of people, faces, or living beings. Only Arabic calligraphy, geometric SVG patterns (`Pattern.tsx`), and initials avatars.
- Bilingual EN/AR with full RTL support: `lib/i18n.tsx` provides `I18nProvider`, `useI18n`/`useTranslation`, `t("key", { vars })`. Persists in `localStorage` (`students-forum-lang`), auto-detects browser language. Sets `html[lang]` + `html[dir]` via effect. CSS swaps `--app-font-sans` to Cairo and right-aligns text in RTL. `LanguageToggle` (Languages icon, label = *target* language) lives in sidebar, mobile header, landing header, and auth pages. Decorative Arabic phrases (e.g. `طلاب علم`, `بارك الله فيك`) are kept Arabic in both languages — they live under `ar.*` keys. Helpers: `timeAgo(date, t?)` and `formatDateTime(date, locale?, fallback?)` accept the translator/locale.
- Pages: landing, login, register, home (feed + stories + dashboard summary), halaqah list + room (gender-segregated chat), sessions (live + recorded scholarly meetings), library (downloadable PDFs), tests (Aqeedah quizzes with leaderboard), members, profile.
- Auth: cookie-session via `express-session` (`SESSION_SECRET`); `AuthProvider` exposes `useAuth` / `useRequireAuth`. Default seeded admin: `admin` / `password123`.
- Routing: `wouter` v3. NEVER wrap `<Link>` children in `<a>` — Link renders its own anchor; pass `data-testid`, `className`, etc. directly on `<Link>`.
- API hooks: generated React Query hooks from `@workspace/api-client-react` (mutations take `{data}` / `{id}` shape; query helpers expose `getXxxQueryKey()`).

### api-server (`artifacts/api-server`)
Express 5 + Drizzle ORM. Routes registered in `src/routes/index.ts`: auth, users, posts, stories, chat, meetings, books, tests, dashboard.

- CORS: `origin: true, credentials: true`; `trust proxy` enabled for Replit's mTLS proxy.
- Drizzle gotcha: `inArray()` and `sql\`= ANY(${arr})\`` both emit broken row-syntax SQL in this version. Use the `inIds(col, ids)` helper pattern (see `routes/posts.ts` and `routes/dashboard.ts`):
  ```ts
  sql`${col} in (${sql.join(ids.map((id) => sql`${id}`), sql`, `)})`
  ```
- `lib/api-zod/src/index.ts` must only `export * from "./generated/api"` — duplicating zod schemas causes name collisions.
- After pulling schema or spec changes, rebuild project refs: `pnpm --filter @workspace/db exec tsc -b` and `pnpm --filter @workspace/api-zod exec tsc -b`.
- Reseed: `pnpm --filter @workspace/api-server exec tsx src/seed.ts` (idempotent — skips if tests exist).
- Seed data: 6 chat groups (3 brothers / 3 sisters), 8 books (archive.org PDFs), 6 meetings (YouTube + Google Meet), 3 Salafi Aqeedah tests with 18 questions, admin user, 2 welcome posts.
- Chat groups are gender-restricted server-side (403 on mismatch) and listing is filtered by viewer gender.

## Local debugging

Use `https://$REPLIT_DEV_DOMAIN/api/...` (HTTPS) when testing endpoints from the shell — cookies flow through the same-origin proxy.
