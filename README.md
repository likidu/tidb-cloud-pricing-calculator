# TiDB Cloud Pricing Calculator

## Overview

A simple pricing calculator for TiDB Cloud Essential.

## Purpose

We are currently still defining the pricing model for the Next-gen TiDB Cloud. But right now, we already need a simple, internal pricing calculator based on our current RU (Request Unit) calculation algorithm to unblock the business team (sales / presales / support) who can use it to estimate the price based on the end customer's workload.

We now have a fairly simple Excel based calculator. I want to firstly convert it to a web based version which could give sales / presales a friendly UX.

## How to use it

Our sales / presales can input a few key workload metrics of the customer:

- Migration source: MySQL (RDS)
- vCPU used (e.g. Actual CPU used by mysqld if it's MySQL / RDS): either the peak and baseline values within a certain period, typically within a full cycle if it's a bursty workload (a full sine curve)
- Data size of row-based (TiKV), if it's MySQL (RDS), it is the size of all the files in MySQL's data directory

## Status

Current phrase: exploration.

## Getting Started

Prerequisites:

- Node.js >= 22
- pnpm >= 9 (`npm i -g pnpm`)

Bootstrap and run locally:

```bash
pnpm i
pnpm dev
```

Run unit tests (pricing engine):

```bash
pnpm test
```

Notes:

- This app uses Vite + React + TypeScript with Tailwind for styling.
- The core pricing math lives in `src/lib/pricing/calc.ts` and is designed to be framework-agnostic and unit tested.
- The minimal UI in `src/app.tsx` lets you tweak inputs and see live results for Starter (Serverless) and Essential totals.

## Vercel Deployment & Protection

- Build settings
  - Install: `pnpm i`
  - Build: `pnpm build`
  - Output: `dist`
  - Vercel usually auto-detects Vite. Adjust in Project → Settings → Build & Development if needed.

- Vercel Authentication (password protection)
  - In Vercel: Project → Settings → Deployment Protection (or Security) → Vercel Authentication.
  - Choose environments to protect (Preview, Production) and set Username/Password.
  - Save and redeploy. All requests (HTML, assets, API) will require Basic Auth.
  - Local dev (`pnpm dev`) is not affected.

- Tips
  - For automated tests or scripts, send an `Authorization: Basic <base64(user:pass)>` header.
  - If Vercel Authentication isn’t available on your plan, consider an Edge Function–based Basic Auth as a fallback.

### Edge Function Basic Auth (fallback)

This repo includes a code-based Basic Auth using an Edge Function when Vercel Authentication is not available.

- Files: `api/protect.ts`, `vercel.json`
- Behavior: All HTML/document requests route through `api/protect`, which enforces Basic Auth and serves `index.html`. Static assets are served directly for performance.
- Configure environment variable in Vercel Project → Settings → Environment Variables:
  - `BASIC_AUTH_PASSWORD`: password (username is not required)
- If these vars are not set, auth is bypassed (useful for local/dev).
- To protect every request including assets, switch to Vercel Authentication; full asset-level gating via code requires more complex routing and is not recommended for this static SPA.
