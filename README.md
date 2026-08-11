# Personal Productivity Dashboard

A warm, personal life dashboard built with **Next.js 14 (App Router)**, deployed on **Vercel**, with a **Neon Postgres** database for persistence. Tasks, habits, goals, and a school/clinicals planner — all in one place, gated behind a single password.

The structure and design follow Casey Danielle's approach from *"I Built a Personal Life Dashboard with Claude"*: a single flexible JSON object for storage (no schema migrations, ever), autosave with throttling, a warm earthy palette, a weekly focus/reflection view, a habit tracker with weekly goals and a completion score, and little dopamine touches — a generated pop sound and a confetti burst every time you check something off.

## What's inside

- **Overview** — this week's focus + reflection, headline stats, a 7‑day habit chart, an open‑assignments breakdown, and a combined "coming up" deadline list.
- **Tasks** — priorities, due dates, filtering, confetti on completion.
- **School** — assignments (homework / projects / exams / reading), study blocks, and a **clinicals organizer** (site, unit, preceptor, prep + paperwork checkboxes).
- **Habits** — weekly grid with custom emoji + color, per‑habit weekly goal (e.g. 5/7), a weekly completion score ring, streaks, and week‑to‑week navigation.
- **Goals** — progress bars with increment controls and a celebration when you hit the target.

## How data is stored

Everything is one JSON object in a single row of a single table:

```sql
app_state(id = 1, data JSONB, updated_at TIMESTAMPTZ)
```

Adding a feature later = adding a key to the object in `lib/types.ts`. No migrations. `lib/db.ts` also normalizes loaded state, so older saved data never crashes the UI when new fields appear.

---

## Deploy it (about 15 minutes)

### 1. Create the Neon database
1. Go to [neon.tech](https://neon.tech) and create a free project.
2. Copy the **pooled** connection string (it contains `-pooler`). It looks like:
   `postgresql://user:password@ep-xxxx-pooler.region.aws.neon.tech/neondb?sslmode=require`

The `app_state` table is created automatically the first time the app runs — you don't need to run any SQL.

### 2. Push this folder to GitHub
```bash
cd productivity-dashboard
git init
git add .
git commit -m "Initial dashboard"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/productivity-dashboard.git
git push -u origin main
```

### 3. Deploy on Vercel
1. Go to [vercel.com](https://vercel.com), **Add New → Project**, and import the repo.
2. Before deploying, add three **Environment Variables**:

| Name | Value |
|------|-------|
| `DATABASE_URL` | your Neon pooled connection string |
| `APP_PASSWORD` | the password you'll use to unlock the dashboard |
| `AUTH_SECRET` | a long random string — generate with `openssl rand -hex 32` |

3. Click **Deploy**. When it's live, open the URL, enter your password, and you're in.

> Tip: Neon integrates directly with Vercel. If you add the Neon integration from the Vercel marketplace, `DATABASE_URL` is set for you automatically — you'd then only add `APP_PASSWORD` and `AUTH_SECRET`.

---

## Run it locally
```bash
npm install
cp .env.example .env        # then fill in the three values
npm run dev                 # http://localhost:3000
```

Verify the production build before deploying:
```bash
npm run typecheck
npm run build
```

*(These weren't run in the environment that generated this project — the build needs the full dependency tree — so run them once locally; everything was static‑checked for syntax.)*

## How auth works
One password, stored only in `APP_PASSWORD`. On login the server sets an httpOnly cookie containing an HMAC token derived from the password + `AUTH_SECRET` — the raw password is never stored in the cookie. Every API read/write and the dashboard page verify that token. It's meant for a personal, single‑user app.

## Making it yours
- **Colors:** edit the CSS variables at the top of `app/globals.css`.
- **Seed content:** `lib/defaultState.ts` (shown the first time the DB is empty).
- **New sections:** add a field to `AppState` in `lib/types.ts`, a panel in `components/`, and a tab in `components/DashboardClient.tsx`.

## Project structure
```
app/
  page.tsx              # auth-gated dashboard (server component)
  login/page.tsx        # password screen
  api/login|logout|state/route.ts
components/
  DashboardClient.tsx   # tab shell + autosave provider
  StateProvider.tsx     # state context + debounced autosave
  Tasks/Habits/Goals/School/Stats Panel.tsx
  ui.tsx                # shared UI primitives
lib/
  db.ts                 # Neon: load/save the single JSON object
  types.ts              # the whole data model
  defaultState.ts       # first-run seed
  auth.ts               # password + cookie token
  celebrate.ts          # pop sound + confetti
  id.ts                 # id + week-date helpers
```

---

Credit: approach adapted from Casey Danielle's write-up, [*I Built a Personal Life Dashboard with Claude*](https://caseydanielle.substack.com/p/i-built-a-personal-life-dashboard).
