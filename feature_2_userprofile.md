# Feature Specification – BWAI Stock Research Platform (As-Built)

## Project Context

BWAI Stock Research is an AI-powered stock research platform with multi-agent analysis, user profiles, membership rewards, and watchlists.

**Inspiration sources** (UX patterns only — no branding, assets, or proprietary content):
- Shopee — engagement, rewards, gamification, profile management
- Moomoo — investment platform experience
- TradingView — watchlists, stock research workflows, professional UI

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI (Python) |
| Database | PostgreSQL (asyncpg) with SQLite fallback for local dev |
| Auth | JWT + OAuth (Google, Facebook) via authlib |
| Financial Data | Yahoo Finance chart API (httpx, no API key) |
| AI Agents | DeepSeek, mimo, mimo-pro (via Vibe proxy) |
| Judge AI | mimo-v2.5-pro (synthesizes all agent feedback) |
| Web Frontend | Next.js (TypeScript + Tailwind CSS) |
| Mobile Frontend | React Native / Expo |
| File Uploads | python-multipart, stored in uploads/avatars/ |

---

## Database Models (Actual)

All models defined in `database.py`:

| Model | Table | Purpose |
|-------|-------|---------|
| `User` | `users` | Accounts (JWT + OAuth), profile fields (display_name, theme, avatar_url) |
| `Watchlist` | `watchlist` | Per-user stock watchlist (ticker, company_name, added_at) |
| `ResearchCache` | `research_cache` | Cached final research (4h TTL) |
| `AgentResult` | `agent_results` | Individual AI agent analyses |
| `FinalSynthesis` | `final_synthesis` | Judge AI synthesis |
| `MemberPoints` | `member_points` | User points balance and member level |
| `PointTransaction` | `point_transactions` | Point earn/purchase history |

Profile fields (display_name, theme, avatar_url) are stored directly on the `User` model — no separate `UserProfile` or `ThemePreference` tables.

---

## API Endpoints (Actual)

### Public

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | API status |
| `GET` | `/stocks` | List/search stocks from SEC EDGAR (`?q=&page=&per_page=`) |
| `GET` | `/stocks/popular` | Popular stock tickers for quick access |
| `GET` | `/quote/{ticker}` | Real-time stock quote (price, change%, 52-week range) |
| `GET` | `/research/{ticker}` | Multi-agent research with synthesis (cached 4h) |
| `GET` | `/agents` | List available AI agents and their roles |
| `GET` | `/cache/{ticker}` | Check cache status for a ticker |
| `GET` | `/docs` | Swagger UI (auto-generated) |

### Authentication

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/auth/register` | Register new user (username + password) |
| `POST` | `/auth/login` | Login (returns JWT + user with profile & member data) |
| `GET` | `/auth/me` | Get current user with profile & member info (requires auth) |
| `PUT` | `/auth/profile` | Update display name and theme (requires auth) |
| `POST` | `/auth/avatar` | Upload profile picture (requires auth) |
| `GET` | `/auth/google` | Google OAuth redirect |
| `GET` | `/auth/google/callback` | Google OAuth callback |
| `GET` | `/auth/facebook` | Facebook OAuth redirect |
| `GET` | `/auth/facebook/callback` | Facebook OAuth callback |
| `GET` | `/auth/providers` | List configured OAuth providers |

### Watchlist

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/watchlist` | Get user's watchlist (requires auth) |
| `POST` | `/watchlist` | Add ticker to watchlist (requires auth) |
| `DELETE` | `/watchlist/{ticker}` | Remove from watchlist (requires auth) |
| `GET` | `/watchlist/{ticker}/check` | Check if ticker is in watchlist (requires auth) |

