<!--
Copy this file to member-proposals/<your-github-username>.md and fill it in.
Filename casing doesn't matter (WythWin.md or wythwin.md both work).
This is YOUR proposal — the relative-project you built in Chapter 2.
Sections 1-3 (Gist/Story/Why) due Chapter 2. Sections 4-6 due Chapter 3.
-->

# BWAI — Buy With AI — Proposal by @mangsuan

## Gist
An AI-powered stock research assistant that transforms market data into simple, structured insights to help users quickly understand whether a stock is worth further research.

## Story
A working professional hears about stocks like NVDA, TSLA, or AAPL from social media, news, or friends but does not have time to read financial reports, charts, and market analysis in detail. They want a quick, clear explanation of what is happening with a stock before deciding whether to look deeper.

BWAI helps by generating a short, structured research summary that explains key signals, trends, risks, and market behavior in simple language. It works across web and mobile so users can check insights anytime during their day.


## Why
Retail investors are often overwhelmed by fragmented and technical financial information from charts, news, and social media. This leads to confusion, hesitation, and emotionally driven decisions.

BWAI solves this by transforming raw market data into structured AI-generated insights that are easy to understand. It helps users focus on meaningful signals instead of noise and makes stock research faster, clearer, and more consistent.


## Why Not
- Not a trading platform or brokerage system.
- Not executing buy/sell orders or financial transactions.
- Not providing financial advice or guaranteed investment outcomes.
- Not managing full investment portfolios.
- Not a high-frequency trading or real-time trading system.
- Not integrated with brokers or financial institutions.


## Tech Spec
### Stack
- Frontend Web: Next.js (TypeScript + Tailwind CSS)
- Mobile Apps: React Native (Expo)
- Backend API: FastAPI (Python)
- Database: PostgreSQL
- Storage: Cloudflare R2
- Deployment: Docker + VPS (Hetzner / DigitalOcean)

### System Architecture

```text
User Input (Stock Ticker)
        ↓
Market Research Agent
        ↓
Financial Data MCP
        ↓
Stock Research Skill
        ↓
AI API (Claude / GPT)
        ↓
Structured Research Output
        ↓
PostgreSQL Cache
        ↓
Web / Mobile UI

## Definition of Done
- [ ] User login
- [ ] User can search stock ticker (AAPL, TSLA, NVDA)
- [ ] System generates structured AI research summary
- [ ] Bull vs Bear analysis is clearly displayed
- [ ] “Why this stock today” explanation is shown
- [ ] User can add/remove stocks from watchlist
- [ ] Cached results are reused within 24 hours
- [ ] Backend API is deployed and publicly accessible
- [ ] Web app (Next.js) is deployed and usable on mobile browser
- [ ] Mobile app (React Native Expo) runs on Android
- [ ] Mobile app (React Native Expo) runs on iOS (TestFlight or build)
- [ ] System clearly implements exactly:
  - 1 MCP
  - 1 Skill
  - 1 Agent
- [ ] README includes architecture, setup guide, and demo instructions

