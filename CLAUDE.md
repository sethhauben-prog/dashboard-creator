# Dashboard Creator — CLAUDE.md

## Project Overview
Dashboard Creator is a multi-user web app built with Vite + React and Supabase.
Users can sign up or log in (email/password or Google SSO), build a personal dashboard
by choosing from 13 free + 4 premium widgets on the Set Up page, then launch a full-screen live view.
Premium widgets are unlocked via Stripe for $1/month.

## Tech Stack
- **Frontend:** Vite + React (JSX), React Router v6, plain CSS
- **Backend/Auth/DB:** Supabase (authentication + PostgreSQL)
- **Payments:** Stripe Checkout (subscription, $1/month)
- **AI:** Anthropic Claude API (`claude-haiku-4-5-20251001`)
- **Deployment:** Vercel (vercel.json included for SPA routing)
- **Environment:** Credentials stored in a `.env` file (never hardcoded)
- **Dev server:** `vercel dev` (required for serverless functions) or `npm run dev` (frontend only)

## Coding Instructions

### Always explain your approach first
Before writing any code, briefly describe what you are going to do and why.

### Keep comments beginner-friendly
Write clear, plain-English comments explaining *what* and *why*, not just *how*.

### Never hardcode API keys or credentials
All sensitive values must be read from environment variables.
`.env` is in `.gitignore` — never commit it.

```js
// Good
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// Bad — never do this
const supabaseUrl = "https://abc123.supabase.co";
```

## Environment Variables
| Variable | Where | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | `.env` + Vercel | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | `.env` + Vercel | Supabase public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env` + Vercel | Service role key (server-side only, bypasses RLS) |
| `ANTHROPIC_API_KEY` | `.env` + Vercel | Claude API key (server-side only, never `VITE_` prefixed) |
| `STRIPE_SECRET_KEY` | `.env` + Vercel | Stripe secret key (server-side only) |
| `STRIPE_WEBHOOK_SECRET` | Vercel only | Stripe webhook signing secret (`whsec_...`) |

## Routes
| Path | Page | Access |
|---|---|---|
| `/` | Landing | Public |
| `/signup` | Sign Up | Public |
| `/login` | Log In | Public |
| `/dashboard` | Set Up | Protected |
| `/view` | My Dashboard (full-screen) | Protected |
| `/admin` | Admin Panel | Admin only |

## Key Files
- `src/supabaseClient.js` — Supabase client (reads `VITE_` env vars)
- `src/App.jsx` — Router, session/role/plan state, ProtectedRoute, AdminRoute
- `src/pages/Landing.jsx` — Landing page with hero + feature grid
- `src/pages/SignUp.jsx` — Email/password + Google SSO sign up
- `src/pages/Login.jsx` — Email/password + Google SSO log in
- `src/pages/Dashboard.jsx` — Set Up page: add/remove widgets, Launch Dashboard, payment success banner
- `src/pages/DashboardView.jsx` — Full-screen live My Dashboard view
- `src/pages/AdminPage.jsx` — Admin panel (users table, stats, actions)
- `src/components/WidgetPicker.jsx` — Modal: 13 free widgets + 4 locked premium widgets
- `src/components/WidgetGrid.jsx` — Renders widget cards; supports `viewOnly` prop
- `src/components/widgets/` — 17 widget components (13 free + 4 premium)
- `api/claude.js` — Claude chat proxy (keeps API key server-side)
- `api/stocks.js` — Yahoo Finance proxy (avoids CORS)
- `api/stripe/checkout.js` — Creates Stripe Checkout session, returns redirect URL
- `api/stripe/webhook.js` — Receives Stripe events, updates `profiles.plan` in Supabase
- `api/admin/users.js` — Returns all users with profile + widget data (admin only)
- `api/admin/reset-password.js` — Sends password reset email (admin only)
- `api/admin/deactivate.js` — Bans/unbans user accounts (admin only)
- `src/index.css` — All styles (plain CSS, no framework)
- `vercel.json` — SPA rewrite rule for Vercel deployment

## Pages

### Set Up (`/dashboard`)
- "+ Add Widget" opens WidgetPicker modal
- "Launch Dashboard" button (appears once ≥1 widget exists) navigates to `/view`
- Shows payment success banner when redirected from Stripe with `?payment=success`
- Auto-saves to Supabase with 1-second debounce
- "Admin" button visible in header for admin users only

### My Dashboard (`/view`)
- Dark gradient background, frosted-glass header
- Widgets fully functional, no edit/remove controls (`viewOnly=true`)
- "Edit Dashboard" button top-right → back to `/dashboard`

### Admin Panel (`/admin`)
- Redirects non-admins to `/dashboard` immediately (checked server-side too)
- Overview: total users, signed up this week, paid/free counts
- Users table: sortable by signup date, searchable by email
- Per-user actions: reset password, view widgets modal, deactivate/reactivate

## Widget Data Model
```json
{ "id": "uuid", "type": "clock", "config": {} }
```
Stored as a JSONB array in `dashboards.widgets`. One row per user.

## All 17 Widgets
### Free (13)
| Type | Component | Notes |
|---|---|---|
| `claude` | ClaudeWidget | Chat with Claude via `/api/claude`; 20-message history |
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

### Premium (4) — $1/month via Stripe
| Type | Component | Notes |
|---|---|---|
| `ai-brief` | AIDailyBriefWidget | Claude-generated daily brief via `/api/claude` |
| `stocks` | StockTickerWidget | Live prices via `/api/stocks` (Yahoo Finance proxy) |
| `kanban` | KanbanWidget | HTML5 drag-and-drop board, 3 columns |
| `worldclocks` | WorldClocksWidget | Multi-timezone clocks using Intl.DateTimeFormat |

Free users see premium widgets locked in the picker with an "Unlock for $1/mo" button.
Paid users see them as normal clickable cards.

## Auth
- Email/password via Supabase Auth
- Google SSO via `supabase.auth.signInWithOAuth({ provider: 'google' })`
  - Redirects to `window.location.origin + '/dashboard'` after login
  - Session managed in `App.jsx` via `onAuthStateChange`

### Google OAuth (already configured)
- **Google Cloud Console:** Authorized redirect URI = `https://llmywaqwpngworrfmaqo.supabase.co/auth/v1/callback`
- **OAuth consent screen:** App name = "Dashboard Creator", status = Production
- If consent screen shows Supabase URL → app is in Testing mode; fix via Audience → Publish App

