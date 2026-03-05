# Dashboard Creator — CLAUDE.md

## Project Overview
Dashboard Creator is a multi-user web app built with React and Supabase.
Users can sign up, log in, and build a personal dashboard by choosing from 12 widgets.

## Tech Stack
- **Frontend:** React
- **Backend/Auth/DB:** Supabase (authentication + PostgreSQL database)
- **Environment:** Credentials stored in a `.env` file (never hardcoded)

## Coding Instructions

### Always explain your approach first
Before writing any code, briefly describe what you are going to do and why.
This helps the developer understand the plan before seeing the implementation.

### Keep comments beginner-friendly
Write clear, plain-English comments in the code so a beginner can follow along.
Explain *what* the code does and *why*, not just *how*.

### Never hardcode API keys or credentials
All sensitive values (Supabase URL, anon key, service role key, etc.) must be
read from environment variables. Example:

```js
// Good — reads from .env file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

// Bad — never do this
const supabaseUrl = "https://abc123.supabase.co";
```

Always remind the developer to add `.env` to `.gitignore` before pushing to GitHub.

## Environment Variables
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase public anon key |

## Features
- Email/password sign up and log in via Supabase Auth
- Each user has their own personal dashboard (data isolated by user ID)
- Users can add, remove, and arrange up to 12 widgets on their dashboard
