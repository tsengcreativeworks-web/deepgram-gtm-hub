# Deepgram GTM Command Center

AI-powered go-to-market hub with 6 agents + strategy playbook, built for Deepgram.

## Quick Deploy (GitHub → Vercel)

### Step 1: Get Your Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Click **API Keys** → **Create Key**
3. Copy the key — you'll need it in Step 5

---

### Step 2: Create a GitHub Repo

1. Go to [github.com/new](https://github.com/new)
2. Name it `deepgram-gtm-hub` (or whatever you want)
3. Set to **Private** (this has your GTM strategy in it)
4. **Don't** initialize with README (we already have one)
5. Click **Create repository**

---

### Step 3: Push This Code to GitHub

Open your terminal and run:

```bash
cd deepgram-gtm-hub
git init
git add .
git commit -m "Initial commit - Deepgram GTM Hub"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/deepgram-gtm-hub.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

---

### Step 4: Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import Git Repository**
3. Select your `deepgram-gtm-hub` repo
4. Framework Preset will auto-detect **Next.js** — leave it
5. Click **Deploy**

---

### Step 5: Add Your API Key on Vercel

The agents won't work until you add your Anthropic key:

1. In your Vercel project dashboard, go to **Settings** → **Environment Variables**
2. Add:
   - **Key:** `ANTHROPIC_API_KEY`
   - **Value:** your API key from Step 1
   - **Environment:** Production (check all three if you want it in Preview/Development too)
3. Click **Save**
4. Go to **Deployments** → click the **...** menu on your latest deploy → **Redeploy**

---

### Step 6: You're Live

Your hub is now at `https://deepgram-gtm-hub.vercel.app` (or whatever Vercel assigned).

Share the URL. The agents are functional — they call Claude server-side through the `/api/generate` route, so your API key never touches the browser.

---

## Project Structure

```
deepgram-gtm-hub/
├── app/
│   ├── layout.js          # Root layout + fonts
│   ├── page.js             # Full hub (home, 6 agents, playbook)
│   └── api/
│       └── generate/
│           └── route.js    # Server-side Anthropic API proxy
├── package.json
├── next.config.js
├── .env.example
├── .gitignore
└── README.md
```

## The 6 Agents

| # | Agent | What It Does |
|---|-------|-------------|
| 01 | Outbound Sequence Generator | 5-touch personalized sequences by company/persona/pain |
| 02 | Account Research Agent | 5-dimension ICP scoring with entry strategy |
| 03 | Competitive Battle Card | Head-to-head battle cards with trap questions |
| 04 | ROI Calculator | Cost modeling with 3-year projections |
| 05 | Discovery Question Generator | Persona-specific discovery Qs with branching logic |
| 06 | Persona Pitch Builder | CTO/VP/CEO-tailored pitch narratives |

## Local Development

```bash
npm install
cp .env.example .env.local
# Add your ANTHROPIC_API_KEY to .env.local
npm run dev
```

Opens at [localhost:3000](http://localhost:3000).
