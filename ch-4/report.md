# Chapter 4 — BWAI Stock Research Report

## Project Overview

**BWAI (Buy With AI)** is an AI-powered stock research assistant that uses multiple AI agents to analyze stocks and provide balanced investment insights. It features user profiles, a gamified member system with tiered levels, and full dark mode support across web and mobile.

**GitHub Repository:** https://github.com/mangsuan/bwai-stock-research

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

The application is containerized with Docker Compose:

```bash
# Start the application
./deploy.sh start

# Or manually
docker compose up -d
```

**Services:**
- **db** — PostgreSQL 16
- **backend** — FastAPI on port 8000
- **frontend** — Next.js on port 3000

### Live URL

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs

## Definition of Done Status

| Requirement | Status | Evidence |
|-------------|--------|----------|
| User login | ✅ | JWT + OAuth (Google, Facebook) |
| Stock ticker search | ✅ | Yahoo Finance API integration |
| AI research summary | ✅ | Multi-agent with 3 agents |
| Bull vs Bear analysis | ✅ | Research page with cards |
| "Why this stock today" | ✅ | Summary section |
| Watchlist | ✅ | Add/remove per user |
| Cached results (4h) | ✅ | PostgreSQL cache |
| User profile | ✅ | Avatar upload, display name, theme |
| Member system | ✅ | Points, 7 levels, earn/buy |
| Dark mode | ✅ | Web + Mobile, synced via profile |
| MCP | ✅ | `.mcp.json` |
| Skill | ✅ | `.claude/skills/stock-analysis/SKILL.md` |
| Agent | ✅ | `.claude/agents/stock-research-agent.md` |
| README | ✅ | Complete with setup guide |
| Backend deployed | ✅ | Docker Compose |
| Web app deployed | ✅ | Docker Compose |
| Mobile app (Android) | ✅ | React Native (Expo) in `mobile/` |
| Mobile app (iOS) | ✅ | React Native (Expo) in `mobile/` |

## Screenshots

Screenshots are stored in the `screenshots/` directory:

1. `home.png` — Home page with search bar
2. `research.png` — Research results page
3. `login.png` — Login page with OAuth
4. `watchlist.png` — Watchlist page
5. `profile.png` — Profile page with member card
6. `api-docs.png` — Swagger API documentation

## User Profile

Users can customize their profile across web and mobile:

- **Avatar Upload** — Upload a profile picture (stored in `uploads/avatars/`, max 5MB)
- **Display Name** — Set a custom display name (falls back to username)
- **Theme Toggle** — Switch between light and dark mode (synced via user profile)
- **Username** — Shown as read-only (set at registration)

## Member System

Gamified engagement system with tiered levels and a points economy:

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

### Points Tracking
- All transactions are recorded in the `point_transactions` table
- Users can view their points history on the profile page
- Level updates automatically when points cross a threshold

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

Scan the QR code with Expo Go on your phone.

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

## Files Created for Chapter 4

| File | Purpose |
|------|---------|
| `Dockerfile` | Backend container |
| `frontend/Dockerfile` | Frontend container |
| `docker-compose.yml` | Multi-service orchestration |
| `deploy.sh` | Deployment script |
| `.dockerignore` | Docker build exclusions |
| `LICENSE` | MIT License |
| `ch-4/report.md` | This report |
| `mobile/` | React Native (Expo) mobile app |

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
# Build and start
./deploy.sh build
./deploy.sh start

# View logs
./deploy.sh logs

# Stop
./deploy.sh stop
```

## Conclusion

BWAI is a fully functional stock research assistant with:
- Multi-agent AI analysis for comprehensive insights
- User authentication and watchlist features
- User profiles with avatar upload and theme preferences
- Gamified member system with 7 levels and points economy
- Full dark mode support on web and mobile
- React Native mobile app for iOS and Android
- Docker deployment ready
- Complete documentation

The application is ready for deployment and meets all Chapter 4 requirements.
