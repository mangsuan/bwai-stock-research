# AI Stock Research Platform - Membership-Based Multi-Agent Analysis

## Overview

Enhance the existing stock research platform to support multiple specialized AI agents. The number of AI agents available for stock analysis should depend on the user's subscription tier.

The goal is to create a premium AI-powered stock research experience where higher-tier users receive deeper and more comprehensive analysis through additional AI agents.

---

# Business Objectives

1. Increase subscription conversion through premium AI analysis.
2. Differentiate membership tiers based on analysis depth.
3. Provide institutional-grade stock research for premium users.
4. Create a scalable architecture that supports future AI agents.
5. Build a "Potential Stocks" feature powered by multiple AI agents.

---

# Membership Tiers

## Free

* Available Agents: 1
* Daily Queries: 5
* Analysis Type: Basic

Agents:

* Fundamental Analyst

---

## Bronze

* Available Agents: 3
* Daily Queries: 20
* Analysis Type: Standard

Agents:

* Fundamental Analyst
* Technical Analyst
* News Analyst

---

## Silver

* Available Agents: 5
* Daily Queries: 50
* Analysis Type: Advanced

Agents:

* Fundamental Analyst
* Technical Analyst
* News Analyst
* Valuation Analyst
* Sentiment Analyst

---

## Gold

* Available Agents: 8
* Daily Queries: 100
* Analysis Type: Professional

Agents:

* Fundamental Analyst
* Technical Analyst
* News Analyst
* Valuation Analyst
* Sentiment Analyst
* Smart Money Analyst
* Risk Analyst
* Growth Analyst

---

## Diamond

* Available Agents: All Agents
* Unlimited Queries
* Analysis Type: Institutional

Agents:

* Fundamental Analyst
* Technical Analyst
* News Analyst
* Valuation Analyst
* Sentiment Analyst
* Smart Money Analyst
* Risk Analyst
* Growth Analyst
* Dividend Analyst
* Economic Analyst
* Competitor Analyst
* AI Coordinator

---

# AI Agent Definitions

## Fundamental Analyst

Responsibilities:

* Revenue growth analysis
* EPS analysis
* Profit margin analysis
* Debt analysis
* ROE analysis

Output:

* Score
* Summary
* Key findings

---

## Technical Analyst

Responsibilities:

* RSI
* MACD
* Moving averages
* Support and resistance
* Breakout detection

Output:

* Technical score
* Trend direction
* Buy/Sell signals

---

## Valuation Analyst

Responsibilities:

* PE Ratio
* PEG Ratio
* EV/EBITDA
* DCF analysis

Output:

* Valuation score
* Fair value estimate

---

## News Analyst

Responsibilities:

* Analyze recent news
* Earnings announcements
* Regulatory events
* Product launches

Output:

* News sentiment score
* Summary

---

## Sentiment Analyst

Responsibilities:

* Reddit sentiment
* Social media sentiment
* Community discussion trends

Output:

* Sentiment score
* Bullish/Bearish indicator

---

## Smart Money Analyst

Responsibilities:

* Insider buying
* Institutional ownership
* Hedge fund activity

Output:

* Smart money score

---

## Risk Analyst

Responsibilities:

* Debt risk
* Cash flow risk
* Bankruptcy risk
* Dilution risk

Output:

* Risk level
* Risk score

---

## Growth Analyst

Responsibilities:

* Revenue acceleration
* Industry growth
* Market opportunity

Output:

* Growth score

---

## Dividend Analyst

Responsibilities:

* Dividend yield
* Dividend growth
* Payout ratio

Output:

* Dividend score

---

## Economic Analyst

Responsibilities:

* Interest rates
* Inflation impact
* Macro environment

Output:

* Macro score

---

## Competitor Analyst

Responsibilities:

* Industry comparison
* Market share comparison
* Relative valuation

Output:

* Competitiveness score

---

## AI Coordinator

Responsibilities:

* Aggregate all agent outputs
* Calculate overall stock score
* Generate final recommendation
* Generate confidence level

Output:
{
"overall_score": 88,
"confidence": 91,
"recommendation": "BUY",
"risk": "Medium"
}

---

# Multi-Agent Workflow

User submits stock ticker.

System executes all allowed agents based on membership tier.

Example:

Diamond User:

1. Fundamental Agent
2. Technical Agent
3. Valuation Agent
4. News Agent
5. Sentiment Agent
6. Smart Money Agent
7. Risk Agent
8. Growth Agent
9. Dividend Agent
10. Economic Agent
11. Competitor Agent

All results are sent to AI Coordinator.

AI Coordinator generates final report.

---

# Database Changes

## membership_plans

Columns:

* id
* name
* max_agents
* daily_query_limit
* features
* created_at
* updated_at

---

## ai_agents

Columns:

* id
* code
* name
* description
* is_active
* created_at
* updated_at

---

## analysis_results

Columns:

* id
* user_id
* ticker
* membership_plan_id
* overall_score
* confidence
* recommendation
* risk_level
* created_at

---

## analysis_agent_results

Columns:

* id
* analysis_result_id
* agent_id
* score
* summary
* raw_response
* created_at

---

# Potential Stocks Feature

Create a new sidebar menu:

Potential Stocks

---

## Features

* Today's Potential Stocks
* Yesterday's Potential Stocks
* Last 7 Days
* Last 30 Days
* Historical Archive

---

## Daily Background Job

Every night:

1. Scan stock universe.
2. Run all AI agents.
3. Calculate scores.
4. Rank stocks.
5. Save Top 20 opportunities.

---

## potential_stocks Table

Columns:

* id
* ticker
* company_name
* score
* confidence
* recommendation
* risk_level
* reasons
* generated_date
* created_at

---

# UI Requirements

## Dashboard

Display:

* Membership Tier
* Available AI Agents
* Remaining Daily Queries
* Recent Analyses

---

## Stock Analysis Page

Display:

* Overall Score
* Confidence Score
* Recommendation
* Agent Breakdown

Accordion Sections:

* Fundamental Analysis
* Technical Analysis
* Valuation Analysis
* News Analysis
* Sentiment Analysis
* Risk Analysis
* Growth Analysis

---

## Potential Stocks Page

Display:

* Top Ranked Stocks
* AI Score
* Confidence Score
* Key Reasons
* Historical Performance

Filters:

* Date
* Industry
* Market Cap
* Score Range

---

# Performance Requirements

* Parallel AI agent execution.
* Queue-based processing.
* Retry mechanism for failed agents.
* Cache repeated analyses.
* Analysis completion under 30 seconds.
* Support 1000+ concurrent users.

---

# Future Enhancements

* Portfolio AI Advisor
* Watchlist AI Monitoring
* Real-time Alerts
* Earnings Prediction Agent
* Options Analysis Agent
* Crypto Analysis Agent
* ETF Analysis Agent
* Personalized AI Agent Selection

---

# Success Criteria

1. Users can access AI agents according to membership tier.
2. Multiple AI agents run concurrently.
3. AI Coordinator generates final stock recommendation.
4. Potential Stocks page updates daily.
5. Historical AI picks are stored permanently.
6. Subscription tiers clearly differentiate analysis quality.
7. System architecture supports adding new AI agents without major refactoring.

