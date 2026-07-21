# EventHub — Ticket Booking Application & Playwright BDD Test Framework

[![Playwright Tests](https://github.com/samirjagtap4030/eventhub-playwright-ui-framework/actions/workflows/playwright.yml/badge.svg)](https://github.com/samirjagtap4030/eventhub-playwright-ui-framework/actions/workflows/playwright.yml)
[![Node.js 18+](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen?logo=node.js)](https://nodejs.org/)
[![Playwright 1.58](https://img.shields.io/badge/playwright-1.58-45ba4b?logo=playwright)](https://playwright.dev/)
[![Cucumber BDD](https://img.shields.io/badge/cucumber-BDD-23d96c?logo=cucumber)](https://cucumber.io/)
[![Docker](https://img.shields.io/badge/docker-containerized-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
![OS](https://img.shields.io/badge/OS-Windows%20%7C%20Linux%20(Docker%2FCI)-0078D6?logo=windows&logoColor=white)

A full-stack ticket booking platform built with **Next.js 14**, **Express.js**, **Prisma ORM**, and **MySQL** — with a layered **Playwright** test framework built on top of it: standalone specs → Page Object Model → Data-Driven Testing → TypeScript → Cucumber BDD, wired into **GitHub Actions CI/CD** and **Docker**.

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), Tailwind CSS, React Query v5, TypeScript |
| Backend | Node.js, Express.js, Swagger UI |
| Database | MySQL 8 via Prisma ORM |
| UI Testing | Playwright 1.58, Chromium — JS & TS versions |
| BDD | Cucumber JS 12 (`@cucumber/cucumber`) |
| CI/CD | GitHub Actions (`playwright.yml`) |
| Containerization | Docker + docker-compose |

---

## Table of Contents

- [Live Demo](#live-demo)
- [Architecture](#architecture)
- [Agentic AI Workflow](#agentic-ai-workflow)
- [ROI — Agentic AI vs Manual](#roi--agentic-ai-vs-manual)
- [Test Framework Layers](#test-framework-layers)
- [Running Tests](#running-tests)
- [Test Configuration](#test-configuration)
- [CI / CD — GitHub Actions](#ci--cd--github-actions)
- [Docker](#docker)
- [Folder Structure](#folder-structure)
- [Prerequisites](#prerequisites)
- [Quick Start (local app)](#quick-start-local-app)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Playwright Test Selectors](#playwright-test-selectors)
- [Troubleshooting](#troubleshooting)
- [Author](#author)

---

## Live Demo

The application is deployed and accessible at:

| Service | URL |
|---|---|
| Frontend | https://eventhub.rahulshettyacademy.com |
| Backend API | https://api.eventhub.rahulshettyacademy.com/api |
| Swagger UI | https://api.eventhub.rahulshettyacademy.com/api/docs |

All Playwright/Cucumber tests run against the **live frontend** — no local server is needed to run the test suite.

### Key Pages

| Page | Path | Description |
|---|---|---|
| Home | `/` | Hero section, live seat stats, featured events |
| Events listing | `/events` | Paginated cards with category/city/search filters |
| Event detail | `/events/:id` | Ticket quantity selector, booking form, confirmation card |
| My bookings | `/bookings` | All user bookings with status badges |
| Booking detail | `/bookings/:id` | Full details, refund eligibility check, cancel action |
| Admin — Events | `/admin/events` | Create, edit, delete events table |
| Admin — Bookings | `/admin/bookings` | View and cancel all bookings |

---

## Architecture

```mermaid
flowchart TD
    subgraph INPUT["INPUT — scenario design (private docs)"]
        SC["57 scenarios across the test pyramid<br/>Unit · API · Component · E2E"]
    end

    subgraph SKILLS["Agentic AI pipeline (private IP — demo on request)"]
        O["Standalone → POM → DDT → TypeScript → Cucumber BDD<br/>generated + reviewed through a private multi-agent pipeline"]
    end

    subgraph OUTPUT["OUTPUT — generated framework"]
        T1["tests/booking-management.spec.js — standalone"]
        T2["tests/*.specPO.spec.js + pageObjects/ — POM (@smoke)"]
        T3["tests/*.specPO-ddt.spec.js + utils/*.json — DDT (@regression)"]
        T4["tests/*.specPO-ddt.spec.ts + pageObjects_ts/ — TypeScript"]
        T5["features/ — Cucumber BDD (feature + steps + hooks)"]
    end

    subgraph RUN["Run anywhere"]
        NPM["npm run scripts / tags"]
        DOCKER["docker compose run --rm tests"]
        CI["GitHub Actions — playwright.yml"]
    end

    REP["Reports — Playwright HTML · cucumber-report.html · Allure · CI artifact"]

    INPUT --> SKILLS
    O --> T1
    O --> T2
    O --> T3
    O --> T4
    O --> T5
    OUTPUT --> RUN
    RUN --> REP
```

---

## Agentic AI Workflow

All five test-framework layers in this repo — Standalone → POM → Data-Driven → TypeScript → Cucumber BDD — were generated and reviewed end-to-end by a private, multi-agent AI pipeline rather than hand-written. Each layer is built from the one before it (locators are **relocated, never re-derived**; BDD steps **wire** the same page objects rather than rewriting them), and every layer goes through an automated review pass plus a run → debug → fix loop before the next one starts. **Playwright MCP** is used only to verify selectors live and debug failures — never to guess locators.

The pipeline design (skills, prompts, review criteria) is private IP — **live demo available on request**.

---

## ROI — Agentic AI vs Manual

Estimated effort for this framework (4 scenarios × 5 versions + config + CI/CD + Docker), based on typical hand-coding time for an experienced SDET vs the actual skill-driven builds:

| Deliverable | Manual (hand-coded) | Agentic AI (skills) | Saving |
|---|---|---|---|
| Standalone spec (4 scenarios, live app) | ~8 h | ~1 h | 87% |
| POM refactor (5 page classes + POManager) | ~6 h | ~45 min | 87% |
| DDT conversion (JSON dataset, 2 users) | ~3 h | ~30 min | 83% |
| TypeScript conversion (typed POM mirror) | ~4 h | ~30 min | 87% |
| Cucumber BDD (feature + steps + hooks) | ~8 h | ~1 h | 87% |
| Config + tagging + Allure + npm scripts | ~2 h | ~20 min | 83% |
| CI/CD (GitHub Actions) + Docker (incl. WSL2/DNS debugging) | ~6 h | ~1 h | 83% |
| **Total** | **~37 h (≈ 5 days)** | **~5 h** | **~86%** |

Beyond speed: every layer is **reviewed by a dedicated review skill** (consistent standards, no reviewer fatigue), and the same pipeline is **repeatable for any new feature** at the same cost.

> Numbers are estimates for comparison, not measured timesheets.

---

## Test Framework Layers

The **Booking Management** feature is implemented in five progressive versions — each layer builds on the previous one, and all versions coexist (older versions are never deleted):

| # | Version | File | Pattern |
|---|---|---|---|
| 1 | Standalone | `tests/booking-management.spec.js` | Raw Playwright — locators inline in the test |
| 2 | POM | `tests/booking-management.specPO.spec.js` | Page Object Model via `pageObjects/` + `POManager` (`@smoke` tagged) |
| 3 | DDT | `tests/booking-management.specPO-ddt.spec.js` | Data-driven — `for...of` over `utils/booking-managementTestData.json` (`@regression` tagged) |
| 4 | TypeScript | `tests/booking-management.specPO-ddt.spec.ts` | Same DDT test converted to TS, using typed `pageObjects_ts/` |
| 5 | Cucumber BDD | `features/booking-management.feature` | Gherkin `Scenario Outline` + Examples, steps in `features/step_definitions/` |

### Covered scenarios (all 5 versions)

1. **View booking detail page** — create a booking, verify reference format, breadcrumb/header, detail sections, customer info, actions
2. **Cancel a single booking** — create, capture reference, cancel, verify removed from list
3. **Clear all bookings** — create, clear all, verify empty state
4. **Static event seat isolation** — two users in separate browser contexts; one books, the other's seat count stays unchanged (per-user seat computation)

DDT/BDD versions run each scenario for **2 test users** — 8 test executions per run.

---

## Running Tests

### Per-version scripts (Booking Management)

| Script | Runs |
|---|---|
| `npm run booking-management-pomtest` | POM version (`.specPO.spec.js`) |
| `npm run booking-management-pomtest-ddt` | DDT version (`.specPO-ddt.spec.js`) |
| `npm run booking-management-pomtest-ddt-ts` | TypeScript DDT version (`.specPO-ddt.spec.ts`) |
| `npm run booking-management-cucumber` | Cucumber BDD feature → `cucumber-report.html` |

### Tag-based scripts (global)

| Script | Runs |
|---|---|
| `npm run smoke` | All `@smoke`-tagged Playwright tests (POM versions) |
| `npm run regression` | All `@regression`-tagged Playwright tests (**both** JS and TS DDT versions — same tag by design; use the file scripts above to run one version alone) |

### General

| Script | Runs |
|---|---|
| `npm run test` | All Playwright tests in `tests/` (headless Chromium) |
| `npm run test:ui` | Interactive Playwright UI mode |
| `npm run test:report` | Open last Playwright HTML report |
| `npm run test:bdd` | All Cucumber features (`cucumber-js`) |

### Docker (no local Node/browsers needed)

```bash
docker compose run --rm tests
```

Builds the image (first run) and executes the full Playwright suite inside the container; the HTML report lands in `playwright-report/` on the host. See [Docker](#docker).

---

## Test Configuration

`playwright.config.ts` (the values below are deliberate — several are Docker/live-server fixes):

| Setting | Value | Why |
|---|---|---|
| Base URL | `https://eventhub.rahulshettyacademy.com` | Live app — no local server needed |
| `testDir` | `./tests` | |
| `timeout` / `expect.timeout` | 30 000 ms / 10 000 ms | |
| `workers` / `fullyParallel` | `1` / `false` | Live shared server drops concurrent connections |
| Retries | 0 | |
| Browser | Chromium (Desktop Chrome), headless | |
| Screenshot | On failure only | |
| Video | `off` | Video recording stalls Chromium inside Docker/WSL2 |
| Reporter | HTML (`playwright-report/`) | |

A second config, `playwright.config1.js`, demonstrates a custom-config setup (multi-browser `projects` array) — run it explicitly with `--config playwright.config1.js`.

Allure reporting (`allure-playwright` + `allure-commandline`) is installed; results/reports go to `allure-results/` and `allure-report/`.

---

## CI / CD — GitHub Actions

One workflow: `.github/workflows/playwright.yml`

| Aspect | Detail |
|---|---|
| Triggers | Push to `main` + manual `workflow_dispatch` |
| Concurrency | Per-branch group with `cancel-in-progress` — a new push cancels the running job |
| Runtime | `ubuntu-latest`, Node 24, npm cache, 30-min job timeout |
| Steps | `npm ci` → `npx playwright install --with-deps chromium` → `npx playwright test` |
| Report | HTML report uploaded as artifact (`playwright-report-<run_id>`) with `if: always()` — uploads even on failure, retained 30 days |

Pushing to `main` automatically triggers the workflow; results and the report artifact appear under the repo's **Actions** tab.

### CI run — all tests green

![CI run — 24 passed on GitHub Actions](docs/screenshots/ci-run-passed.png)

---

## Docker

Three files containerize the test suite so anyone can clone the repo and run tests with a single command — no Node, browsers, or dependencies installed locally:

| File | Purpose |
|---|---|
| `Dockerfile` | `mcr.microsoft.com/playwright:v1.58.2-noble` (version **pinned** to `@playwright/test`), `npm ci --ignore-scripts` (skips re-downloading browsers the image already has), copies only test-relevant files |
| `docker-compose.yml` | `ipc: host` (Chromium shared memory), Google DNS + IPv6 disabled (WSL2/Chromium fixes), volume mounts so `playwright-report/` and `test-results/` land on the host |
| `.dockerignore` | Excludes `node_modules/`, `frontend/`, `backend/`, reports, `.git/`, `.claude/` — keeps the image small |

```bash
docker compose run --rm tests
```

---

## Folder Structure

```
eventhub-playwright-ui-framework/
├── package.json                ← Root scripts (app + all test scripts)
├── playwright.config.ts        ← Main Playwright config (live baseURL, workers 1, video off)
├── playwright.config1.js       ← Custom-config demo (projects array)
├── cucumber.js                 ← Cucumber config (feature paths, progress-bar format)
├── Dockerfile                  ← Playwright image, version-pinned
├── docker-compose.yml          ← ipc/dns/volume config — `docker compose run --rm tests`
├── .dockerignore
│
├── .github/workflows/
│   └── playwright.yml          ← CI: push to main → run tests → upload HTML report
│
├── tests/                      ← Playwright test layer (all versions coexist)
│   ├── booking-management.spec.js            ← 1. Standalone
│   ├── booking-management.specPO.spec.js     ← 2. POM (@smoke)
│   ├── booking-management.specPO-ddt.spec.js ← 3. DDT (@regression)
│   └── booking-management.specPO-ddt.spec.ts ← 4. TypeScript DDT (@regression)
│
├── pageObjects/                ← Page Object Model (JS)
│   ├── LoginPage.js
│   ├── EventsPage.js
│   ├── EventDetailPage.js
│   ├── BookingsPage.js
│   ├── BookingDetailPage.js
│   └── POManager.js            ← Single entry point — creates/returns all pages
│
├── pageObjects_ts/             ← Same POM classes converted to TypeScript
│   ├── LoginPage.ts ... BookingDetailPage.ts
│   └── POManager.ts
│
├── utils/
│   └── booking-managementTestData.json   ← DDT dataset (2 users)
│
├── features/                   ← 5. Cucumber BDD layer
│   ├── booking-management.feature        ← 4 Scenario Outlines (@regression), 2-user Examples
│   ├── step_definitions/
│   │   └── booking-managementSteps.js    ← Steps wiring the SAME pageObjects/ classes
│   └── support/
│       └── hooks.js                      ← Before/After — browser + POManager lifecycle
│
├── docs/
│   └── screenshots/            ← CI run screenshots referenced in this README
│
├── playwright-report/          ← Playwright HTML report output
├── test-results/               ← Screenshots on failure
├── allure-results/ allure-report/  ← Allure output (optional reporter)
├── cucumber-report.html        ← BDD run output
│
├── backend/                    ← Express + Prisma API (see Quick Start)
└── frontend/                   ← Next.js 14 app (see Quick Start)
```

---

## Prerequisites

To **run the test suite**: Node.js 18+ and npm — or just Docker (nothing else needed).

To **run the app locally** (optional — tests target the live site):

- **Node.js 18+**
- **MySQL 8+** running locally (or a remote instance)

---

## Quick Start (local app)

> Optional — the test suite targets the live deployment and does not need a local server.

### 1. Clone the repository

```bash
git clone https://github.com/samirjagtap4030/eventhub-playwright-ui-framework.git
cd eventhub-playwright-ui-framework
```

### 2. Install dependencies

```bash
npm run setup
```

This installs npm packages in both `/backend` and `/frontend`. For the test framework itself, run `npm install` at the root.

### 3. Create the MySQL database

```bash
mysql -u root -p -e "CREATE DATABASE eventhub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 4. Configure environment variables

**Backend** — create `/backend/.env`:

```env
DATABASE_URL="mysql://root:your_password@localhost:3306/eventhub"
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=your_jwt_secret_here
```

**Frontend** — create `/frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 5. Push the database schema

```bash
npm run db:push
```

> For a migration-based workflow, run `npm run migrate` instead (interactive).

### 6. Seed the database

```bash
npm run seed
```

### 7. Start both servers

```bash
npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001 |
| Swagger UI | http://localhost:3001/api/docs |

---

## Authentication

All API endpoints (except `/auth/register` and `/auth/login`) require a **JWT Bearer token**.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Create a new user account |
| `POST` | `/auth/login` | Returns a JWT token + user object |
| `GET` | `/auth/me` | Returns the current authenticated user |

```
Authorization: Bearer <token>
```

UI tests log in through the login page (via `LoginPage` page object) with the test users defined in `utils/booking-managementTestData.json` / the feature file's Examples tables.

---

## API Endpoints

Base URL (local): `http://localhost:3001` · Live: `https://api.eventhub.rahulshettyacademy.com`

### Health

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Returns API status + DB connection status |

### Events

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/events` | List events (paginated, filterable by `category`, `city`, `search`, `page`, `limit`) |
| `GET` | `/api/events/:id` | Get a single event by ID |
| `POST` | `/api/events` | Create a new event |
| `PUT` | `/api/events/:id` | Update an existing event |
| `DELETE` | `/api/events/:id` | Delete an event (cascades bookings) |

### Bookings

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/bookings` | List bookings (paginated, filterable by status) |
| `GET` | `/api/bookings/:id` | Get booking by ID |
| `GET` | `/api/bookings/ref/:ref` | Get booking by reference code (e.g. `EVT-A3B2C1`) |
| `POST` | `/api/bookings` | Create a booking (atomically decrements seats) |
| `DELETE` | `/api/bookings/:id` | Cancel a booking (atomically restores seats) |

### Key Data Rules

| Rule | Detail |
|---|---|
| `isStatic` events | Admin-seeded; seats never decrement globally; never deletable; visible to all users |
| Seat availability | Computed as `totalSeats − sum(user's own bookings)` **per user** — the basis of the "seat isolation" test scenario |
| Dynamic events | User-owned; visible only to the creating user; max 6 per user (FIFO pruned) |
| FIFO pruning | Max 9 bookings per user — oldest deleted on the 10th create |
| Booking reference | Format `EVT-XXXXXX` (alphanumeric), unique in DB |

---

## Playwright Test Selectors

Key UI elements have `data-testid` attributes used by the page objects:

| `data-testid` | Element |
|---|---|
| `event-card` | Each event card in listings |
| `book-now-btn` | "Book Now" link on event card |
| `quantity-input` | Ticket quantity display in booking form |
| `customer-name` / `customer-email` / `customer-phone` | Booking form fields |
| `confirm-booking-btn` | Submit booking button |
| `booking-ref` | Booking reference shown on confirmation |
| `booking-card` | Each booking card in my bookings list |
| `cancel-booking-btn` | Cancel booking button |
| `confirm-dialog-yes` | Confirm button in any confirmation dialog |
| `nav-events` / `nav-bookings` | Navbar links |

All selector usage lives in `pageObjects/` (and its TS mirror `pageObjects_ts/`) — tests never touch raw locators (POM versions onwards).

---

## Troubleshooting

### Playwright tests fail with `net::ERR_CONNECTION_REFUSED`

The tests target `https://eventhub.rahulshettyacademy.com` (see `playwright.config.ts`) — they do **not** require a local server. Check your internet connection or confirm the live site is reachable.

### `@regression` runs double the expected count

By design: the JS DDT test and its TS conversion carry the same `@regression` tags, so `npm run regression` runs both. Use `npm run booking-management-pomtest-ddt` (JS only) or `npm run booking-management-pomtest-ddt-ts` (TS only) to run one version.

### Docker: element visible but click/wait times out

Keep `video: 'off'` in `playwright.config.ts` — video recording stalls Chromium rendering inside Docker/WSL2. `socket hang up` errors → keep `workers: 1`. DNS failures (`EAI_AGAIN`) → the Google DNS entries in `docker-compose.yml` handle it.

### Cucumber BDD tests can't find step definitions

Run from the project root: `npm run test:bdd` (or `npm run booking-management-cucumber` for the HTML report). Steps live in `features/step_definitions/`, hooks in `features/support/hooks.js`.

### Local app: database won't connect / port in use / seed duplicate-key

- MySQL running? `mysqladmin -u root -p status`; `DATABASE_URL` in `/backend/.env` correct?
- Port busy: `netstat -ano | findstr :3001` → `taskkill /PID <pid> /F` (repeat for 3000)
- Re-seed: drop + recreate the `eventhub` database, then `npm run db:push && npm run seed`

---

## Author

**Samir Jagtap** — [github.com/samirjagtap4030](https://github.com/samirjagtap4030)
