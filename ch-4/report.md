# ch-4 Personal Project — Report

github_username: mangsuan
personal_repo_url: https://github.com/mangsuan/bwai-stock-research
project_summary: BWAI (Buy With AI) is an AI-powered stock research assistant with multi-agent AI analysis, user profiles, member levels, and dark mode across web and mobile.
slides_url: slides/pitch.md
license: MIT
live_url: http://localhost:3000
download_url: N/A

## Screenshots

Desktop resolution: 1280×800
Mobile resolution: 390×844

### Desktop Screenshots

![Home page](screenshots/01-home.png)
![Research results](screenshots/02-research.png)
![Login page](screenshots/03-login.png)
![Profile page](screenshots/04-profile.png)
![Watchlist page](screenshots/05-watchlist.png)
![API docs](screenshots/06-api-docs.png)

### Mobile Screenshots

![Mobile home](screenshots/07-mobile-home.png)
![Mobile profile](screenshots/08-mobile-profile.png)

## What Was Built

### Core Features
1. **Multi-Agent AI Analysis** — 3 AI agents (DeepSeek, mimo, mimo-pro) analyze each stock in parallel
2. **Judge Synthesis** — A judge AI (mimo-v2.5-pro) combines all feedback into a balanced final assessment
3. **Real-Time Data** — Yahoo Finance API for live prices and market metrics
4. **User Authentication** — JWT-based auth with Google/Facebook OAuth
5. **Watchlist** — Per-user stock watchlist with add/remove functionality
6. **PostgreSQL Caching** — 4-hour TTL for fast repeat lookups
7. **User Profile** — Avatar upload, display name editing, dark/light theme toggle
8. **Member System** — Tiered levels (Entry → Master) with points earned via ads or purchased
9. **Dark Mode** — Full dark mode on web and mobile, synced via user profile
10. **Apple-Inspired UI** — Clean, minimalist design with smooth animations

### Tech Stack

| Component | Technology |
|-----------|------------|
| Backend API | FastAPI (Python) |
| Financial Data | Yahoo Finance API |
| AI Agents | DeepSeek, mimo, mimo-pro |
| Judge AI | mimo-v2.5-pro |
| Database | PostgreSQL (asyncpg) |
| Auth | JWT + OAuth (Google, Facebook) |
| Frontend Web | Next.js + Tailwind CSS |
| Frontend Mobile | React Native / Expo |
| File Uploads | python-multipart (avatars) |
| Deployment | Docker + Docker Compose |

### Architecture

```
User enters ticker (e.g., AAPL)
        ↓
Yahoo Finance API → Real-time price data
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

## Deployment

### Docker Deployment

```bash
# Build and start
./deploy.sh build
./deploy.sh start

# View logs
./deploy.sh logs

# Stop
./deploy.sh stop
```

**Services:**
- **db** — PostgreSQL 16
- **backend** — FastAPI on port 8000
- **frontend** — Next.js on port 3000

## Member System

### Member Levels

| Points | Level | Badge |
|--------|-------|-------|
| 0–99 | Entry | ⭐ |
| 100–199 | Bronze | 🥉 |
| 200–299 | Silver | 🥈 |
| 300–399 | Gold | 🥇 |
| 400–499 | Platinum | 💎 |
| 500–999 | Diamond | 💠 |
| 1000+ | Master | 👑 |

### How to Earn Points
- **Watch Ads** — Earn points by watching ads (simulated for demo)
- **Purchase** — Buy points manually (simulated for demo)

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /quote/{ticker}` | Real-time stock quote |
| `GET /research/{ticker}` | Multi-agent research |
| `POST /auth/register` | User registration |
| `POST /auth/login` | User login (returns profile + member data) |
| `GET /auth/me` | Get current user (profile + member info) |
| `PUT /auth/profile` | Update display name and theme |
| `POST /auth/avatar` | Upload profile picture |
| `GET /member/points` | Get member points, level, progress |
| `POST /member/points/earn` | Earn points (ad reward) |
| `POST /member/points/purchase` | Purchase points |
| `GET /member/history` | Point transaction history |
| `GET /watchlist` | Get user's watchlist |
| `POST /watchlist` | Add to watchlist |
| `DELETE /watchlist/{ticker}` | Remove from watchlist |

## Mobile App

React Native (Expo) mobile app in `mobile/` with full feature parity:

| Screen | Features |
|--------|----------|
| Home | Search bar, quick tickers, "How it works" |
| Research | Price card, bull/bear, agent analysis, watchlist button |
| Login | Username/password + Google/Facebook OAuth |
| Register | Username/email/password + Google/Facebook OAuth |
| Watchlist | Saved stocks (requires login) |
| Profile | Avatar upload, display name, theme toggle, member card, earn/buy points |

**Running the mobile app:**
```bash
cd mobile
npm install
npx expo start
```

## How to Run

### Local Development

```bash
# Backend
pip install -r requirements.txt
uvicorn app:app --reload --port 8000

# Frontend (Web)
cd frontend
npm install
npm run dev

# Frontend (Mobile)
cd mobile
npm install
npx expo start
```

### Docker Deployment

```bash
./deploy.sh build
./deploy.sh start
```

## Files for Chapter 4

| File | Purpose |
|------|---------|
| `LICENSE` | MIT License |
| `screenshots/` | Project screenshots |
| `slides/pitch.md` | Product-intro slide deck |
| `ch-4/report.md` | This report |
| `Dockerfile` | Backend container |
| `docker-compose.yml` | Multi-service orchestration |
| `deploy.sh` | Deployment script |
| `mobile/` | React Native (Expo) mobile app |

## Evidence — Claude Code Assets

### MCP
- path: `.mcp.json`
- what: Filesystem MCP server for local stock data access

### Skill
- path: `.claude/skills/stock-analysis/SKILL.md`
- what: Stock analysis skill for structured summaries

### Agent
- path: `.claude/agents/stock-research-agent.md`
- what: Stock research agent for generating insights
