# Screenshots

Take 8 screenshots of the BWAI app using Chrome DevTools.

## How to Take Screenshots

1. Start the app:
   ```bash
   # Terminal 1 - Backend
   cd ~/Downloads/vibecode/bwai-stock-research
   .venv/bin/uvicorn app:app --port 8000

   # Terminal 2 - Frontend
   cd ~/Downloads/vibecode/bwai-stock-research/frontend
   npm run dev
   ```

2. Open http://localhost:3000 in Chrome

3. Open Chrome DevTools (F12)

4. Set device resolution:
   - Desktop: 1280×800
   - Mobile: 390×844

5. Take screenshots of these pages:

## Required Screenshots

| # | Page | Filename | Resolution | Description |
|---|------|----------|------------|-------------|
| 1 | Home | `01-home.png` | 1280×800 | Landing page with search bar |
| 2 | Research | `02-research.png` | 1280×800 | Stock research results (search AAPL) |
| 3 | Login | `03-login.png` | 1280×800 | Login page with OAuth buttons |
| 4 | Profile | `04-profile.png` | 1280×800 | Profile page with member card |
| 5 | Watchlist | `05-watchlist.png` | 1280×800 | Watchlist page with saved stocks |
| 6 | API Docs | `06-api-docs.png` | 1280×800 | Swagger UI at /docs |
| 7 | Mobile Home | `07-mobile-home.png` | 390×844 | Mobile home (resize browser) |
| 8 | Mobile Profile | `08-mobile-profile.png` | 390×844 | Mobile profile page |

## Steps to Take Each Screenshot

### 1. Home (01-home.png)
- Go to http://localhost:3000
- Set viewport to 1280×800
- Screenshot the full page

### 2. Research (02-research.png)
- Type "AAPL" in the search bar and press Enter
- Wait for results to load
- Screenshot the research results page

### 3. Login (03-login.png)
- Click "Sign In" in the navbar
- Screenshot the login page

### 4. Profile (04-profile.png)
- Register or login first
- Click your avatar in the navbar
- Screenshot the profile page with member card

### 5. Watchlist (05-watchlist.png)
- Add some stocks to watchlist first
- Click "Watchlist" in the navbar
- Screenshot the watchlist page

### 6. API Docs (06-api-docs.png)
- Go to http://localhost:8000/docs
- Screenshot the Swagger UI

### 7. Mobile Home (07-mobile-home.png)
- In Chrome DevTools, toggle device toolbar (Ctrl+Shift+M)
- Set to iPhone 14 (390×844)
- Go to http://localhost:3000
- Screenshot

### 8. Mobile Profile (08-mobile-profile.png)
- Still in mobile view
- Login and go to profile
- Screenshot the profile page

## Tips

- Use consistent resolution (1280×800 for desktop, 390×844 for mobile)
- Show real data (search for AAPL, TSLA, etc.)
- Include the full page in the screenshot
- Save as PNG format
