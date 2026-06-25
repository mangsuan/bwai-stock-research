<!-- ch-3 personal-project report. Copy this file to ch-3/<your-github-username>/report.md -->
<!-- Before you pass: your project repo needs at least 3 GitHub stars (ask teammates
     to open your repo and click ⭐). This proves it is a real, shared project. -->
# ch-3 Personal Project — Report

github_username: mangsuan
personal_repo_url: https://github.com/mangsuan/bwai-stock-research
project_summary: BWAI (Buy With AI) is an AI-powered stock research assistant that helps users quickly understand whether a stock is worth deeper research. Features user profiles, member levels, and a gamified points system.
slides_url: slides/pitch.md

## Methodology
I built BWAI using a project-based workflow that started from the proposal and moved through repository setup, documentation, and presentation assets. I used Git for version control and updated the project incrementally as the concept, README, slides, and report were refined.

The project evolved from a single-AI analysis to a **multi-agent architecture** where multiple AI models analyze the same stock in parallel, and a judge AI synthesizes all feedback into a final balanced assessment. The scope expanded to include user profiles with avatar uploads, dark/light theme support, and a member system with tiered levels and a points economy.

## Multi-Agent Architecture

BWAI uses a multi-agent approach for stock analysis:

1. **Data Collection**: Yahoo Finance API provides real-time price data, 52-week range, and market metrics
2. **Parallel Analysis**: Multiple AI agents analyze the same stock simultaneously:
   - **DeepSeek** — Quick, cost-effective first pass
   - **mimo** — Deep analysis with nuanced reasoning
   - **mimo-pro** — Validation and second opinion
3. **Synthesis**: A judge AI (mimo-v2.5-pro) reads all agent analyses and produces a final balanced assessment
4. **Storage**: Individual agent results and final synthesis are cached in PostgreSQL (4h TTL)

This approach ensures:
- Multiple perspectives reduce blind spots
- Consensus points are identified (mentioned by multiple agents)
- Contradictions are resolved by the judge AI
- Users can see individual agent opinions alongside the final synthesis

## Implementation Summary

### Backend (FastAPI)
- **Yahoo Finance Integration**: Real-time stock data via chart API (no API key needed)
- **Multi-Agent Engine**: Parallel AI agent calls with synthesis
- **Database**: PostgreSQL with async SQLAlchemy for caching
- **Authentication**: JWT-based auth with Google/Facebook OAuth
- **Watchlist**: Per-user stock watchlist with CRUD operations
- **User Profile**: Avatar upload (multipart form data), display name, theme preference
- **Member System**: Points tracking, level calculation, transaction history
- **Static File Serving**: Uploaded avatars served via FastAPI StaticFiles

### Frontend (Next.js)
- **Apple-Inspired UI**: Clean, minimalist design with smooth animations
- **Pages**: Home, Research, Login, Register, Watchlist, Profile
- **Dark Mode**: Full dark mode via CSS variables and ThemeContext
- **Member Badge**: Visual level indicator with progress bar
- **Responsive**: Works on desktop and mobile browsers

### Mobile App (React Native / Expo)
- **Tab Navigation**: Research, Watchlist, Profile tabs
- **Dark Mode**: Theme synced from user profile via ThemeContext
- **Avatar Upload**: expo-image-picker for profile pictures
- **Member Card**: Points, level, earn/buy interface
- **Expo Go**: Runs on Android and iOS via Expo Go

### Features Implemented
- ✅ User login (JWT + OAuth)
- ✅ Stock ticker search
- ✅ Multi-agent AI research
- ✅ Bull vs Bear analysis
- ✅ Watchlist with add/remove
- ✅ PostgreSQL caching (4h TTL)
- ✅ User profile (avatar upload, display name edit)
- ✅ Dark/light theme (synced across web & mobile)
- ✅ Member system (7 levels: Entry → Master)
- ✅ Points economy (earn via ads, purchase manually)
- ✅ Mobile app (React Native / Expo)
- ✅ Apple-inspired UI design

## Evidence — Claude Code usage
The repository includes the following Claude Code assets that support the project workflow.

### MCP
- path: .mcp.json
- what: Configured the filesystem MCP server to access local stock-related data from the data folder for research context and project organization.

### Skill
- path: .claude/skills/stock-analysis/SKILL.md
- what: Added a stock-analysis skill that guides structured stock summaries, bullish and bearish factor analysis, risk explanation, and balanced conclusions.

### Agent
- path: .claude/agents/stock-research-agent.md
- what: Added a stock research agent that specializes in reading stock information, generating concise summaries, explaining risks, and comparing bullish and bearish views.

## Project Structure

```
bwai-stock-research/
├── app.py                  # FastAPI backend (multi-agent, auth, profile, member, watchlist)
├── database.py             # PostgreSQL models (users, watchlist, cache, member_points, transactions)
├── requirements.txt        # Python dependencies
├── uploads/avatars/        # User profile pictures
├── frontend/               # Next.js web app
│   └── src/
│       ├── app/
│       │   ├── page.tsx              # Home page
│       │   ├── login/page.tsx        # Login page
│       │   ├── register/page.tsx     # Register page
│       │   ├── watchlist/page.tsx    # Watchlist page
│       │   ├── profile/page.tsx      # Profile page
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
