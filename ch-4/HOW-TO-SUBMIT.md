# Chapter 4 — How to Submit (Personal Project)

> 🇲🇲 မြန်မာဘာသာ — [HOW-TO-SUBMIT-my.md](./HOW-TO-SUBMIT-my.md)

Chapter 4 your project becomes a **real thing people can open**. You ship it, give it a
proper license, show it with screenshots, and make one short intro slide deck.

Follow the steps in order. Each step is small.

---

## Two repos you use (important!)

You work with **two** different repos this chapter — don't mix them up:

| Repo | What goes here | Steps |
|---|---|---|
| **Your own repo** (your GitHub account) | the project + LICENSE + screenshots + slides | **Steps 1–4** |
| **Team repo** (private `team-NN`) | only your `report.md` | **Step 5** |

**First time with GitHub?** Don't worry:
- A "repo" is just a project folder on GitHub.
- Make your own: [github.com](https://github.com) → **New** (green button) → name it → **Create repository**.
- "**Commit**" = save a change. "**Push**" = upload your saved changes to GitHub.
- Stuck on a git command? Paste it to Claude and ask what it does, or ask in your team channel.

---

## What you need to finish (the checklist)

1. ✅ A project in **your own** GitHub repo
2. ✅ A **live URL** (web link) or a **download URL** (apk / zip / release)
3. ✅ A **LICENSE** file in your repo (pick a real one)
4. ✅ **3 / 5 / 10 screenshots** of your project, inside your repo
5. ✅ A short **product-intro slide deck** (file inside your repo)
6. ✅ A filled-in `report.md` in your team repo
7. ✅ `doctor.sh ch-4` shows all green

---

> **Steps 1–4 all happen in YOUR OWN repo.**

## Step 1 — Ship it (live or download URL)

- Make your project openable by someone else.
  - **Web:** deploy it (GitHub Pages, Netlify, Vercel, etc.) → you get a live link.
  - **App / tool:** publish a release / apk / zip → you get a download link.
-  It just has to **open and do one real thing**.

## Step 2 — Add a LICENSE

- Add a `LICENSE` file to your repo (GitHub: *Add file → Create new file → type `LICENSE` → "Choose a license template"*).
- Not sure? **MIT** is a safe, simple default.
- Write the same license name in your `report.md`.

## Step 3 — Take screenshots

- Capture **3, 5, or 10** screenshots that show your project working.
- **Use Chrome DevTools MCP** to capture at a **fixed resolution** so they look clean and consistent:
  - desktop **1280×800**, mobile **390×844** (note which you used in the report).
  - Ask Claude: *"use chrome-devtools mcp, set viewport to 1280×800, open <url>, take a screenshot."*
- Put the image files **inside your repo** (e.g. a `screenshots/` folder).
- In `report.md`, link them with markdown image syntax:

  ```markdown
  ![home screen](screenshots/01.png)
  ![main feature](screenshots/02.png)
  ![result page](screenshots/03.png)
  ```

  The image **path must exist** in your repo, or the picture won't show.

## Step 4 — Make a product-intro slide deck

- A short deck that introduces your product: what it is, who it's for, what it does.
- Use Marp (or any tool). Put the slide file **inside your project repo**, e.g. `slides/intro.md`.
- Need a starting point? Grab a ready theme: **github.com/vibe-code-tours/marp-templates**
  (or run `vibe-code-tours guide marp`).
- (You may reuse and polish your earlier slides — no need to start from zero.)

> **Step 5 happens in the TEAM repo** (`team-NN`) — not your own repo.
> The team repo is private — **don't fork it**. You clone it, make a branch, and open a PR.

## Step 5 — Write your report in the team repo

**5a. Make the report file.**
- In the **team repo**, copy `_TEMPLATE.md` to `ch-4/<your-github-username>/report.md`.
- Fill every section: repo URL, live/download URL, license, slides path, screenshots.
- The slides path is a **path inside your own repo** (like `slides/intro.md`), not a long `https://` link.

**5b. Push it with git** (copy these, change `yourname`):

```bash
# 1. get the latest (so you don't overwrite teammates' work)
git checkout main
git pull

# 2. make your own branch — naming:  <yourname>/ch-4
git checkout -b yourname/ch-4

# 3. save (commit) your report
git add ch-4/yourname/report.md
git commit -m "ch-4: yourname report"

# 4. upload (push) your branch
git push -u origin yourname/ch-4

# 5. open a Pull Request on GitHub → a teammate/instructor reviews → merge
```

> If a teammate merged before you: `git checkout main && git pull`, then
> `git merge main` into your branch (or `git rebase main`) and push again.

## Step 6 — Check yourself with doctor.sh

Before you submit, run the self-check from a terminal:

```bash
bash doctor.sh ch-4
```

It checks your report + your repo (live URL, license, screenshots, slides).
Fix any red ❌ lines, then run it again until everything is green ✅.

## Step 7 — Submit in Discord

- Post in your `#ch-4` channel that you're done (paste your live link + repo link).
- An instructor reacts ✅ → you unlock the next chapter.

---

### Common mistakes

- **No live/download link** → deploy it or publish a release. It must open for someone else.
- **No LICENSE file** → add one (MIT is fine). License name in the report must match the file.
- **Broken screenshot** → the image path in the report must match a real file in your repo.
- **Slides as a full URL** → use the file path inside your repo instead (`slides/intro.md`).

Stuck? Ask in your team channel. That's what it's for.
