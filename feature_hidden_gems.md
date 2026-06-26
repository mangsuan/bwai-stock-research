# MASTER FEATURE SPECIFICATION

# POTENTIAL STOCKS - AI HIDDEN GEM DISCOVERY PLATFORM

## PROJECT OVERVIEW

You are a senior software architect, senior AI engineer, senior product manager, senior UX designer, senior frontend engineer, senior backend engineer, and senior mobile engineer.

Design and implement a complete production-ready feature called:

# Potential Stocks

Potential Stocks is an AI-powered stock discovery platform that identifies underfollowed, low-priced, hidden gem stocks with strong future growth potential before they become popular.

This feature must become one of the most important pages in the application and encourage users to return every day.

The system must discover opportunities rather than simply showing already-popular stocks.

The AI must explain:

* Why this stock was discovered
* Why the market has not noticed it
* What recently changed
* What future catalysts exist
* How accurate previous AI discoveries were

The feature should create trust, transparency, explainability, and long-term user engagement.

---

# PRIMARY OBJECTIVES

Help users discover:

* Hidden Gems
* Emerging Growth Companies
* Undervalued Stocks
* Underfollowed Stocks
* Small-Cap Opportunities
* Turnaround Stories
* Early Growth Stocks

Avoid recommending:

* Popular mega-cap stocks
* Heavily covered stocks
* Overcrowded trades

Unless they genuinely meet hidden-gem criteria.

---

# MENU STRUCTURE

Add new sidebar navigation item:

Potential Stocks

Icon:

Sparkles
Radar
Target

Web Route:

/potential-stocks

Mobile Route:

PotentialStocksScreen

Position:

Directly under AI Research.

---

# FEATURE PHILOSOPHY

Most platforms answer:

"What stocks are popular?"

This feature answers:

"What stocks should become popular in the future?"

The AI should actively search for opportunities that most investors have not yet discovered.

---

# DAILY AI DISCOVERY ENGINE

Create automated scheduled jobs.

Run every day:

01:00 UTC

Pipeline:

1. Load stock universe
2. Fetch market data
3. Fetch financial statements
4. Fetch valuation metrics
5. Fetch analyst coverage
6. Fetch ownership data
7. Fetch insider transactions
8. Fetch news
9. Fetch earnings data
10. Fetch social sentiment
11. Execute AI agents
12. Calculate scores
13. Generate explanations
14. Store recommendations
15. Update historical performance

---

# STOCK UNIVERSE FILTERING

Exclude:

* Delisted stocks
* Suspended stocks
* Extremely illiquid stocks
* Companies under severe financial distress
* Shell companies
* Stocks below configurable liquidity threshold

Prefer:

* Improving fundamentals
* Revenue acceleration
* Earnings acceleration
* Positive cash flow
* Reasonable debt
* Undervalued metrics
* Strong future opportunities

---

# AI MULTI-AGENT SYSTEM

Each agent produces:

* Score
* Confidence
* Evidence
* Explanation

---

## FUNDAMENTAL AGENT

Analyze:

Revenue Growth

Profit Growth

Operating Margin

Net Margin

Cash Flow

Debt Ratio

Balance Sheet

Return:

Fundamental Score

0-100

---

## GROWTH AGENT

Analyze:

Industry Growth

Future Market Size

Expansion Opportunities

Product Innovation

Competitive Advantage

Return:

Growth Score

0-100

---

## VALUATION AGENT

Analyze:

PE

PB

EV/EBITDA

PEG

Price-to-Sales

Historical Valuation

Return:

Valuation Score

0-100

---

## MOMENTUM AGENT

Analyze:

Price Momentum

Volume Momentum

Relative Strength

Accumulation Signals

Return:

Momentum Score

0-100

---

## NEWS AGENT

Analyze:

News Sentiment

Contracts

Partnerships

Acquisitions

Product Launches

Management Updates

Return:

News Score

0-100

---

## RISK AGENT

Analyze:

Debt Risk