## Stripe Payment Flow
1. Free user clicks "Unlock for $1/mo" in WidgetPicker
2. Frontend POSTs to `/api/stripe/checkout` with Bearer token
3. Serverless function creates Checkout session with `metadata: { user_id }`, returns `url`
4. Browser redirects to Stripe hosted checkout
5. On payment → Stripe redirects to `/dashboard?payment=success`
6. Stripe also fires webhook to `/api/stripe/webhook`
7. Webhook verifies signature, reads `user_id` from metadata, updates `profiles.plan = 'paid'`
8. Page reloads → plan state refreshes → premium widgets unlocked

### Stripe Config
- Product: "Premium Dashboard Widget" — $1.00/month recurring
- Price ID: `price_1T7kOqRd9CH6pmHOo1DJYbc3`
- Webhook event: `checkout.session.completed`
- Webhook endpoint: `https://dashboard-creator-seven.vercel.app/api/stripe/webhook`
- Test card: `4242 4242 4242 4242` (any future expiry, any CVC)

## DB Schema (Supabase)
```sql
-- Dashboards
create table dashboards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null unique,
  widgets jsonb default '[]'::jsonb,
  updated_at timestamptz default now()
);
alter table dashboards enable row level security;
create policy "Users manage own dashboard" on dashboards
  for all using (auth.uid() = user_id);

-- Profiles (role + plan)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user',  -- 'user' | 'admin'
  plan text not null default 'free'   -- 'free' | 'paid'
);
alter table profiles enable row level security;
create policy "Users read own profile" on profiles
  for select using (auth.uid() = id);
-- Note: "Admins manage profiles" policy was dropped due to RLS infinite recursion.
-- Admin operations use the service role key which bypasses RLS entirely.

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role) values (new.id, 'user');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## Patterns
- `VITE_` prefix for frontend env vars only; server-side vars have no prefix
- `crypto.randomUUID()` for widget IDs
- Each widget receives `config` + `onChange(newConfig)` props
- `WidgetGrid` accepts `viewOnly={true}` to hide remove buttons in live view
- Supabase upsert on `user_id` conflict for saving dashboard
- All admin + Stripe serverless functions verify the caller's JWT before proceeding
- Webhook raw body must be read manually (not pre-parsed) for Stripe signature verification
- RLS infinite recursion: avoid policies that query the same table they protect — use service role key instead
