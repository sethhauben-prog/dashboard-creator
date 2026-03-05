# Dashboard Creator — CLAUDE.md

## Project Overview
Dashboard Creator is a multi-user web app built with Vite + React and Supabase.
Users can sign up or log in (email/password or Google SSO), build a personal dashboard
by choosing from 13 widgets on the Set Up page, then launch a full-screen live view.

## Tech Stack
- **Frontend:** Vite + React (JSX), React Router v6, plain CSS
- **Backend/Auth/DB:** Supabase (authentication + PostgreSQL)
- **Deployment:** Vercel (vercel.json included for SPA routing)
- **Environment:** Credentials stored in a `.env` file (never hardcoded)
- **Dev server:** `npm run dev` → localhost:5173

## Coding Instructions

### Always explain your approach first
Before writing any code, briefly describe what you are going to do and why.
This helps the developer understand the plan before seeing the implementation.

### Keep comments beginner-friendly
Write clear, plain-English comments in the code so a beginner can follow along.
Explain *what* the code does and *why*, not just *how*.

### Never hardcode API keys or credentials
All sensitive values (Supabase URL, anon key, etc.) must be read from environment variables.

```js
// Good — reads from .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

// Bad — never do this
const supabaseUrl = "https://abc123.supabase.co";
```

`.env` is in `.gitignore` — never commit it.

## Environment Variables
| Variable | Where | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | `.env` + Vercel | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | `.env` + Vercel | Supabase public anon key |
| `ANTHROPIC_API_KEY` | `.env` + Vercel | Claude API key (server-side only, never `VITE_` prefixed) |

## Routes
| Path | Page | Access |
|---|---|---|
| `/` | Landing | Public |
| `/signup` | Sign Up | Public |
| `/login` | Log In | Public |
| `/dashboard` | Set Up | Protected |
| `/view` | My Dashboard (full-screen) | Protected |

## Key Files
- `src/supabaseClient.js` — Supabase client (reads `VITE_` env vars)
- `src/App.jsx` — Router, session state, ProtectedRoute
- `src/pages/Landing.jsx` — Landing page with hero + feature grid
- `src/pages/SignUp.jsx` — Email/password + Google SSO sign up
- `src/pages/Login.jsx` — Email/password + Google SSO log in
- `src/pages/Dashboard.jsx` — Set Up page: add/remove widgets, Launch Dashboard button
- `src/pages/DashboardView.jsx` — Full-screen live My Dashboard view
- `src/components/WidgetPicker.jsx` — Modal with 13 widget options
- `src/components/WidgetGrid.jsx` — Renders widget cards; supports `viewOnly` prop
- `src/components/widgets/` — 13 widget components
- `api/claude.js` — Vercel serverless function; proxies requests to Claude API (keeps API key server-side)
- `src/index.css` — All styles (plain CSS, no framework)
- `vercel.json` — SPA rewrite rule for Vercel deployment

## Pages

### Set Up (`/dashboard`)
The page users land on after login. They can add/remove widgets and see a live save status.
- "+ Add Widget" button opens the WidgetPicker modal
- "Launch Dashboard" button (appears once ≥1 widget exists) navigates to `/view`
- Auto-saves to Supabase with a 1-second debounce on every change

### My Dashboard (`/view`)
Full-screen live view of the user's dashboard.
- Dark gradient background, frosted-glass header
- Widgets are fully functional but have no edit/remove controls (`viewOnly=true`)
- "Edit Dashboard" button (top right) navigates back to `/dashboard`

## Widget Data Model
```json
{ "id": "uuid", "type": "clock", "config": {} }
```
Stored as a JSONB array in `dashboards.widgets`. One row per user.

## All 13 Widgets
| Type | Component | Notes |
|---|---|---|
| `claude` | ClaudeWidget | Chat with Claude AI via `/api/claude` serverless function |
| `clock` | ClockWidget | Live time/date, ticks every second |
| `todo` | TodoWidget | Add/check/remove tasks |
| `quote` | QuoteWidget | Local quote array, daily pick + refresh |
| `quicklinks` | QuickLinksWidget | Save favorite URLs |
| `weather` | WeatherWidget | Open-Meteo API (free, no key needed) |
| `notes` | DailyNotesWidget | Textarea, auto-saves |
| `habits` | HabitTrackerWidget | Daily streaks with fire emoji |
| `pomodoro` | PomodoroWidget | 25min/5min timer |
| `rss` | RSSWidget | rss2json API, configurable feed URL |
| `currency` | CurrencyWidget | Frankfurter API (free, no key needed) |
| `goal` | GoalWidget | Progress bar toward numeric goals |
| `countdown` | CountdownWidget | Days/hours/mins/secs to any event |

## Auth
- Email/password via Supabase Auth
- Google SSO via `supabase.auth.signInWithOAuth({ provider: 'google' })`
  - Redirects to `window.location.origin + '/dashboard'` after login
  - Session managed in `App.jsx` via `onAuthStateChange`

### Google OAuth Setup (already configured)
- **Supabase:** Google provider enabled with Client ID + Secret
- **Google Cloud Console:** Authorized redirect URI set to `https://llmywaqwpngworrfmaqo.supabase.co/auth/v1/callback`
- **OAuth consent screen:** App name = "Dashboard Creator", publishing status = Production
- If consent screen shows Supabase URL instead of app name → app is in Testing mode; fix via Audience → Publish App

### Ask Claude Widget — Serverless Function
- `api/claude.js` runs on Vercel's Node.js runtime
- Uses `ANTHROPIC_API_KEY` from server env (never exposed to browser — do NOT use `VITE_` prefix)
- Model: `claude-haiku-4-5-20251001`, max 1024 tokens, 20-message history cap
- To test locally: use `vercel dev` instead of `npm run dev`
- Must add `ANTHROPIC_API_KEY` in Vercel dashboard → Project Settings → Environment Variables

## DB Schema (Supabase)
```sql
create table dashboards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null unique,
  widgets jsonb default '[]'::jsonb,
  updated_at timestamptz default now()
);
alter table dashboards enable row level security;
create policy "Users manage own dashboard" on dashboards
  for all using (auth.uid() = user_id);
```

## Patterns
- `VITE_` prefix for all env vars (not `NEXT_PUBLIC_`)
- `crypto.randomUUID()` for widget IDs
- Each widget receives `config` + `onChange(newConfig)` props
- `WidgetGrid` accepts `viewOnly={true}` to hide remove buttons in live view
- Supabase upsert on `user_id` conflict for saving dashboard