### Member System

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/member/points` | Get points, level, and progress to next level (requires auth) |
| `POST` | `/member/points/earn` | Earn points (stub — no real ad integration) (requires auth) |
| `POST` | `/member/points/purchase` | Purchase points (stub — no real payment gateway) (requires auth) |
| `GET` | `/member/history` | Point transaction history (requires auth) |

---

## Features (As-Built)

### Feature 1 — Watchlist Stock Navigation

**Status:** ✅ Implemented

Clicking a stock in the watchlist (or search results, or stock explorer) navigates to the research page and auto-loads the stock analysis.

**Routes:**
- Web: `/research/[ticker]` — `frontend/src/app/research/[ticker]/page.tsx`
- Mobile: `mobile/app/research/[ticker].tsx`

**User flow:**
1. User selects stock from Watchlist / Search / Explorer
2. App navigates to `/research/AAPL`
3. Research page fetches `GET /research/AAPL`
4. Displays: company overview, stock info, AI analysis (bull/bear/risks/conclusion), individual agent tabs

**Navigation sources:**
- Watchlist page (`/watchlist`)
- Home page search bar and quick tickers
- Stock Explorer (`/explore`)

---

### Feature 2 — User Profile Management

**Status:** ✅ Implemented

**Profile screen displays:**
- Profile picture (avatar)
- Username
- Display name
- Membership level + badge
- Membership points + progress bar

**Profile picture:**
- Upload, change, and remove avatar images
- Web: file input via `POST /auth/avatar`
- Mobile: image picker via same endpoint
- Stored in `uploads/avatars/`, served via `/uploads/` static mount

**Username management:**
- Username set at registration (immutable after creation)
- Display name editable via `PUT /auth/profile`

**Theme settings:**
- Light mode / Dark mode (no system default)
- Persisted on `User.theme` field via `PUT /auth/profile`
- Applied across web (ThemeContext) and mobile (ThemeContext with LightColors/DarkColors)

---

### Feature 3 — Membership System

**Status:** ✅ Implemented

**Membership levels** (auto-calculated from points, no manual editing):

| Level | Points Range |
|-------|-------------|
| Entry | 0–99 |
| Bronze | 100–199 |
| Silver | 200–299 |
| Gold | 300–399 |
| Platinum | 400–499 |
| Diamond | 500–999 |
| Master | 1000+ |

**Member dashboard displays:**
- Current level (with badge via `MemberBadge` component)
- Current points
- Progress bar to next level
- Next level name
- Points needed to reach next level

**Components:**
- Web: `frontend/src/components/MemberBadge.tsx`
- Mobile: `mobile/components/MemberBadge.tsx`

---

### Feature 4 — Member Points System

**Status:** ✅ Implemented

**Backend storage:**
- `MemberPoints` table — user_id, points balance, level, updated_at
- `PointTransaction` table — transaction_id, user_id, type (earn/purchase), points, description, created_at

**Points are persistent** — all transactions recorded in `point_transactions` table.

**Endpoints:**
- `GET /member/points` — returns current points, level, progress percentage, points to next level
- `GET /member/history` — returns full transaction history

---

### Feature 5 — Earn Points

**Status:** ⚠️ Stub Only

`POST /member/points/earn` accepts a description and adds points to the user's balance. No real ad provider (AdMob, rewarded ads) is integrated.

**Current behavior:**
- Accepts `{ "points": 10, "description": "Watch Ad" }` (admin-configurable)
- Adds points to balance
- Records transaction in `point_transactions`
- Recalculates membership level

**Not implemented:**
- Google AdMob / Rewarded Ads SDK integration
- Server-side ad completion verification
- Rate limiting / abuse prevention

---

### Feature 6 — Buy Member Points

**Status:** ⚠️ Stub Only

`POST /member/points/purchase` accepts a package and adds points. No real payment gateway is integrated.

**Current behavior:**
- Accepts `{ "points": 100, "description": "Purchased 100 Points" }`
- Adds points to balance
- Records transaction in `point_transactions`
- Recalculates membership level

**Not implemented:**
- Payment gateway integration (Stripe, ToyyibPay, Billplz, iPay88, SenangPay)
- Payment transaction model
- Audit logs for payment disputes
- Package pricing / UI for selecting packages

---

### Feature 7 — OAuth Authentication

**Status:** ✅ Implemented (not in original spec)

**Providers:**
- Google OAuth (`/auth/google` → `/auth/google/callback`)
- Facebook OAuth (`/auth/facebook` → `/auth/facebook/callback`)

**JWT-based sessions** — 24-hour token expiry, returned on register/login/OAuth callback.

---

### Feature 8 — Multi-Agent Stock Research

**Status:** ✅ Implemented (not in original spec)

**Pipeline:**
1. User requests `GET /research/{ticker}`
2. Yahoo Finance API fetches real-time market data
3. Three AI agents analyze in parallel:
   - **deepseek** (deepseek-flash) — quick, cost-effective first pass
   - **mimo** (mimo-v2.5) — nuanced deep analysis
   - **mimo-pro** (mimo-v2.5-pro) — validation, flags contradictions
4. **Judge AI** (mimo-v2.5-pro) synthesizes all agent feedback
5. Final output: bull factors, bear factors, risks, conclusion
6. Result cached in PostgreSQL/SQLite (4h TTL)

**Individual agent analyses** are stored separately and viewable in the UI via agent tabs.

---

## UI/UX Patterns

**Web (Next.js + Tailwind CSS):**
- Apple-inspired design with dark mode support
- Pages: Home, Explore, Research, Login, Register, Watchlist, Profile
- Navigation: Navbar with avatar, theme toggle, auth state

**Mobile (React Native / Expo):**
- Tab navigation: Home, Watchlist, Profile
- Stack navigation for Research, Login, Register
- Dark mode with LightColors / DarkColors themes

---

## Configuration

Environment variables (in `.env` and `vibe-key.env`):

| Variable | Description |
|----------|-------------|
| `AI_API_URL` | OpenAI-compatible endpoint (Vibe proxy) |
| `AI_API_KEY` | API auth token |
| `DATABASE_URL` | PostgreSQL connection string (default: SQLite) |
| `CACHE_TTL_HOURS` | Cache expiry (default: 4) |
| `JWT_SECRET` | JWT signing secret |
| `GOOGLE_CLIENT_ID` | Google OAuth (optional) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth (optional) |
| `FACEBOOK_CLIENT_ID` | Facebook OAuth (optional) |
| `FACEBOOK_CLIENT_SECRET` | Facebook OAuth (optional) |
| `FRONTEND_URL` | Frontend URL for OAuth redirects |
