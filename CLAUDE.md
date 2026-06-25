# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BWAI (Buy With AI) is an AI-powered stock research assistant that transforms market data into structured insights. Users enter a stock ticker and receive bull/bear analysis, key trends, risks, and a balanced conclusion.

**Current phase:** Full-stack implementation complete (backend + web + mobile). Deployment pending.

## Tech Stack

- **Backend API:** FastAPI (Python) — `app.py`
- **Financial Data:** Yahoo Finance chart API (via httpx, no API key needed)
- **AI Agents:** DeepSeek, mimo, mimo-pro (via Vibe proxy)
- **Judge AI:** mimo-v2.5-pro (synthesizes all agent feedback)
- **Database:** PostgreSQL (asyncpg) with SQLite fallback for local dev
- **Auth:** JWT + OAuth (Google, Facebook) via `authlib`
- **Frontend Web:** Next.js (TypeScript + Tailwind CSS) — `frontend/`
- **Frontend Mobile:** React Native / Expo — `mobile/`
- **File Uploads:** `python-multipart` for avatar uploads, stored in `uploads/avatars/`
- **Deployment:** Docker + VPS — planned

## Architecture

```
User Input (TSLA) → FastAPI /research/{ticker}
        ↓
Yahoo Finance API (real-time data)
        ↓
┌───────────────────────────────────────┐
│   Multi-Agent Analysis (parallel)     │
│                                       │
│   DeepSeek ──→ Quick Analysis ───┐    │
│   mimo     ──→ Deep Analysis  ───┤    │
│   mimo-pro ──→ Validation     ───┤    │
│                                    │   │
│            ┌───────────────────────┘   │
│            ↓                           │
│   Judge AI (mimo-v2.5-pro)            │
│   Synthesizes all agent feedback      │
│            ↓                           │
│   Final Research Output               │
└───────────────────────────────────────┘
        ↓
PostgreSQL Cache (4h TTL)
        ↓
Web UI + Mobile App (shows individual + final)
```

## API Endpoints

| Endpoint | Description |
|---|---|
| `GET /` | API status |
| `GET /quote/{ticker}` | Real-time stock quote (price, change%, 52-week range) |
| `GET /research/{ticker}` | Multi-agent research with synthesis (cached 4h) |
| `GET /agents` | List available AI agents and their roles |
| `GET /cache/{ticker}` | Check cache status for a ticker |
| `POST /auth/register` | Register new user |
| `POST /auth/login` | Login (returns JWT + user with profile & member data) |
| `GET /auth/google` | Google OAuth redirect |
| `GET /auth/facebook` | Facebook OAuth redirect |
| `GET /auth/me` | Get current user with profile & member info (requires auth) |
| `PUT /auth/profile` | Update display name and theme (requires auth) |
| `POST /auth/avatar` | Upload profile picture (requires auth) |
| `GET /member/points` | Get member points, level, and progress (requires auth) |
| `POST /member/points/earn` | Earn points (ad reward) (requires auth) |
| `POST /member/points/purchase` | Purchase points (requires auth) |
| `GET /member/history` | Point transaction history (requires auth) |
| `GET /watchlist` | Get user's watchlist (requires auth) |
| `POST /watchlist` | Add ticker to watchlist (requires auth) |
| `DELETE /watchlist/{ticker}` | Remove from watchlist (requires auth) |
| `GET /docs` | Swagger UI (auto-generated) |

## Frontend (Web)

Next.js app in `frontend/` with Apple-inspired Tailwind CSS design. Supports dark mode.

| Page | File | Description |
|------|------|-------------|
| Home | `frontend/src/app/page.tsx` | Hero section, search bar, quick tickers |
| Research | `frontend/src/app/research/[ticker]/page.tsx` | Price card, bull/bear, agent tabs |
| Login | `frontend/src/app/login/page.tsx` | Username/password + OAuth |
| Register | `frontend/src/app/register/page.tsx` | Account creation + OAuth |
| Watchlist | `frontend/src/app/watchlist/page.tsx` | Saved stocks |
| Profile | `frontend/src/app/profile/page.tsx` | Avatar, display name, theme, member card, points |

