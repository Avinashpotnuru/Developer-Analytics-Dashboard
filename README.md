
# Developer Analytics Dashboard

A professional dashboard for analyzing any public GitHub developer profile — repositories,
stars, commits, pull requests, issues, languages, and contribution activity — with interactive
filtering, caching, and now **GitHub sign-in**.

Built with **Next.js 16 (App Router)**, **React 19**, **TypeScript (strict)**, **Tailwind CSS v4**,
**Recharts**, **TanStack Query**, and **Base UI**.

---

## Features

- Analyze any **public GitHub profile** by username (no login required).
- Interactive dashboard: date-range filtering, per-repository or "all repositories" analytics.
- Charts, tables, contribution heatmap, and responsive layouts.
- Loading / error / empty states everywhere.
- **GitHub OAuth login** ("Login with GitHub"):
  - Identifies the authenticated account and loads *your* analytics with one click.
  - Keeps public username search fully available for any profile.
  - Secure HTTP-only session cookie, CSRF-protected OAuth state, minimal scopes.

---

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript (strict, `no any`) |
| Styling | Tailwind CSS v4 + Base UI primitives |
| Data viz | Recharts |
| Client cache | TanStack Query |
| GitHub API | GitHub REST API v2022-11-28 (server-side service layer) |
| Auth | GitHub OAuth 2.0 authorization-code flow (no external auth library) |

No database is used. No third-party authentication library is used.

---

## Prerequisites

- Node.js 18+ (Node 20 recommended)
- A GitHub account (to create an OAuth app)
- A GitHub personal access token (for the public analytics API)

---

## 1. Create a GitHub OAuth application

1. Go to **GitHub → Settings → Developer settings → OAuth Apps → New OAuth App**
   (https://github.com/settings/developers).
2. **Application name**: anything you like (e.g. "Developer Analytics Dashboard").
3. **Homepage URL**: `http://localhost:3000` (or your production URL).
4. **Authorization callback URL**: must be exactly:

   ```
   http://localhost:3000/api/auth/github/callback
   ```

   (For production use `https://your-domain/api/auth/github/callback`.)
5. Click **Register application**.
6. Copy the **Client ID** and generate a **Client secret**.

> The app requests **no OAuth scope** (the default public identity is sufficient).
> We do not request `repo`, `read:org`, or any private-data scope.

---

## 2. Environment variables

Copy `.env.example` to `.env.local` and fill in the values.

| Variable | Required | Description |
| --- | --- | --- |
| `GITHUB_TOKEN` | yes | A GitHub PAT used **server-side** for public profile analytics. |
| `GITHUB_CLIENT_ID` | yes | OAuth app Client ID (server-only). |
| `GITHUB_CLIENT_SECRET` | yes | OAuth app Client Secret (server-only, never sent to the browser). |
| `GITHUB_CALLBACK_URL` | yes | Must match the OAuth app callback URL exactly. |
| `SESSION_SECRET` | yes | Long random string used to sign the session cookie. |

Example `.env.local`:

```bash
GITHUB_TOKEN=github_pat_xxx
GITHUB_CLIENT_ID=Iv1_xxxxxxxxxxxx
GITHUB_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/github/callback
SESSION_SECRET=$(openssl rand -hex 32)
```

> **Never** prefix these with `NEXT_PUBLIC_`. The client secret and session secret must
> remain server-only. `.env.local` is gitignored — do not commit secrets.

---

## 3. Run locally

```bash
npm install
npm run dev
# open http://localhost:3000
```

Other scripts:

```bash
npm run lint        # ESLint
npx tsc --noEmit    # strict type-check
npm run test        # Vitest unit + route tests
npm run build       # production build
```

---

## 4. How GitHub OAuth works in this app

```
Browser                  App (Next.js)                 GitHub
  │                            │                          │
  │  "Login with GitHub"      │                          │
  │ ──────────────────────────▶│  /api/auth/github        │
  │                            │  1. generate CSRF state  │
  │                            │  2. set state cookie     │
  │ ◀── 302 ───────────────────│     (HttpOnly)          │
  │  redirect to GitHub        │                          │
  │ ────────────────────────────────────────────────────▶│ authorize
  │                            │                          │ user approves
  │ ◀── 302 callback ────────────────────────────────────│  ?code&state
  │ ──────────────────────────▶│  /api/auth/github/callback
  │                            │  3. verify state cookie  │
  │                            │  4. exchange code→token  │
  │                            │  5. GET /user (token)    │──▶│
  │                            │  6. sign session cookie  │◀──│ identity
  │ ◀── 302 ───────────────────│     (HttpOnly)          │
  │  /dashboard?user=<login>   │                          │
  │ ──────────────────────────▶│  existing analytics     │
  │                            │  pipeline (public API)   │
```

- The OAuth **access token is used only once**, on the server, to call `GET /user`, and is
  then discarded. It is **never** stored in a cookie, `localStorage`, the URL, or React state.
- The **session cookie** contains only the identity (`id`, `login`, `name`, `avatarUrl`),
  signed with `SESSION_SECRET` (HMAC-SHA256), and is `HttpOnly`, `SameSite=Lax`, `Secure`
  in production, expiring after 7 days.
- Authenticated dashboards reuse the existing GitHub service layer and analytics engine —
  they are fetched with the application's own `GITHUB_TOKEN` (public data only).
- Public username search remains available whether or not you are logged in.

---

## 5. Security considerations

- **Client secret**: read only by server route handlers; never bundled into client JS.
- **Access token**: server-only, transient, never persisted or exposed.
- **CSRF**: a cryptographically random `state` value is generated per login, stored in an
  `HttpOnly` cookie, and validated on callback. Callbacks without a matching state are rejected.
- **Cookies**: `HttpOnly` + `SameSite=Lax` + `Secure` (prod) + scoped to `/` + 7-day expiry.
- **Errors**: GitHub errors (denial, bad code, expired code, rate limit) are mapped to
  friendly messages; internal details, tokens, and secrets are never returned to the client.
- **Open redirect**: the only redirects are to GitHub's authorize URL (built from config) or
  to the app's own `/dashboard` path; no user-controlled redirect target is used.
- **No private data**: the app requests no scopes and displays only public GitHub data.

---

## Project structure (auth)

```
app/api/auth/github/route.ts              # start OAuth, set CSRF state
app/api/auth/github/callback/route.ts     # exchange code, verify state, create session
app/api/auth/logout/route.ts              # clear session
app/api/auth/session/route.ts             # return current session user
lib/auth/types.ts                         # SessionUser + GitHub identity types
lib/auth/core.ts                          # state, authorize URL, session sign/verify, token exchange (pure, node:crypto)
lib/auth/config.ts                        # reads server-only env config
lib/auth/session.ts                       # HTTP-only cookie session layer (next/headers)
lib/auth/queries.ts                       # useSession client hook (TanStack Query)
lib/auth/messages.ts                      # auth error message map
components/layout/user-menu.tsx           # "Login with GitHub" / avatar + View My Analytics + Logout
components/auth/auth-error-banner.tsx     # friendly banner for auth errors
```

---

## Testing

`npm run test` covers:

- OAuth state generation + validation
- Authorize-URL generation (no scope, contains state)
- Session sign/verify (round-trip, wrong secret, tamper, expiry)
- Token exchange + authenticated-user fetch (success + error paths)
- Route handlers: login redirect, callback success/denial/invalid-state/missing-code,
  session retrieval, logout
- Secret isolation: client files never import server-only auth modules or `next/headers`