Bankruptcy Risk

Dilution Risk

Governance Risk

Legal Risk

Return:

Risk Score

0-100

---

# HIDDEN GEM AGENT

This is a unique proprietary AI agent.

Purpose:

Determine why this stock is not yet popular.

Analyze:

Analyst Coverage

Institutional Ownership

News Mentions

Social Mentions

Search Trends

Market Awareness

Generate:

Hidden Gem Score

0-100

Generate:

WHY THE STOCK WAS HIDDEN

Examples:

Only followed by 3 analysts.

Limited institutional ownership.

Operates in a niche industry.

Recently listed and underfollowed.

Market attention focused elsewhere.

Ignored due to temporary sector weakness.

This field MUST be displayed prominently on every stock card.

---

# CHANGE DETECTION AGENT

This is another proprietary AI agent.

Purpose:

Determine what recently changed.

Compare:

Latest Quarter vs Previous Quarter

Current Year vs Previous Year

Recent News vs Historical News

Recent Performance vs Historical Performance

Generate:

Change Score

0-100

Generate:

WHAT CHANGED RECENTLY

Examples:

Revenue growth accelerated from 12% to 35%.

Profitability turned positive.

Debt reduced by 40%.

Major contract secured.

Management raised guidance.

This field MUST be displayed prominently on every stock card.

---

# POTENTIAL SCORE ENGINE

Calculate:

Potential Score

Weighting:

25% Fundamental

20% Growth

15% Valuation

10% Momentum

10% News

10% Hidden Gem

10% Change Detection

Range:

0-100

Categories:

95-100 Exceptional Opportunity

90-94 High Conviction

80-89 Strong Opportunity

70-79 Watchlist Candidate

Below 70 Not Displayed

---

# DAILY STOCK SELECTION

Select:

Top 10 Potential Stocks

Generate:

Potential Score

Confidence

AI Summary

Growth Drivers

Catalysts

Risks

Why Hidden

What Changed Recently

Future Opportunity Narrative

Store permanently.

---

# POTENTIAL STOCK CARD DESIGN

Every card must display:

Company Name

Ticker

Current Price

Potential Score

Confidence

Sector

Industry

Market Cap

---

Section:

WHY THE STOCK WAS HIDDEN

Example:

Only covered by 2 analysts and receives very little institutional attention.

---

Section:

WHAT CHANGED RECENTLY

Example:

Revenue growth accelerated from 14% to 39% in the latest quarter.

---

Section:

KEY CATALYST

Example:

New expansion into Southeast Asia market.

---

Buttons:

View Analysis

Add To Watchlist

Bookmark

Share

---

# STOCK DETAIL PAGE

Route:

/potential-stocks/[ticker]

Display:

Potential Score

Confidence Score

AI Summary

Why Hidden

What Changed Recently

Agent Breakdown

Fundamental Analysis

Growth Analysis

Valuation Analysis

Momentum Analysis

News Analysis

Risk Analysis

Catalysts

Risks

Opportunities

Historical Performance

News Timeline

AI Chat

Watchlist Integration

Bookmark

Share

---

# HIDDEN GEM JOURNEY TIMELINE

This is a flagship feature.

For every discovered stock create snapshots.

Capture:

Day 0

Day 7

Day 30

Day 90

Day 180

Day 365

Store:

Price

Score

AI Summary

Market Cap

Performance

Important Events

Example:

AI discovered this stock on 15 June 2026 at RM0.48 because revenue growth accelerated and analyst coverage was low.

Day 30:
RM0.59 (+22.9%)

Day 90:
RM0.73 (+52.1%)

Day 365:
RM0.91 (+89.6%)

Display as visual timeline.

Purpose:

Build trust in AI recommendations.

Show historical accountability.

Create measurable AI performance.

---

# AI DISCOVERY HISTORY

Users can browse:

Today

Yesterday

Last 7 Days

Last 30 Days

Monthly Archive

Yearly Archive

Full History

Search:

Ticker

Company

Sector

