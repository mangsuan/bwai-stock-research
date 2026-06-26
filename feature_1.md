# Feature Request: Replace Hardcoded Stock List with Real Market Data and Watchlist Integration

## Background

This stock research application currently uses hardcoded/mock/test stock data for displaying available stocks. I want to replace the hardcoded data with real stock market data retrieved from an API.

The application should allow users to browse stocks, search stocks, and add stocks to their personal watchlist.

## Goal

Implement a new Stock Explorer feature that fetches stock information from a real API instead of using hardcoded data.

Users should be able to:

1. View a list of stocks from a real API.
2. Search stocks by company name or ticker symbol.
3. Browse stocks with pagination or infinite scrolling.
4. View basic stock information.
5. Add stocks to a personal watchlist.
6. Remove stocks from a watchlist.
7. Persist the watchlist locally (or via backend if already available).

---

## Technical Requirements

### Remove Hardcoded Data

Identify all hardcoded stock data currently used in:

* Mock data files
* Constants
* Local JSON files
* Sample arrays

Replace them with API-driven data.

---

### Stock Data Source

Use a real stock market API.

Preferred order:

1. Financial Modeling Prep (FMP)
2. Yahoo Finance
3. Alpha Vantage
4. Any free public stock API

The API should provide:

* Symbol
* Company Name
* Exchange
* Market
* Industry (if available)
* Current Price (if available)

Example:

```json
{
  "symbol": "AAPL",
  "name": "Apple Inc.",
  "exchange": "NASDAQ"
}
```

### New Screen: Stock Explorer

Create a dedicated screen called:

Stock Explorer

Features:

* Search bar
* Scrollable stock list
* Pull-to-refresh
* Loading state
* Empty state
* Error state

Each stock card should display:

* Company Name
* Stock Symbol
* Exchange
* Add to Watchlist button

Example:

Apple Inc.
AAPL
NASDAQ

[ Add to Watchlist ]

### Search Functionality

Users should be able to search by:

* Stock symbol
* Company name

Examples:

Search: Apple
→ Apple Inc. (AAPL)

Search: AAPL
→ Apple Inc. (AAPL)

Implement client-side filtering initially.

If API supports search endpoints, use server-side search.

### Watchlist Feature

Create watchlist management.

Requirements:

Add Stock

* User taps Add to Watchlist
* Stock saved into watchlist
* Show success feedback

Remove Stock

* User can remove stock from watchlist

Prevent Duplicates

* Same stock cannot be added twice

### Watchlist Screen

Display:

* Symbol
* Company Name
* Exchange

Allow:

* Open stock details
* Remove from watchlist

### State Management

Use existing project architecture.

If Zustand exists:

* Use Zustand

If Redux exists:

* Use Redux

Otherwise:

* Use React Context

Avoid introducing unnecessary state libraries.

### Data Persistence

If backend exists:

* Save watchlist through backend API

Otherwise:

* Save watchlist using AsyncStorage

Watchlist should remain after app restart.

### Performance Requirements

Implement:

* Pagination
  or
* Infinite Scroll

Avoid loading thousands of stocks into memory at once.

The application should remain responsive when displaying large stock lists.

### UI/UX Requirements

Provide:

* Loading spinner
* Empty state
* Error state
* Pull to refresh

Use existing design system and styling.

Maintain visual consistency with current application.

### Code Quality

Follow existing project structure.

Requirements:

* Reusable components
* TypeScript types/interfaces
* Proper error handling
* Clean architecture
* No hardcoded stock data

### Deliverables

1. Stock Explorer screen
2. API integration service
3. Search functionality
4. Watchlist functionality
5. Persistent storage
6. Updated navigation
7. Updated documentation

### Acceptance Criteria

* No hardcoded stock list remains.
* Stock list loads from a real API.
* User can search stocks.
* User can browse stocks.
* User can add stocks to watchlist.
* User can remove stocks from watchlist.
* Watchlist persists after app restart.
* Duplicate watchlist entries are prevented.
* Proper loading, empty, and error states exist.
* Code compiles successfully without warnings.

Before implementing, analyze the current codebase and explain:

1. Where hardcoded stock data currently exists.
2. Which files need modification.
3. Which API source you recommend and why.
4. Proposed architecture changes.

Then implement the complete feature.

