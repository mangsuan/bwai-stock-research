<!--
Copy this file to member-proposals/<your-github-username>.md and fill it in.
Filename casing doesn't matter (WythWin.md or wythwin.md both work).
This is YOUR proposal — the relative-project you built in Chapter 2.
Sections 1-3 (Gist/Story/Why) due Chapter 2. Sections 4-6 due Chapter 3.
-->

# BWAI — Buy With AI — Proposal by @mangsuan

## Gist
An AI-powered stock research assistant that transforms market data into simple, structured insights to help users quickly understand whether a stock is worth further research. Includes user profiles, member levels, and a gamified points system.

## Story
A working professional hears about stocks like NVDA, TSLA, or AAPL from social media, news, or friends but does not have time to read financial reports, charts, and market analysis in detail. They want a quick, clear explanation of what is happening with a stock before deciding whether to look deeper.

BWAI helps by generating a short, structured research summary that explains key signals, trends, risks, and market behavior in simple language. It works across web and mobile so users can check insights anytime during their day. Users can customize their profile, switch between dark and light themes, and earn member points by watching ads or purchasing — leveling up from Entry to Master as they engage with the platform.


## Why
Retail investors are often overwhelmed by fragmented and technical financial information from charts, news, and social media. This leads to confusion, hesitation, and emotionally driven decisions.

BWAI solves this by transforming raw market data into structured AI-generated insights that are easy to understand. It helps users focus on meaningful signals instead of noise and makes stock research faster, clearer, and more consistent. The member system encourages continued engagement and rewards users for interacting with the platform.


## Why Not
- Not a trading platform or brokerage system.
- Not executing buy/sell orders or financial transactions.
- Not providing financial advice or guaranteed investment outcomes.
- Not managing full investment portfolios.
- Not a high-frequency trading or real-time trading system.
- Not integrated with brokers or financial institutions.


## Tech Spec
### Stack
- **Frontend Web:** Next.js (TypeScript + Tailwind CSS) — Apple-inspired UI design with dark mode
- **Frontend Mobile:** React Native / Expo — iOS and Android app with dark mode
- **Backend API:** FastAPI (Python)
- **Database:** PostgreSQL (asyncpg) with SQLite fallback for local dev
- **AI Agents:** DeepSeek, mimo-v2.5, mimo-v2.5-pro (via Vibe proxy)
- **Financial Data:** Yahoo Finance API (real-time prices, 52-week range)
- **Authentication:** JWT + OAuth (Google, Facebook)
- **File Uploads:** python-multipart for avatar uploads
- **Deployment:** Docker + VPS (planned)

### System Architecture

```text
User Input (Stock Ticker)
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
PostgreSQL Cache (agent results + synthesis, 4h TTL)
        ↓
Web UI + Mobile App (shows individual + final)
```

### Frontend Pages (Web)
- **Home** (`/`) — Hero section, search bar, quick ticker buttons, "How it works" features
- **Research** (`/research/{ticker}`) — Price card, bull/bear analysis, agent tabs, conclusion
- **Login** (`/login`) — Username/password + Google/Facebook OAuth
- **Register** (`/register`) — Account creation + OAuth
- **Watchlist** (`/watchlist`) — Saved stocks with add/remove
- **Profile** (`/profile`) — Avatar upload, display name edit, theme toggle, member card, points management

### Frontend Screens (Mobile)
- **Home** — Ticker search with quick-pick buttons
- **Research** — Price card, bull/bear/risks, expandable agent analysis
- **Watchlist** — Saved stocks with swipe actions
- **Profile** — Avatar upload, display name, theme toggle, member card, earn/buy points
- **Login/Register** — Username/password + OAuth

### Features
- **User Profile**: Upload profile picture, edit display name, toggle dark/light theme
- **Member System**: Tiered levels (Entry → Master) with points earned via ads or purchased
- **Dark Mode**: Full dark mode on web and mobile, synced via user profile
- **Multi-Agent Research**: 3 AI agents + judge synthesis
- **Watchlist**: Per-user stock watchlist

### API Endpoints
| Endpoint | Description |
|----------|-------------|
| `GET /quote/{ticker}` | Real-time stock quote |
| `GET /research/{ticker}` | Multi-agent research |
| `POST /auth/register` | User registration |
| `POST /auth/login` | User login (returns profile + member data) |
| `GET /auth/google` | Google OAuth |
| `GET /auth/facebook` | Facebook OAuth |
| `GET /auth/me` | Get current user with profile & member info |
| `PUT /auth/profile` | Update display name and theme |
| `POST /auth/avatar` | Upload profile picture |
| `GET /member/points` | Get member points, level, progress |
| `POST /member/points/earn` | Earn points (ad reward) |
| `POST /member/points/purchase` | Purchase points |
| `GET /member/history` | Point transaction history |
| `GET /watchlist` | Get user's watchlist |
| `POST /watchlist` | Add to watchlist |
| `DELETE /watchlist/{ticker}` | Remove from watchlist |

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

## Definition of Done
- [x] User login (JWT auth + Google/Facebook OAuth)
- [x] User can search stock ticker (AAPL, TSLA, NVDA)
- [x] System generates structured AI research summary
- [x] Bull vs Bear analysis is clearly displayed
- [x] "Why this stock today" explanation is shown (summary section)
- [x] User can add/remove stocks from watchlist
- [x] Cached results are reused within 4 hours
- [x] User can upload profile picture and edit display name
- [x] User can toggle dark/light theme (synced across web & mobile)
- [x] Member points system with levels (Entry → Master)
- [x] User can earn points by watching ads
- [x] User can purchase points manually
- [x] Mobile app (React Native Expo) runs on Android
- [x] Mobile app (React Native Expo) runs on iOS
- [ ] Backend API is deployed and publicly accessible
- [ ] Web app (Next.js) is deployed and usable on mobile browser
- [x] System clearly implements exactly:
  - 1 MCP (`.mcp.json` — filesystem MCP for stock data)
  - 1 Skill (`.claude/skills/stock-analysis/SKILL.md`)
  - 1 Agent (`.claude/agents/stock-research-agent.md`)
- [x] README includes architecture, setup guide, and demo instructions