Other files:
- `frontend/src/components/Navbar.tsx` — Navigation with avatar, theme toggle, auth state
- `frontend/src/components/MemberBadge.tsx` — Member level badge with progress bar
- `frontend/src/contexts/AuthContext.tsx` — JWT auth context with profile update
- `frontend/src/contexts/ThemeContext.tsx` — Dark/light theme provider
- `frontend/.env.local` — API URL config (`NEXT_PUBLIC_API_URL`)

## Frontend (Mobile)

React Native / Expo app in `mobile/` with tab navigation. Supports dark mode.

| Screen | File | Description |
|--------|------|-------------|
| Home | `mobile/app/(tabs)/index.tsx` | Ticker search, quick buttons |
| Watchlist | `mobile/app/(tabs)/watchlist.tsx` | Saved stocks |
| Profile | `mobile/app/(tabs)/profile.tsx` | Avatar upload, edit profile, theme, member card, points |
| Research | `mobile/app/research/[ticker].tsx` | Price card, bull/bear, agent details |
| Login | `mobile/app/login.tsx` | Username/password + OAuth |
| Register | `mobile/app/register.tsx` | Account creation + OAuth |

Other files:
- `mobile/components/MemberBadge.tsx` — Member level badge
- `mobile/contexts/AuthContext.tsx` — JWT auth with AsyncStorage, profile update
- `mobile/contexts/ThemeContext.tsx` — Theme provider with LightColors/DarkColors
- `mobile/lib/api.ts` — API fetch wrapper

## Database

PostgreSQL for caching research results. Default TTL: 4 hours.
- `database.py` — async SQLAlchemy models and cache logic
- `DATABASE_URL` — connection string (default: SQLite for local dev)
- `CACHE_TTL_HOURS` — cache expiry (default: 4)

Tables:
- `users` — User accounts (JWT + OAuth, display_name, theme, avatar_url)
- `watchlist` — Per-user stock watchlist
- `research_cache` — Cached final research
- `agent_results` — Individual AI agent analyses
- `final_synthesis` — Judge AI synthesis
- `member_points` — User points balance and member level
- `point_transactions` — Point earn/purchase history

### Member Levels

| Points | Level |
|--------|-------|
| 0–99 | Entry |
| 100–199 | Bronze |
| 200–299 | Silver |
| 300–399 | Gold |
| 400–499 | Platinum |
| 500–999 | Diamond |
| 1000+ | Master |

## Configuration

Environment variables (in `vibe-key.env`):
- `AI_API_URL` — OpenAI-compatible endpoint (default: Vibe proxy)
- `AI_API_KEY` — API auth token
- `DATABASE_URL` — PostgreSQL connection string
- `CACHE_TTL_HOURS` — Cache TTL in hours (default: 4)
- `JWT_SECRET` — JWT signing secret
- `GOOGLE_CLIENT_ID` — Google OAuth (optional)
- `GOOGLE_CLIENT_SECRET` — Google OAuth (optional)
- `FACEBOOK_CLIENT_ID` — Facebook OAuth (optional)
- `FACEBOOK_CLIENT_SECRET` — Facebook OAuth (optional)
- `FRONTEND_URL` — Frontend URL for OAuth redirects

## Key Files

- `app.py` — FastAPI backend (multi-agent, auth, profile, member system, watchlist)
- `database.py` — PostgreSQL models (users, watchlist, cache, member_points, point_transactions)
- `requirements.txt` — Python dependencies
- `frontend/` — Next.js app with Apple-inspired UI + dark mode
- `mobile/` — React Native / Expo app with dark mode
- `uploads/avatars/` — User profile pictures
- `proposal_mangsuan.md` — Product vision and tech spec
- `report.md` — Project report with methodology
- `slides/pitch.md` — Marp presentation deck
