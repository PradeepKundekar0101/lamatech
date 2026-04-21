# Trail — Reports trial task

A small Next.js (App Router) + TypeScript app backed by Supabase (Postgres + RLS):

- `/reports` — server-rendered list with **server-side** search + sort.
- `/reports/[id]` — server-rendered detail view with an AI summary that
  handles loading, success, and error states on the client.
- `/api/reports` and `/api/reports/[id]` — JSON API, Postgres-backed via
  Supabase, same query layer the page uses.
- `/api/reports/[id]/summary` — generates the AI summary (real OpenAI when
  `OPENAI_API_KEY` is set, deterministic mock otherwise).
- `/admin` — role-gated route enforced in `middleware.ts`. Non-admins are
  rewritten to `/forbidden` before the page ever renders.
- All styling in `*.module.scss` with shared design tokens in `styles/tokens.scss`.

---

## Getting started

```bash
pnpm install
cp .env.example .env.local   # fill in Supabase URL + publishable key
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...

# Optional — without a key, summaries use a deterministic local mock.
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

# Mock tuning (only used when OPENAI_API_KEY is unset)
AI_MOCK_LATENCY_MS=900
AI_MOCK_FAILURE_RATE=0     # 0..1, e.g. 0.5 forces ~half of summary calls to fail
```

> `NEXT_PUBLIC_*` keys are sent to the browser, so use the **publishable**
> key (or legacy `anon`) — never `service_role`.

### Database

Schema and seed data live under `supabase/`:

```
supabase/
  migrations/20260421162336_create_reports_table.sql
  seed.sql
```

Against a fresh project, apply them in order:

```bash
psql "$DATABASE_URL" -f supabase/migrations/20260421162336_create_reports_table.sql
psql "$DATABASE_URL" -f supabase/seed.sql
```

The migration enables RLS on `public.reports` and adds a `SELECT` policy for
`anon` + `authenticated`. No write policies are defined — the public API is
read-only.

---

## Project layout

```
app/
  api/reports/route.ts                 GET /api/reports (q, sort, dir, category)
  api/reports/[id]/route.ts            GET /api/reports/:id
  api/reports/[id]/summary/route.ts    GET|POST → AI summary
  reports/page.tsx                     /reports (server) — fetches via API
  reports/loading.tsx                  Streaming skeleton
  reports/error.tsx                    Route-level error boundary
  reports/[id]/page.tsx                /reports/:id (server)
  reports/[id]/not-found.tsx           404 for unknown ids
  admin/page.tsx                       Role-gated admin (middleware enforces)
  forbidden/page.tsx                   Rewrite target for unauthorised access
components/
  ReportCard/                          Reusable card used on the list page
  SearchSortBar/                       Client component, drives URL params
  AiSummary/                           Loading / success / error states
  SiteHeader/                          Header + cookie-based RoleSwitcher
lib/
  supabase/server.ts                   SSR-aware server client (@supabase/ssr)
  supabase/browser.ts                  Browser singleton (unused today, wired)
  supabase/env.ts                      Validated env var access
  database.types.ts                    Generated from the live schema
  data/reports.ts                      Query layer used by API + pages
  ai.ts                                Mock summarizer + optional OpenAI client
  auth.ts                              Shared role constants
  auth.server.ts                       Server-only role reader (next/headers)
  url.ts                               Resolves the request base URL on the server
  types.ts                             Shared domain types
supabase/
  migrations/                          Versioned schema changes
  seed.sql                             Seed data
styles/
  tokens.scss                          Colour, spacing, type, breakpoints
  mixins.scss                          Card, focus ring, button reset
middleware.ts                          Role gate for /admin/*
```

---

## Notable decisions

- **Search + sort happens on the server, not in the browser.** The
  `SearchSortBar` is a client component whose only job is to push URL params;
  the `/reports` page is a server component that re-renders by calling
  `/api/reports`. That route hits Supabase with a typed Postgrest query
  (`ilike` across `title/author/summary/body`, `order` by the chosen column).

- **One query layer, two callers.** Both API routes and server components
  go through `lib/data/reports.ts`, so the API and server rendering can
  never drift.

- **Typed end-to-end.** `lib/database.types.ts` is generated from the live
  schema (`supabase db pull` / MCP `generate_typescript_types`). The
  `@supabase/ssr` clients are instantiated as `createServerClient<Database>`
  so every query is type-checked.

- **RLS by default.** `public.reports` has RLS enabled with a single
  `SELECT` policy for `anon`+`authenticated`. No write policies exist, so
  even though the publishable key is sent to the browser, it cannot mutate
  data. Writes, when added, would go through server-only code with proper
  authorisation.

- **Role gating via middleware.** A `demo_role` cookie stands in for a real
  Supabase session — switch it via the header. `middleware.ts` rewrites
  unauthorised requests to `/forbidden` before the route renders.
  Extending this to real Supabase Auth is a small swap: replace
  `cookieStore.get("demo_role")` in `lib/auth.server.ts` with a
  `supabase.auth.getUser()` call and pull `role` from `app_metadata`.

- **App Router patterns the brief called out:**
  - Server components fetch data; client components only handle interactivity.
  - Async `params` / `searchParams` (Next 15+ shape).
  - Per-route `loading.tsx`, `error.tsx`, and `not-found.tsx`.
  - `middleware.ts` runs before the route renders, with a tight `matcher`.

- **AI summary is real or mocked behind one interface.** `generateSummary`
  calls OpenAI when `OPENAI_API_KEY` is set, otherwise returns a deterministic
  summary after a short delay. `AI_MOCK_FAILURE_RATE` lets you exercise the
  error UI without unplugging anything.

- **Reusable components** live in `components/` with co-located `*.module.scss`.
  `ReportCard` is the obvious one; `SearchSortBar`, `AiSummary`, and
  `SiteHeader` are also intentionally generic.

---

## API quick reference

```
GET  /api/reports?q=growth&sort=views&dir=desc&category=growth
GET  /api/reports/rpt_001
POST /api/reports/rpt_001/summary    # GET also works
```

`sort` ∈ `updatedAt | createdAt | title | views`
`dir` ∈ `asc | desc`
`category` ∈ `growth | engineering | finance | product | research`

---

## AI tools used while building this

- **Cursor** as the editor, with **Claude (Opus)** doing most of the typing
  through the in-editor agent. I kept the agent on a tight loop: small,
  well-scoped prompts; review every diff before accepting; reject anything
  that drifted from the brief.
- **Supabase MCP server** from inside Cursor to provision the schema,
  seed data, run security/performance advisors, and generate
  `database.types.ts` directly against the live project. No manual
  copy-paste of migrations or types.
- **`pnpm create next-app`** to scaffold (the AI did not write the
  generated files, but it did pick the flags).
- **GitHub Copilot-style autocomplete** in Cursor for boilerplate inside
  components and SCSS.
- **No AI involvement** in the API contract, the middleware design, the
  RLS policy, or this README's structure — those were decided up front
  and the AI was used to type them out faster, not to invent them.

How I work with AI day-to-day: I treat the model as a fast pair, not as a
planner. I write the plan and acceptance criteria myself, then drive the
agent in 5–15 minute loops with explicit "don't touch X" guardrails. For
anything non-trivial I have it produce a diff first, read it, then apply.
