# Deployment Guide

## Step 1: Deploy Backend to Render

1. Go to [render.com](https://render.com) and sign up/login
2. Click **"New"** → **"Blueprint"**
3. Connect your GitHub repo: `mangsuan/bwai-stock-research`
4. Render will detect `render.yaml` and create:
   - `bwai-db` — PostgreSQL database
   - `bwai-api` — FastAPI web service
5. Click **"Apply"** to start deployment
6. After deploy, go to `bwai-api` → **Environment** and set:
   - `AI_API_KEY` = `sk-h5q-mLRLeQxUeMi_qx9w1A`
7. Copy the backend URL (e.g., `https://bwai-api.onrender.com`)

## Step 2: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repo: `mangsuan/bwai-stock-research`
4. Set **Root Directory** to `frontend`
5. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL` = `https://bwai-api.onrender.com` (your Render backend URL)
6. Click **"Deploy"**
7. Copy the frontend URL (e.g., `https://bwai.vercel.app`)

## Step 3: Update report.md

Replace the live URL in `ch-4/report.md`:
```
- **Live / download URL:** https://bwai.vercel.app
```

## Step 4: Capture Screenshots

Once deployed, capture screenshots at:
- Desktop: 1280×800
- Mobile: 390×844

Save to `screenshots/` folder.

## Step 5: Run doctor.sh

```bash
bash doctor.sh ch-4
```

## Step 6: Push to Team Repo

Push `ch-4/report.md` to your team repo:
```bash
cd /home/komang/Downloads/vibecode/team-03
git checkout main && git pull
git checkout -b mangsuan/ch-4
# Copy your report
cp /home/komang/Downloads/vibecode/bwai-stock-research/ch-4/report.md ch-4/mangsuan/report.md
git add ch-4/mangsuan/report.md
git commit -m "ch-4: mangsuan report"
git push -u origin mangsuan/ch-4
```
Then open a Pull Request on GitHub.
