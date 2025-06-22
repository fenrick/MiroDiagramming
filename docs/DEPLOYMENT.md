# Miro Web-SDK Add-on — Deployment & Operations Guide

---

## 0 Purpose

Step-by-step instructions for packaging, hosting and operating the client-only
add-on. Aimed at junior engineers; every step is explicit.

---

## 1 Overview

1. Build a static bundle (`dist/`).
2. Upload the bundle to a static host that supports custom HTTP headers.
3. Register or update the **Public base URL** in Miro App Settings.
4. Smoke-test on a staging board.
5. Promote to production or roll back.

---

## 2 Prerequisites

| Requirement               | Why                                           |
| ------------------------- | --------------------------------------------- |
| Node 18 or 20             | Matches CI matrix                             |
| Miro developer team       | Needed to install staging and prod app copies |
| Static host (see options) | Serves HTML, JS, CSS with correct MIME types  |

---

## 3 Static-hosting options

| Option                            | Notes                                                          | Docs                                  |
| --------------------------------- | -------------------------------------------------------------- | ------------------------------------- |
| **Vercel**                        | Easiest zero-config deploy; free tier OK                       | vercel.com                            |
| **Netlify**                       | Drag-and-drop deploy; automatic rollbacks                      | netlify.com                           |
| **AWS Amplify / S3 + CloudFront** | Enterprise control; edge caching                               | AWS docs                              |
| **Nginx**                         | On-prem or self-managed VM; full control                       | nginx.org                             |
| **GitHub Pages**                  | _Not supported_ for Web-SDK apps (service-worker restrictions) | Miro docs ﻿([developers.miro.com][1]) |

Choose one host per environment (staging, production). All examples below use
**Vercel** CLI, but commands translate easily.

---

## 4 Environment variables & configuration

Define variables in the host’s dashboard (or `vercel env`).

| Variable                 | Purpose                                            |
| ------------------------ | -------------------------------------------------- |
| **MIRO_APP_ID**          | App identifier from Miro App Settings              |
| **PUBLIC_BASE_URL**      | Fully-qualified root URL of the deployed bundle    |
| **FEATURE_FLAG_SDK_KEY** | LaunchDarkly SDK key (client-side)                 |
| **SENTRY_DSN**           | Error-reporting endpoint                           |
| **NODE_ENV**             | build-time optimisation flag (production, staging) |

Variables are injected at build time—no runtime secrets are required because the
add-on is client-only.

---

## 5 Build & deploy steps

### 5.1 Local production build

```bash
npm ci
npm run build        # outputs dist/
```

### 5.2 First-time deploy to Vercel

```bash
vercel                       # prompts for project name
vercel env add MIRO_APP_ID
vercel env add PUBLIC_BASE_URL
vercel env add FEATURE_FLAG_SDK_KEY
vercel env add SENTRY_DSN
vercel --prod                # deploys and returns the live URL
```

Copy the returned URL into **Miro > App Settings > Redirect URL** and **Public
base URL**.

### 5.3 Subsequent deploys (CI)

```bash
npm run build
vercel deploy --prod --confirm
```

The GitHub Actions workflow in **.github/workflows/ci.yml** performs the same
steps automatically on merge to `main`.

---

## 6 Rollback procedure

1. Open Vercel dashboard, select **Deployments**.
2. Locate the previous green build for the production environment.
3. Press **Promote** – Vercel instantly updates the alias to point to that
   build.
4. In Miro, reload the board; confirm the add-on hash has changed (DevTools ›
   Network › app.js).

Rollback takes < 30 seconds and never breaks active boards.

---

## 7 Monitoring & observability

| Signal                    | Tool                  | Threshold                   |
| ------------------------- | --------------------- | --------------------------- |
| JavaScript errors         | Sentry                | Error rate < 0.5 % sessions |
| Performance (layout time) | Datadog RUM           | p95 < 400 ms                |
| Feature-flag impact       | LaunchDarkly Insights | Error delta ≤ 0             |
| Bundle size               | CI budget check       | ≤ 300 KB gzipped            |

Alerts route to the **#miro-addon-alerts** Slack channel. Instrumentation is
wired in `src/infrastructure/telemetry.ts`. Details on metrics collection sit in
**ARCHITECTURE.md** (section 13).

---

## 8 Post-deployment smoke test (staging)

```
▢ Load a fresh board; sidebar icon appears.
▢ Import a sample data file (tests/fixtures/kanban.csv).
▢ Verify widgets render and undo works.
▢ Switch to Dark theme; no colour regressions.
▢ Run npm run a11y:e2e – all critical checks pass.
```

If any step fails, do not promote to production.

---

## 9 CI/CD flow (summary)

```
Push → GitHub Action
        ├─ Lint, unit, axe, Sonar
        ├─ Build Storybook
        ├─ Build add-on bundle
        ├─ Upload artefact
        ├─ Deploy to Vercel (staging)
        ├─ Run Cypress smoke tests
        └─ Deploy to Vercel --prod (manual approval)
```

All gates and complexity budgets are defined in **ARCHITECTURE.md** (sections
4–6).

---

## 10 Troubleshooting tips

| Symptom            | First checks                                       |
| ------------------ | -------------------------------------------------- |
| Blank iframe       | Console 404? PUBLIC_BASE_URL mismatch              |
| Widgets not placed | Check `MIRO_APP_ID` ties to the board team         |
| Layout freeze      | Graph exceeds 5 000 nodes – layout timeout         |
| Dark-mode glitch   | Token override? Confirm colours from Design System |

---

_End of file._
