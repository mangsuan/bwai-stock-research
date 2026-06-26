# BWAI Stock Research

BWAI (Buy With AI) is an AI-powered stock research assistant that uses **multiple AI agents** to analyze stocks and provide balanced investment insights.

## How It Works

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

## Features

- **Multi-Agent Analysis**: 3 AI agents analyze each stock in parallel
- **Judge Synthesis**: A judge AI combines all feedback into a balanced final assessment
- **Potential Stocks**: AI-powered hidden gem discovery — finds underfollowed stocks with strong growth potential
- **Real-Time Data**: Yahoo Finance API for live prices and market metrics
- **Caching**: PostgreSQL cache with 4-hour TTL for fast repeat lookups
- **Individual Views**: See what each AI agent thinks alongside the final synthesis
- **User Authentication**: Register/login with username/password or OAuth (Google, Facebook)
- **Watchlist**: Save your favorite stocks for quick access
- **User Profile**: Upload avatar, edit display name, toggle dark/light theme
- **Member System**: Earn points by watching ads or purchasing, level up from Entry to Master
- **Dark Mode**: Full dark mode support on both web and mobile
- **Apple-Inspired UI**: Clean, minimalist design with smooth animations
- **Mobile App**: React Native / Expo app for iOS and Android

## Tech Stack

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
| File Storage | Local uploads (avatars) |

## Getting Started

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/mangsuan/bwai-stock-research.git
cd bwai-stock-research

# Start with Docker Compose
./deploy.sh start
```

Open `http://localhost:3000`

### Option 2: Local Development

**Prerequisites:**
- Python 3.11+
- Node.js 18+
- PostgreSQL (or SQLite for local dev)

**Backend:**
```bash
# Install dependencies
pip install -r requirements.txt

# Configure environment
cp vibe-key.env .env
# Edit .env with your database URL and API keys

# Start the server
uvicorn app:app --reload --port 8000
```

**Frontend (Web):**
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`

**Frontend (Mobile):**
```bash
cd mobile
npm install
npm run start
```

Scan the QR code with Expo Go on your phone.

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /` | API status |
| `GET /quote/{ticker}` | Real-time stock quote |
| `GET /research/{ticker}` | Multi-agent research |
| `GET /agents` | List available AI agents |
| `GET /cache/{ticker}` | Check cache status |
| `POST /auth/register` | Register new user |
| `POST /auth/login` | Login |
| `GET /auth/google` | Google OAuth |
| `GET /auth/facebook` | Facebook OAuth |
| `GET /auth/me` | Get current user (with profile & member data) |
| `PUT /auth/profile` | Update display name and theme |
| `POST /auth/avatar` | Upload profile picture |
| `GET /member/points` | Get member points and level |
| `POST /member/points/earn` | Earn points (ad reward) |
| `POST /member/points/purchase` | Purchase points |
| `GET /member/history` | Point transaction history |
| `GET /watchlist` | Get user's watchlist |
| `POST /watchlist` | Add ticker to watchlist |
| `DELETE /watchlist/{ticker}` | Remove from watchlist |
| `GET /watchlist/{ticker}/check` | Check if ticker is in watchlist |
| `GET /potential-stocks/today` | Get latest potential stock picks |
| `GET /potential-stocks/history` | Browse past discovery runs |
| `GET /potential-stocks/{ticker}` | Get detailed pick with agent scores |
| `POST /potential-stocks/run` | Trigger discovery run |
| `GET /docs` | Swagger UI |

## Member Levels

| Points | Level | Badge |
|--------|-------|-------|
| 0–99 | Entry | ⭐ |
| 100–199 | Bronze | 🥉 |
| 200–299 | Silver | 🥈 |
| 300–399 | Gold | 🥇 |
| 400–499 | Platinum | 💎 |
| 500–999 | Diamond | 💠 |
| 1000+ | Master | 👑 |

## Project Structure

```
bwai-stock-research/
├── app.py                  # FastAPI backend
├── database.py             # PostgreSQL models & cache
├── requirements.txt        # Python dependencies
├── uploads/                # User avatar uploads
├── frontend/               # Next.js web app
│   └── src/
│       ├── app/
│       │   ├── page.tsx              # Home page
│       │   ├── login/page.tsx        # Login page
│       │   ├── register/page.tsx     # Register page
│       │   ├── explore/page.tsx      # Stock explorer
│       │   ├── watchlist/page.tsx    # Watchlist page
│       │   ├── profile/page.tsx      # Profile page
│       │   ├── potential-stocks/
│       │   │   ├── page.tsx          # Potential stocks listing
│       │   │   └── [ticker]/
│       │   │       └── page.tsx      # Potential stock detail
│       │   └── research/[ticker]/
│       │       └── page.tsx          # Research results
│       ├── components/
│       │   ├── Navbar.tsx            # Navigation bar
│       │   └── MemberBadge.tsx       # Member level badge
│       └── contexts/
│           ├── AuthContext.tsx       # Auth state management
│           └── ThemeContext.tsx      # Dark/light theme
├── mobile/                 # React Native / Expo app
│   ├── app/
│   │   ├── (tabs)/
│   │   │   ├── index.tsx            # Home/search
│   │   │   ├── watchlist.tsx        # Watchlist
│   │   │   └── profile.tsx          # Profile
│   │   ├── research/[ticker].tsx    # Research detail
│   │   ├── login.tsx                # Login
│   │   └── register.tsx             # Register
│   ├── components/
│   │   └── MemberBadge.tsx          # Member level badge
│   ├── contexts/
│   │   ├── AuthContext.tsx          # Auth state
│   │   └── ThemeContext.tsx         # Theme provider
│   └── lib/
│       └── api.ts                   # API fetch wrapper
├── data/                   # Stock data files
├── proposal_mangsuan.md    # Product vision
├── report.md               # Project report
└── slides/pitch.md         # Presentation deck
```

## Documentation

- [proposal_mangsuan.md](proposal_mangsuan.md) — Product vision and tech spec
- [report.md](report.md) — Project report with methodology
- [slides/pitch.md](slides/pitch.md) — Pitch deck (6 slides)

## Definition of Done Status

| Requirement | Status |
|-------------|--------|
| User login | ✅ JWT + OAuth |
| Stock ticker search | ✅ Yahoo Finance |
| AI research summary | ✅ Multi-agent |
| Bull vs Bear analysis | ✅ Research page |
| Potential Stocks | ✅ AI hidden gem discovery |
| Watchlist | ✅ Add/remove |
| Cache (4h TTL) | ✅ PostgreSQL |
| User profile | ✅ Avatar, display name, theme |
| Member system | ✅ Points, levels, earn/buy |
| Dark mode | ✅ Web + Mobile |
| Mobile app | ✅ React Native / Expo |
| MCP | ✅ `.mcp.json` |
| Skill | ✅ `.claude/skills/` |
| Agent | ✅ `.claude/agents/` |
| README | ✅ Complete |
| Deploy | ⬜ Planned |
