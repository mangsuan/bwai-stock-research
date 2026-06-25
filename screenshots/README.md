# Screenshots

Take 3-10 screenshots of the BWAI app using Chrome DevTools.

## How to Take Screenshots

1. Start the app:
   ```bash
   # Terminal 1 - Backend
   cd ~/Downloads/vibecode/bwai-stock-research
   source .venv/bin/activate
   uvicorn app:app --port 8000

   # Terminal 2 - Frontend
   cd ~/Downloads/vibecode/bwai-stock-research/frontend
   npm run dev
   ```

2. Open http://localhost:3000 in Chrome

3. Open Chrome DevTools (F12)

4. Set device resolution (e.g., 1440x900 for desktop)

5. Take screenshots of these pages:

## Required Screenshots

| # | Page | Filename | Description |
|---|------|----------|-------------|
| 1 | Home | `01-home.png` | Landing page with search bar |
| 2 | Research | `02-research.png` | Stock research results (e.g., AAPL) |
| 3 | Login | `03-login.png` | Login page with OAuth buttons |
| 4 | Watchlist | `04-watchlist.png` | Watchlist page with saved stocks |
| 5 | API Docs | `05-api-docs.png` | Swagger UI at /docs |

## Optional Screenshots

| # | Page | Filename | Description |
|---|------|----------|-------------|
| 6 | Register | `06-register.png` | Registration page |
| 7 | Mobile | `07-mobile.png` | Mobile view (resize browser) |
| 8 | Agent Analysis | `08-agents.png` | Individual agent analysis tabs |

## Tips

- Use consistent resolution (1440x900 recommended)
- Show real data (search for AAPL, TSLA, etc.)
- Include the full page in the screenshot
- Save as PNG format
