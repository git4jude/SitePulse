# SitePulse

**SitePulse** is a full-stack AI-powered SEO audit and rank tracking platform. Enter any URL to get a comprehensive SEO/performance/accessibility/best-practices audit, or track how your keywords rank on Google over time — with daily automatic re-checks.

It's a monorepo: a React + Vite frontend (`client/`) and an Express + MongoDB backend (`server/`).

## Features

### AI-Powered Website Analysis
- Enter a URL and get a full SEO audit: overall score plus four category scores (SEO, Performance, Accessibility, Best Practices)
- Pipeline: the target page is loaded in a real headless browser session (Browserbase + Playwright) to extract meta tags, headings, links, images, and word count, then that data is scored and analyzed by Google's Gemini AI against a structured schema
- Meta tag analysis (title, description, canonical, robots, Open Graph, Twitter Card, viewport, charset) with per-field pass/fail
- Heading structure breakdown (H1-H6 counts)
- Links analysis (internal/external/total) and image audit (alt-text coverage)
- Top keyword density analysis
- Issues list with severity levels (critical/warning/info), each with a specific recommendation
- Live multi-step progress UI while an analysis runs (connecting → scanning → AI analysis → report ready)

### Keyword Rank Tracking
- Track a keyword + target domain and get its current Google search ranking position (scans up to 5 pages of results)
- Competitor list — the other results ranking for that keyword
- Position history over time, with a trend chart and day-over-day change indicator
- **Daily automatic re-checks** via a scheduled cron job (6am), so ranking history builds up without manual effort
- Manual "Refresh Ranking" per keyword, plus pause/resume and delete
- Cron sync status visible on the Dashboard (last run time, keywords checked/failed)

### Dashboard
- At-a-glance stats: total scans run, scans remaining today (plan-based)
- Quick-analyze bar
- Preview of top tracked keywords and recent analyses

### History
- Full paginated list of past analyses with search, status filter, and sort (newest/oldest/score)

### Accounts & Plans
- Email/password authentication (JWT-based)
- Free plan: 5 analyses/day, enforced server-side
- Pro plan is presented on the pricing page as the intended upgrade tier, but payment/billing isn't wired up yet — no Stripe or other payment integration exists in the codebase currently

### UI/UX
- Full dark/light theme support (system-aware, manually toggleable), each mode independently designed rather than a simple color inversion
- Landing page: hero, feature highlights, "how it works", pricing, footer with real social/contact links

## Tech Stack

### Frontend (`client/`)
- **React 19** + **TypeScript**
- **Vite** — build tool / dev server
- **Tailwind CSS 4** (via `@tailwindcss/vite`)
- **React Router 7** — routing
- **Axios** — API client
- **Lucide React** + **@icons-pack/react-simple-icons** — icons
- **react-hot-toast** — notifications
- **motion**, **ogl** — animation/WebGL effects on the landing page

### Backend (`server/`)
- **Node.js** + **Express 5**
- **MongoDB** + **Mongoose**
- **JWT (jsonwebtoken)** + **bcrypt** — authentication
- **node-cron** — daily rank-tracking scheduler
- **Browserbase SDK** + **playwright-core** — cloud headless browser sessions for scraping target pages and Google search results
- **Google Gemini AI (@google/genai)** — SEO analysis/scoring
- **cors**, **dotenv**

## Project Structure

```
SEO-RANKER/
├── client/          React + Vite frontend
│   └── src/
│       ├── pages/           Dashboard, Analyze, Report, RankTracker, RankDetail, History, Login, Home
│       ├── components/      Shared UI + landing-page sections
│       └── context/         Auth (UserContext) and theme (ThemeContext) providers
└── server/          Express + MongoDB backend
    ├── controllers/  Route handlers (auth, analysis, rank tracking, cron)
    ├── models/       Mongoose schemas (User, Analysis, KeywordTracking, CronRun)
    ├── services/     Scraping (Browserbase/Playwright), Gemini AI analysis, rank checking
    ├── cron/         Daily rank-tracking scheduler
    └── routes/       Express route definitions
```

## Getting Started

### Prerequisites
- Node.js v18+
- A MongoDB database (e.g. MongoDB Atlas)
- API keys: [Browserbase](https://browserbase.com), [Google Gemini](https://ai.google.dev)

### Installation

Clone the repo, then install both apps separately:

```bash
git clone https://github.com/git4jude/SearchPulse.git
cd SearchPulse

cd client && npm install
cd ../server && npm install
```

### Environment Variables

**`server/.env`**
```
MONGODB_URI=
JWT_SECRET=
BROWSERBASE_API_KEY=
GEMINI_API_KEY=
```
`PORT` is optional (defaults to 3000). `CRON_SECRET` is optional, only used to authenticate Vercel Cron Job requests if deploying the backend to Vercel.

**`client/.env`**
```
VITE_BACKEND_URL=
```
Should point at your backend's `/api` path, e.g. `http://localhost:3000/api` for local dev.

### Running Locally

```bash
# backend (from server/)
npm run server   # nodemon, auto-reload
# or: npm start   # plain node, no auto-reload

# frontend (from client/)
npm run dev
```