Date

Potential Score

---

# AI PERFORMANCE CENTER

Create dedicated analytics page.

Display:

Total Picks

Winning Picks

Losing Picks

Hit Rate

Average Return

Average Alpha

Best Pick

Worst Pick

Top Performing Sector

Most Accurate Month

Average Potential Score

Average Confidence

---

# LEADERBOARD PAGE

Show:

Top 10 Historical Winners

Top 10 Fastest Growers

Top 10 Hidden Gems

Most Accurate Discoveries

Highest Alpha Returns

---

# WEB APPLICATION

Technology:

Next.js 15

TypeScript

TailwindCSS

ShadCN UI

TanStack Query

Recharts

Framer Motion

Requirements:

SSR

SEO

Accessibility

Responsive Design

Dark Mode

Caching

Pagination

Optimistic Updates

---

# MOBILE APPLICATION

Technology:

React Native

Expo

TypeScript

React Query

Features:

Potential Stocks Tab

Swipeable Cards

Bookmark

Share

Watchlist

Push Notifications

Offline Cache

Infinite Scroll

Pull To Refresh

Mobile Timeline View

Mobile Analytics View

---

# UX DESIGN REQUIREMENTS

Design style:

Modern Fintech

Premium

Data-Rich

Professional

Inspired by:

Bloomberg

TradingView

FinChat

Seeking Alpha

Morningstar

Requirements:

Clean hierarchy

Large score visualization

Explainability-first design

Minimal clutter

Fast scanning

Trust-building visuals

Strong empty states

Skeleton loading

Smooth animations

---

# NOTIFICATIONS

Daily:

Today's Potential Stocks Are Ready

New Hidden Gem Discovered

High Confidence Opportunity Found

Performance Milestone Reached

Examples:

One of yesterday's AI picks is up 18%.

A hidden gem discovered 90 days ago has gained 62%.

---

# USER FEATURES

Bookmark Discovery

Watchlist Integration

Share Discovery

Follow Discovery

Add Notes

Create Alerts

Export Analysis

Export Timeline

Save Reports

---

# DATABASE TABLES

potential_stock_runs

potential_stock_picks

potential_stock_agent_scores

potential_stock_performance

potential_stock_timeline_snapshots

potential_stock_views

potential_stock_bookmarks

potential_stock_shares

potential_stock_alerts

potential_stock_notifications

potential_stock_change_logs

---

# BACKEND ARCHITECTURE

Technology:

NestJS

TypeScript

PostgreSQL

Prisma

Redis

BullMQ

OpenAI

Anthropic

Architecture:

Clean Architecture

DDD

CQRS

Repository Pattern

Service Layer

Modular Design

---

# API ENDPOINTS

GET /potential-stocks/today

GET /potential-stocks/history

GET /potential-stocks/archive

GET /potential-stocks/:ticker

GET /potential-stocks/timeline/:ticker

GET /potential-stocks/analytics

GET /potential-stocks/leaderboard

POST /potential-stocks/bookmark

DELETE /potential-stocks/bookmark/:id

POST /potential-stocks/share

POST /potential-stocks/alerts

---

# TESTING

Unit Tests

Integration Tests

API Tests

AI Agent Tests

Frontend Tests

Mobile Tests

E2E Tests

Performance Tests

---

# MONITORING

Structured Logging

Error Tracking

Performance Monitoring

AI Cost Monitoring

Cron Monitoring

Audit Logs

Analytics Dashboard

---

# FUTURE ROADMAP

Personalized Potential Stocks

Sector Potential Stocks

Dividend Hidden Gems

AI Portfolio Builder

Weekly Discoveries

Monthly Discoveries

Email Reports

Premium AI Discoveries

Multi-Market Support

Bursa Malaysia

United States

Singapore

Hong Kong

Japan

Crypto

Implement the complete feature as production-ready software using scalable architecture, reusable components, enterprise-grade coding standards, comprehensive documentation, monitoring, testing, analytics, and maintainable code structure.

