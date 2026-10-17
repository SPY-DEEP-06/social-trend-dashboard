# Signalatlas — Social Trend Evolution Dashboard

[![CI](https://github.com/SPY-DEEP-06/social-trend-dashboard/actions/workflows/ci.yml/badge.svg)](https://github.com/SPY-DEEP-06/social-trend-dashboard/actions)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/SPY-DEEP-06/social-trend-dashboard)
[![React](https://img.shields.io/badge/React-19.2.0-blue?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.4.2-646CFF?logo=vite)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A high-performance social trend intelligence dashboard with transparent public signals, reproducible time-series analysis, evidence-grounded AI analytics, and dual-mode deployment (Local Vite Server + Vercel Edge Serverless).

---

## 🚀 Key Features

* **Real-Time Public Signal Telemetry**: Aggregates live public signals across **Hacker News**, **GitHub Search**, **Google News RSS**, and **Wikimedia Pageviews** without requiring third-party API credentials.
* **Dual Deployment Architecture**:
  * **Local Dev Server**: Runs on Vite 6 with express-like middleware endpoints (`/api/live` and `/api/analysis`).
  * **Vercel Serverless Ready**: Native ESM serverless API routes (`api/live.js` and `api/analysis.js`) with edge CDN caching (`s-maxage=180, stale-while-revalidate=600`).
* **Transparent Scoring Engine**:
  * **Current Sample Score**: Normalizes log volume against the cohort (65%) and source diversity (35%).
  * **Persisted Time-Series Contract**: Weighted model combining search growth, mention velocity, engagement, acceleration, novelty, and persistence.
* **Interactive Visualization Suite**:
  * HTML5 Canvas momentum graphs for single and comparative trend tracking across 7 time ranges (`24H`, `7D`, `30D`, `90D`, `6M`, `1Y`, `ALL`).
  * Multi-dimensional filtering across 13 categories, 4 source feeds, 5 lifecycle stages, and 3 global regions.
* **Evidence-Grounded AI Trend Intelligence**:
  * Summarizes drivers and generates 30-day outlooks using OpenAI GPT-4.
  * Resilient built-in fallback engine provides synthesis if no API key is configured.
* **Workspace & Analyst Security**:
  * Pre-configured workspaces (*Global Pulse*, *AI & Frontier Tech*, *Markets & Macro Alpha*, *Consumer & Culture Radar*) plus custom workspace creation.
  * Multiple analyst personas with PIN lock protection.

---

## ⚡ Quick Start (Local)

### Prerequisites
* **Node.js 20+**
* **npm** or **pnpm**

### Installation
```bash
# Clone the repository
git clone https://github.com/SPY-DEEP-06/social-trend-dashboard.git
cd social-trend-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit [http://localhost:5173/](http://localhost:5173/) in your browser.

---

## ☁️ Deploy to Vercel

Deploy Signalatlas directly to Vercel with zero configuration:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Deployment Steps:
1. Push your repository to **GitHub**.
2. Go to [Vercel Dashboard](https://vercel.com/new) and import your GitHub repository.
3. Vercel automatically detects the Vite framework and applies the settings in [`vercel.json`](./vercel.json).
4. *(Optional)* Add Environment Variables in Vercel Project Settings:
   * `OPENAI_API_KEY`: Your OpenAI API key (for live GPT-4 trend summaries).
   * `OPENAI_MODEL`: `gpt-4.1-mini` or `gpt-4o` (defaults to `gpt-4.1-mini`).
5. Click **Deploy**. Both the client SPA and serverless API functions (`/api/live`, `/api/analysis`) will be live instantly!

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory (refer to [`.env.example`](./.env.example)):

```ini
# Optional: OpenAI API Key for evidence-grounded trend summaries
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Default model (defaults to gpt-4.1-mini)
OPENAI_MODEL=gpt-4.1-mini
```

*Note: Without an API key, the dashboard automatically serves an evidence-grounded synthetic analysis fallback, guaranteeing 100% uptime.*

---

## 📐 Scoring Formula

### Live Sample Score ($0 \le S \le 100$)

$$S = 100 \times \left(0.65 \times \frac{\ln(1 + \text{signals})}{\ln(1 + \text{cohortMaxSignals})} + 0.35 \times \min\left(1, \frac{\text{sources}}{4}\right)\right)$$

* **Volume component (65%)**: Log-normalized mention volume relative to the highest-scoring topic in the active cohort.
* **Diversity component (35%)**: Fraction of active provider streams corroborating the signal.

---

## 🗄️ Database Architecture

PostgreSQL DDL scripts are provided in `db/`:
* [`db/migrations/001_initial_schema.sql`](./db/migrations/001_initial_schema.sql): 10 production tables (`trends`, `categories`, `snapshots`, `providers`, `source_records`, `events`, `relationships`, `forecasts`, `analyses`, `mention_aggregates`) with composite time-series indexes.
* [`db/seed_demo.sql`](./db/seed_demo.sql): 365-day sample seed dataset for testing.

To run against a PostgreSQL database:
```bash
psql "$DATABASE_URL" -f db/migrations/001_initial_schema.sql
psql "$DATABASE_URL" -f db/seed_demo.sql
```

---

## 🧪 Testing & Verification

Run the automated test suite and production build verification:

```bash
# Production bundle build
npm run build

# Edge Worker & packaging validation
npm test
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
