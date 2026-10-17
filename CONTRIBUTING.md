# Contributing to Signalatlas

Thank you for your interest in contributing to Signalatlas! Follow these instructions to get started.

## Quickstart

1. Fork and clone the repository:
   ```bash
   git clone https://github.com/SPY-DEEP-06/social-trend-dashboard.git
   cd social-trend-dashboard
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the local development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173/](http://localhost:5173/) in your browser.

## Project Structure

- `src/` — React frontend application and styles.
- `api/` — Vercel serverless functions (`/api/live` and `/api/analysis`).
- `server/` — Live public telemetry provider adapters (Hacker News, GitHub, News, Wikipedia).
- `scripts/` — Build and packaging scripts.
- `tests/` — Automated test suite for Sites worker.
- `db/` — PostgreSQL migrations and seed data.

## Verification

Before opening a pull request, ensure the build and tests pass:

```bash
npm run build
npm run test
```

## Adding a New Provider

To add a new public signal provider:
1. Open `server/providers.mjs`.
2. Implement an asynchronous fetch function returning records shaped as `{ title, url, date, source, metric }`.
3. Register the function in the `providers` list array.
4. Keep credential handling server-side and ensure graceful fallbacks if network requests time out.
