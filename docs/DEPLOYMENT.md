# Miro Web-SDK Add-on — Deployment & Operations Guide

---

## 0 Purpose

Step-by-step instructions for packaging, hosting and operating the browser-based
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
| Node 24                   | Matches CI matrix                             |
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
| **LOG_LEVEL**            | runtime log verbosity (`info`, `debug`, `trace`)   |

Variables are injected at build time—no runtime secrets are required because the
add-on runs entirely in the browser.

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
steps automatically on merge to `main`. It also audits production dependencies
with `npm audit --omit=dev` and fails the build when a moderate or higher
severity vulnerability is found.

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
wired in `fenrick.miro.ux/src/infrastructure/telemetry.ts`. Details on metrics
collection sit in **ARCHITECTURE.md** (section 13).

---

## 8 Post-deployment smoke test (staging)

```
▢ Load a fresh board; sidebar icon appears.
▢ Import a sample data file (fenrick.miro.ux/tests/fixtures/kanban.csv).
▢ Verify widgets render and undo works.
▢ Switch to Dark theme; no colour regressions.
▢ Run npm run a11y:e2e – all critical checks pass.
```

If any step fails, do not promote to production.

---

## 9 CI/CD flow (summary)

```
Push → GitHub Action
        ├─ Prettier, ESLint, Stylelint, Typecheck
        ├─ dotnet format check
        ├─ Unit tests (`npm test`, `dotnet test`, parallel shards)
        ├─ Merge coverage from both suites
        ├─ Sonar build scan (dotnet-sonarscanner with dotnet test)
        ├─ CodeQL scan (JavaScript, Actions and C#)
        ├─ Build Storybook
        ├─ Build add-on bundle
        ├─ Upload artefact
        ├─ Deploy to Vercel (staging)
        ├─ Run Cypress smoke tests
        └─ Deploy to Vercel --prod (manual approval)
```

All gates and complexity budgets are defined in **ARCHITECTURE.md** (sections
4–6).

The pipeline is orchestrated by the GitHub Actions workflow in
`.github/workflows/ci.yml`. Every push or pull request triggers the jobs listed
above using Node 24. Artefacts from the build and Storybook steps are uploaded
as workflow artefacts so deployment jobs can promote the exact output. The
server pipeline uses .NET 9 for restoration, formatting and tests. Run
`npm run ci:local` to replicate the pipeline on your machine before opening a
pull request.

---

## 10 Troubleshooting tips

| Symptom            | First checks                                       |
| ------------------ | -------------------------------------------------- |
| Blank iframe       | Console 404? PUBLIC_BASE_URL mismatch              |
| Widgets not placed | Check `MIRO_APP_ID` ties to the board team         |
| Layout freeze      | Graph exceeds 5 000 nodes – layout timeout         |
| Dark-mode glitch   | Token override? Confirm colours from Design System |

## 11 Docker container

For self-hosting the static bundle as a container image:

```bash
docker build -t miro-diagramming ..
docker run --rm -p 8080:80 miro-diagramming
```

Tagged releases on GitHub automatically push the built image to GHCR via the
`docker-image` stage in `.github/workflows/ci.yml`. That job runs only when the
release job publishes a tag. The workflow targets `linux/amd64` only, so
emulation via QEMU is skipped and `docker/build-push-action@v5` sets up Buildx
automatically.

---

## 12 .NET server integration

Some teams host the React bundle alongside an ASP.NET Core API. The backend
publishes to a `publish/` directory and serves static files from the `wwwroot`
folder. The `dist/` bundle can be copied into `wwwroot` during the publish step
so front-end assets and API endpoints share the same origin.

### 12.1 Environment variables

Define these variables in the hosting environment:

| Variable                           | Purpose                                 |
| ---------------------------------- | --------------------------------------- |
| **ConnectionStrings\_\_Default**   | Database connection string              |
| **ASPNETCORE_URLS**                | HTTP bind address, e.g. `http://*:5000` |
| **APPINSIGHTS_INSTRUMENTATIONKEY** | Azure Application Insights key          |
| **JWT\_\_Issuer**                  | Token issuer for API auth               |

### 12.2 Build & publish

```bash
dotnet restore
dotnet publish -c Release -o publish --nologo
```

The `publish/` folder then contains the compiled API along with the React
`dist/` assets. Copy the directory into a container image or deploy it straight
to a platform like **Azure App Service**.

### 12.3 Containerisation and hosting

**Docker**

```bash
docker build -t miro-backend .
docker run --rm -p 5000:80 miro-backend
```

**Azure App Service**

Upload the `publish/` folder or push the container image to Azure Container
Registry and create an App Service using the **Web App for Containers** option.
Set environment variables via the Azure portal. The React bundle automatically
serves from `/wwwroot` alongside the API endpoints.

---

_End of file._
