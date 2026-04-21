# Trail — Reports trial task

A small Next.js (App Router) + TypeScript app that demonstrates the patterns
called out in the trial brief:

- `/reports` — server-rendered list with **server-side** search + sort.
- `/reports/[id]` — server-rendered detail view with an AI summary that
  handles loading, success, and error states on the client.
- `/api/reports` and `/api/reports/[id]` — JSON API powered by the same
  query layer the page uses.
- `/api/reports/[id]/summary` — generates the AI summary (real OpenAI when
  `OPENAI_API_KEY` is set, deterministic mock otherwise).
- `/admin` — role-gated route enforced in `middleware.ts`. Non-admins are
  rewritten to `/forbidden` before the page ever renders.
- All styling in `*.module.scss` with shared design tokens in `styles/tokens.scss`.

> The whole app is intentionally small. Every file is meant to do one thing
> and be easy to scan in a 2-minute walkthrough.

---

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Optional environment

Create `.env.local`:

```
# Use a real OpenAI call instead of the mock summarizer.
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

# Tune the mock for demos.
AI_MOCK_LATENCY_MS=900
AI_MOCK_FAILURE_RATE=0      # 0..1, e.g. 0.5 forces ~half of summary calls to fail
```

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
  data/reports.json                    Mock data
  data/reports.ts                      Query layer used by API + pages
  ai.ts                                Mock summarizer + optional OpenAI client
  auth.ts                              Cookie-based role helpers (Supabase-shaped)
  url.ts                               Resolves the request base URL on the server
  types.ts                             Shared types
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
  `/api/reports` with those params. Same query function (`queryReports`) backs
  both the API and direct server use, so the behaviour stays consistent.

- **App Router patterns the brief specifically called out:**
  - Server components fetch data; client components only handle interactivity.
  - Async `params` and `searchParams` (Next 15+ shape).
  - Per-route `loading.tsx`, `error.tsx`, and `not-found.tsx`.
  - `middleware.ts` runs before the route renders, with a tight `matcher`.

- **Role gating via middleware.** A `demo_role` cookie stands in for a real
  Supabase session. Switching it via the header rewrites the page tree; admin
  access is enforced at the edge, not in the page.

- **AI summary is real or mocked behind one interface.** `generateSummary`
  calls OpenAI when `OPENAI_API_KEY` is set, otherwise returns a deterministic
  summary after a short delay. `AI_MOCK_FAILURE_RATE` lets you exercise the
  error UI without unplugging anything.

- **Reusable components** live in `components/` with co-located `*.module.scss`.
  `ReportCard` is the obvious one; `SearchSortBar`, `AiSummary`, and
  `SiteHeader` are also intentionally generic.

- **SCSS module setup:** `next.config.ts` adds `styles/` to `sassOptions.includePaths`
  so every module can `@use "tokens" as *` without long relative paths.

---

## API quick reference

```
GET  /api/reports?q=growth&sort=views&dir=desc&category=growth
GET  /api/reports/rpt_001
POST /api/reports/rpt_001/summary    # GET also works
```

`sort` ∈ `updatedAt | createdAt | title | views`
`dir` ∈ `asc | desc`

---

## AI tools used while building this

- **Cursor** as the editor, with **Claude (Opus)** doing most of the typing
  through the in-editor agent. I kept the agent on a tight loop:
  small, well-scoped prompts; review every diff before accepting; reject
  anything that drifted from the brief.
- **`pnpm create next-app`** to scaffold (the AI did not write the
  generated files, but it did pick the flags).
- **GitHub Copilot-style autocomplete** in Cursor for boilerplate inside
  components and SCSS.
- **No AI involvement** in the trial brief itself, the API contract, the
  middleware design, or this README's structure — those were decided up
  front and the AI was used to type them out faster, not to invent them.

How I work with AI day-to-day, in case it's useful: I treat the model as a
fast pair, not as a planner. I write the plan and acceptance criteria
myself, then drive the agent in 5–15 minute loops with explicit "don't
touch X" guardrails. For anything non-trivial I have it produce a diff
first, read it, then apply.
