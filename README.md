# BWAI — Buy With AI

AI-powered stock research assistant that transforms market data into structured insights using multiple AI agents.

🌐 **Live:** https://mangsuan.github.io/bwai-stock-research

## Features

### Stock Research
- Multi-agent analysis with 3 AI agents (DeepSeek, mimo, mimo-pro)
- Bull/bear case synthesis with balanced conclusion
- Real-time stock quotes from Yahoo Finance
- Research cache with 4-hour TTL
- Colored agent badges (200+ points)

### Stock Rankings
- **Global Ranking** — Top companies ranked by market cap
- **By Country** — 16 countries with expandable stock lists
- **By Category** — 9 sectors with color-coded cards
- Live prices from Yahoo Finance

### AI Hidden Gem Discovery
- Daily AI-powered stock discovery
- 7 specialized agents with weighted scoring
- Hidden Gem Journey Timeline tracking
- Requires 500+ member points

### Admin Panel
- User management (create, edit, suspend, delete)
- Transaction oversight with filters
- Purchase approval system
- Per-user page visibility control
- Edit user points and levels

### Member System
- Points earned via ad rewards or purchases
- 7 membership levels (Entry → Master)
- Feature gating based on points
- Expandable points history

### Additional Features
- Contact page with form and FAQ
- Terms & Conditions page
- Dark/light theme toggle
- Apple-inspired UI with premium animations
- Mobile app (React Native / Expo)

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Backend | FastAPI (Python) |
| Database | PostgreSQL / SQLite |
| Frontend | Next.js 16 + Tailwind CSS |
| Mobile | React Native / Expo |
| AI | DeepSeek, mimo, mimo-pro |
| Auth | JWT + OAuth (Google, Facebook) |
| Deployment | GitHub Pages |

## Quick Start

```bash
# Clone
git clone https://github.com/mangsuan/bwai-stock-research.git
cd bwai-stock-research

# Install backend deps
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt

# Install frontend deps
cd frontend && npm install && cd ..

# Start all services
./start.sh
```

Services:
- Backend: http://localhost:8000
- Frontend: http://localhost:3001
- API Docs: http://localhost:8000/docs

## Service Management

```bash
./start.sh              # Start all
./start.sh backend      # Start backend only
./start.sh frontend     # Start frontend only
./stop.sh               # Stop all
./restart.sh            # Restart all
```

## Create Admin User

```bash
# Register a user first, then promote:
.venv/bin/python3 -c "import asyncio; from database import admin_update_user; asyncio.run(admin_update_user(1, role='admin'))"
```

## Pages

| Page | URL | Description |
|------|-----|-------------|
| Home | `/` | Hero, search, quick tickers, stats |
| Explore | `/explore` | Sector grouping, search, watchlist |
| Rankings | `/rankings` | Global ranking by market cap |
| By Country | `/rankings/countries` | 16 countries |
| By Category | `/rankings/categories` | 9 sectors |
| Research | `/research/{ticker}` | AI analysis with colored agents |
| Potential | `/potential-stocks` | Hidden gem discovery (500+ pts) |
| Admin | `/admin` | Dashboard, users, transactions, purchases |
| Profile | `/profile` | Points, theme, avatar |
| Watchlist | `/watchlist` | Saved stocks |
| Contact | `/contact` | Contact form + FAQ |
| Terms | `/terms` | Terms & Conditions |

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /` | API status |
| `GET /stocks?q=` | Search stocks |
| `GET /stocks/sectors` | Stocks by sector |
| `GET /quote/{ticker}` | Real-time quote |
| `GET /research/{ticker}` | Multi-agent research |
| `GET /rankings/global` | Global ranking |
| `GET /rankings/countries` | By country |
| `GET /rankings/categories` | By category |
| `GET /potential-stocks/today` | Hidden gem picks |
| `POST /auth/register` | Register |
| `POST /auth/login` | Login |
| `GET /admin/stats` | Admin dashboard |
| `GET /admin/users` | List users |
| `POST /admin/purchases/{id}/approve` | Approve purchase |
| `GET /docs` | Swagger UI |

## Member Levels

| Points | Level |
|--------|-------|
| 0–99 | Entry |
| 100–199 | Bronze |
| 200–299 | Silver |
| 300–399 | Gold |
| 400–499 | Platinum |
| 500–999 | Diamond |
| 1000+ | Master |

## Feature Gating

| Feature | Points Required |
|---------|----------------|
| Colored AI agent badges | 200+ |
| Potential Stocks | 500+ |
| Admin panel | Admin role |

## Environment Variables

Backend (`vibe-key.env`):
```
AI_API_URL=https://proxy.vibecode.tours/v1/chat/completions
AI_API_KEY=your-key
DATABASE_URL=sqlite+aiosqlite:///./bwai.db
JWT_SECRET=your-secret
```

Frontend (`frontend/.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Mobile:
```
EXPO_PUBLIC_API_BASE=http://localhost:8000
```

## Project Structure

```
bwai-stock-research/
├── app.py                  # FastAPI backend
├── database.py             # Database models & logic
├── requirements.txt        # Python dependencies
├── start.sh / stop.sh      # Service management
├── frontend/               # Next.js web app
│   └── src/
│       ├── app/
│       │   ├── page.tsx              # Home
│       │   ├── explore/page.tsx      # Explore
│       │   ├── rankings/             # Rankings
│       │   ├── research/[ticker]/    # Research
│       │   ├── potential-stocks/     # Hidden gems
│       │   ├── admin/                # Admin panel
│       │   ├── profile/page.tsx      # Profile
│       │   ├── contact/page.tsx      # Contact
│       │   └── terms/page.tsx        # Terms
│       ├── components/
│       │   ├── Navbar.tsx
│       │   └── MemberBadge.tsx
│       └── contexts/
├── mobile/                 # React Native app
│   ├── app/
│   ├── components/
│   ├── contexts/
│   └── lib/
└── uploads/                # Avatar uploads
```

## Documentation

- [CLAUDE.md](CLAUDE.md) — Development guide
- [feature_hidden_gems.md](feature_hidden_gems.md) — Feature specification
- [proposal_mangsuan.md](proposal_mangsuan.md) — Product vision
- [report.md](report.md) — Project report

## Definition of Done

| Requirement | Status |
|-------------|--------|
| User login | ✅ JWT + OAuth |
| Stock search | ✅ Yahoo Finance |
| AI research | ✅ Multi-agent |
| Bull/Bear analysis | ✅ Research page |
| Stock rankings | ✅ Global, Country, Category |
| Potential Stocks | ✅ AI hidden gem discovery |
| Admin panel | ✅ User/transaction management |
| Watchlist | ✅ Add/remove |
| Contact page | ✅ Form + FAQ |
| Terms page | ✅ 13 sections |
| User profile | ✅ Avatar, theme, points |
| Member system | ✅ Points, levels, gating |
| Dark mode | ✅ Web + Mobile |
| Mobile app | ✅ React Native / Expo |
| Deploy | ✅ GitHub Pages |

## License

© 2026 BWAI. All rights reserved.
