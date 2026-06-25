---
marp: true
auto-advance: 20
---

# BWAI — Buy With AI

### AI-powered stock research made simple
- BWAI helps people understand stocks faster
- Turns market noise into clear, structured insights
- Built for busy investors and curious learners

---

## The problem

- Retail investors are overwhelmed by charts, news, and reports
- Financial information is fragmented and often too technical
- Many people hesitate because they do not know what matters
- No easy way to track engagement or reward loyal users

---

## The solution

- BWAI gives a short research summary for any stock ticker
- Explains key signals, trends, risks, and market behavior
- Presents insights in simple language for quick decision-making
- User profiles with avatar, dark mode, and member levels

---

## How it works

1. User enters a stock ticker such as AAPL, NVDA, or TSLA
2. The system gathers market data from Yahoo Finance
3. 3 AI agents analyze the stock in parallel
4. A judge AI synthesizes all feedback into a final assessment
5. Results are shown through web or mobile experience

---

## Multi-Agent Architecture

```
User Input → Yahoo Finance API
        ↓
DeepSeek ──→ Quick Analysis ───┐
mimo     ──→ Deep Analysis  ───┤
mimo-pro ──→ Validation     ───┤
        ↓
Judge AI (mimo-v2.5-pro)
        ↓
Final Research Output → Cache (4h TTL)
```

---

## User Features

- **User Profile** — Upload avatar, edit display name
- **Dark Mode** — Full dark mode on web and mobile
- **Watchlist** — Save favorite stocks for quick access
- **Member System** — Earn points, level up from Entry to Master

---

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

Earn points by watching ads or purchasing

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Backend | FastAPI (Python) |
| Frontend Web | Next.js + Tailwind CSS |
| Frontend Mobile | React Native / Expo |
| Database | PostgreSQL |
| AI Agents | DeepSeek, mimo, mimo-pro |
| Auth | JWT + OAuth |

---

## Mobile App

- React Native / Expo app for iOS and Android
- Same features as web: search, research, watchlist, profile
- Dark mode synced from user profile
- Tab navigation: Research, Watchlist, Profile

---

## Why this matters

- Saves time for users who cannot read long reports
- Reduces confusion and emotional decision-making
- Helps users focus on meaningful signals instead of noise
- Member system encourages continued engagement
- Works on web and mobile for access anywhere

---

## Demo

- **Web:** <!-- TODO: add deployed URL -->
- **API Docs:** <!-- TODO: add deployed URL -->/docs
- **Mobile:** `cd mobile && npx expo start`

---
