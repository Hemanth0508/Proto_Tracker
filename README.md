<<<<<<< HEAD
# Agent Governance — SDLC Tracker

Mission control dashboard for the Agent Governance project. Tracks all 12 SDLC phases with persistent storage, status tracking, and notes per task.

## Deploy to Vercel (5 minutes)

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "init: agent governance tracker"
git remote add origin https://github.com/YOUR_USERNAME/agent-governance-tracker.git
git push -u origin main
```

### Step 2 — Create Upstash Redis Database
1. Go to [upstash.com](https://upstash.com) → sign up free
2. Click **Create Database** → name it `agent-governance`
3. Choose a region close to you
4. Go to the database → **REST API** tab
5. Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
6. In Vercel: your project → **Settings** → **Environment Variables** → add both

### Step 3 — Deploy
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repo
3. Click **Deploy** — done

Your tracker is live at `your-project.vercel.app`

---

## Local Development

```bash
npm install
cp .env.example .env.local
# Add your KV credentials to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Features

- 12 SDLC phases, fully nested with sub-tasks
- Per-task status: Not Started / In Progress / Done
- ✏️ Notes per task — click the edit icon
- Progress bars per phase with glow effects
- Overall progress hero with live stats
- All data persists in Vercel KV — survives browser close, device switch, sharing
- Shareable URL — anyone with the link sees current state

---

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Vercel KV (Redis-backed persistent storage)
=======
# Prototype_Tracker
>>>>>>> d8831e0b2eda17cc4ac51f7c6f611aa05ef8822c
"# Prototype_Tracker" 
