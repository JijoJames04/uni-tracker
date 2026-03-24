# 📊 UniTracker — Development Progress

> **Last Updated:** 2026-03-24  
> **Total Features:** 38 completed + 19 new features planned

## Status Legend
- ✅ Complete
- 🔄 In Progress  
- ⏳ Pending
- ❌ Blocked
- 🆕 New (Planned)

---

## Phase 1: Foundation ✅

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Project structure | ✅ | Monorepo layout |
| 2 | plan.md created | ✅ | |
| 3 | progress.md created | ✅ | |
| 4 | skills.md created | ✅ | |
| 5 | Docker Compose (prod) | ✅ | Multi-stage |
| 6 | Docker Compose (dev) | ✅ | Hot-reload |
| 7 | Nginx config | ✅ | HTTPS + security headers |
| 8 | Prisma schema | ✅ | Full schema defined |
| 9 | NestJS bootstrap | ✅ | |
| 10 | Next.js bootstrap | ✅ | App Router |
| 11 | Tailwind + shadcn setup | ✅ | |

## Phase 2: Backend Modules ✅

| # | Task | Status | Notes |
|---|------|--------|-------|
| 12 | Universities module (CRUD) | ✅ | |
| 13 | Applications module | ✅ | |
| 14 | Documents module (upload) | ✅ | |
| 15 | Scraper service | ✅ | Puppeteer + Cheerio |
| 16 | SOP Prompt generator | ✅ | |
| 17 | Timeline module | ✅ | |
| 18 | Profile module | ✅ | |
| 19 | Swagger docs | ✅ | /api/docs |

## Phase 3: Frontend Pages ✅

| # | Task | Status | Notes |
|---|------|--------|-------|
| 20 | Root layout + sidebar | ✅ | |
| 21 | Dashboard overview | ✅ | Stats + widgets |
| 22 | Applications list page | ✅ | Kanban + List view |
| 23 | Application detail page | ✅ | Full detail |
| 24 | URL Parser component | ✅ | Auto-populate form |
| 25 | Calendar page | ✅ | Deadlines marked |
| 26 | Documents vault | ✅ | |
| 27 | Profile page | ✅ | |
| 28 | SOP Prompt generator | ✅ | |
| 29 | Timeline component | ✅ | |
| 30 | Mobile responsive | ✅ | All breakpoints |
| 31 | Animations (Framer) | ✅ | |

## Phase 4: Production ✅

| # | Task | Status | Notes |
|---|------|--------|-------|
| 32 | Multi-stage Dockerfile | ✅ | |
| 33 | Nginx HTTPS config | ✅ | TLS 1.2/1.3 |
| 34 | Self-signed SSL cert | ✅ | Dev only |
| 35 | Security headers | ✅ | HSTS, CSP, etc. |
| 36 | Non-root Docker user | ✅ | |
| 37 | Health checks | ✅ | |
| 38 | .dockerignore | ✅ | |
| 39 | SEO meta tags | ✅ | |

---

## Phase 5: 🆕 DevOps & Project Management

| # | Feature | Status | Priority | Notes |
|---|---------|--------|----------|-------|
| F01 | **Beads — Dependency-Aware Task Tracking** | 🆕 | 🔴 High | Integrate [Beads](https://beads.dev/) open-source git-backed visual tracker. Give agents granular, dependency-aware tasks that persist across sessions. Visualize task graphs and track completion. |
| F16 | **CI/CD Pipeline (GitHub → Vercel)** | 🆕 | 🔴 High | GitHub Actions for PR checks, build validation, Vercel auto-deploy, error checking, security scanning (ESLint, Snyk/Trivy), branch protection rules. |
| F17 | **Git Workflow & Feature Rules** | 🆕 | 🔴 High | Documented rules for new feature branches, progress tracking through git commits, mandatory `git pull` before push, conventional commits, PR templates, branch naming conventions. |

---

## Phase 6: 🆕 University Data & Parsing Enhancements

| # | Feature | Status | Priority | Notes |
|---|---------|--------|----------|-------|
| F02 | **University Location on Map** | 🆕 | 🟡 Medium | Embed interactive map (Leaflet/Google Maps) showing university location. Geocode from parsed address data. |
| F03 | **Official Links & Accurate Logo Parsing** | 🆕 | 🔴 High | Parse & display: official website, official LinkedIn, official Instagram. Ensure accurate university logo extraction. Support English language, parse all public + private German university links. |
| F07 | **University Finder Resource Links** | 🆕 | 🟡 Medium | Curated links to [DAAD](https://www.daad.de/en/) and [MyGermanUniversity](https://www.mygermanuniversity.com) with usage instructions and tips for each platform. |
| F08 | **Sorting by Global Ranking** | 🆕 | 🟡 Medium | Sort courses and universities by global ranking (QS/THE/ARWU). Display ranking badges. Allow multi-criteria sort. |
| F09 | **Dorm & Accommodation Facility** | 🆕 | 🟡 Medium | University Studentenwerk contact details, dorms availability. Nearby accommodation search (WG-Gesucht, Studierendenwerk links). |

---

## Phase 7: 🆕 Smart Prompt System

| # | Feature | Status | Priority | Notes |
|---|---------|--------|----------|-------|
| F04 | **Reorganized Prompt with Mandatory/Optional Fields** | 🆕 | 🔴 High | **Mandatory fields:** Name, Studies (degree), Course to apply, Intake details, University, Motivation. **Optional fields:** TOEFL score, German language level, GRE, Work experience, Publications, etc. Prompt reorganizes dynamically based on filled fields. |
| F05 | **Direct Links to AI Platforms** | 🆕 | 🟡 Medium | One-click copy-to-clipboard links to [ChatGPT](https://chat.openai.com), [Claude](https://claude.ai), [Gemini](https://gemini.google.com) with official logos. Open in new tab for easy prompt pasting. |
| F06 | **High-Quality Adaptive Prompt Generation** | 🆕 | 🔴 High | Generate polished, well-structured SOP/Motivation Letter prompts. Gracefully handle missing optional fields — adjust prompt tone and content accordingly. Include field-specific prompt sections. |
| F15 | **LOR Prompt Creator** | 🆕 | 🟡 Medium | Letter of Recommendation prompt generator. Input recommender details, relationship, achievements. Generate structured LOR request prompts for AI platforms. |

---

## Phase 8: 🆕 Application & Document Management

| # | Feature | Status | Priority | Notes |
|---|---------|--------|----------|-------|
| F11 | **Document Upload, Zip & Download** | 🆕 | 🟡 Medium | Upload all required documents per application. Option to zip all documents together. Download zip to PC. Per-application document organization. |
| F13 | **Direct University Application with Prefill** | 🆕 | 🟡 Medium | Link to university application portal. Prefill profile info & documents. Also support [uni-assist](https://www.uni-assist.de/) with proper field mapping and error-free auto-fill. |
| F14 | **Intake Selection & Planning** | 🆕 | 🔴 High | Select which intake (WS/SS) per application. Plan and track per-intake timeline. Sort applications by intake. Same university + course at different intakes = **separate entries** (not duplicate). |

---

## Phase 9: 🆕 Visa & APS Preparation

| # | Feature | Status | Priority | Notes |
|---|---------|--------|----------|-------|
| F10 | **APS Document Preparation Guide** | 🆕 | 🔴 High | Checklist of required APS documents sourced from official Indian APS website. Office address: *Academic Evaluation Centre, Gate No. 3, DLTA Complex, R.K. Khanna Stadium, 1 Africa Avenue, 110029 New Delhi, India*. Where to send documents. Nearest DHL facility on map based on user location + contact numbers. |
| F12 | **Visa Application Steps & Links** | 🆕 | 🔴 High | Step-by-step guide for German student visa process. Direct link to [VFS Global](https://www.vfsglobal.com/germany/india/) / German Embassy visa appointment portal. Document checklist for visa. Processing timeline. |

---

## Phase 10: 🆕 Financial Tools

| # | Feature | Status | Priority | Notes |
|---|---------|--------|----------|-------|
| F18 | **Blocked Account Calculator (EUR → INR)** | 🆕 | 🟡 Medium | Real-time currency conversion EUR → INR. Official required blocked account amount (~€11,208/year as of 2024, auto-update from official source). Calculate total in INR. Link to blocked account providers (Expatrio, Fintiba, Deutsche Bank). |
| F19 | **EUR to INR Currency Graph (1 Year)** | 🆕 | 🟡 Medium | Interactive line chart showing EUR/INR exchange rate over the past 12 months. Powered by free exchange rate API (e.g., exchangerate.host, frankfurter.app). Highlight best/worst rates. |

---

## 📈 Progress Summary

| Phase | Total | Complete | Remaining | Progress |
|-------|-------|----------|-----------|----------|
| Phase 1: Foundation | 11 | 11 | 0 | ██████████ 100% |
| Phase 2: Backend Modules | 8 | 8 | 0 | ██████████ 100% |
| Phase 3: Frontend Pages | 12 | 12 | 0 | ██████████ 100% |
| Phase 4: Production | 8 | 8 | 0 | ██████████ 100% |
| Phase 5: DevOps & PM | 3 | 0 | 3 | ░░░░░░░░░░ 0% |
| Phase 6: University Data | 5 | 0 | 5 | ░░░░░░░░░░ 0% |
| Phase 7: Smart Prompts | 4 | 0 | 4 | ░░░░░░░░░░ 0% |
| Phase 8: App & Docs Mgmt | 3 | 0 | 3 | ░░░░░░░░░░ 0% |
| Phase 9: Visa & APS | 2 | 0 | 2 | ░░░░░░░░░░ 0% |
| Phase 10: Financial Tools | 2 | 0 | 2 | ░░░░░░░░░░ 0% |
| **TOTAL** | **58** | **39** | **19** | **█████░░░░░ 67%** |

---

## 🗺️ Feature Dependency Map

```
F01 (Beads Task Tracker)
 └── All features tracked through Beads

F16 (CI/CD) ──→ F17 (Git Rules)
 └── Must be set up before feature development begins

F03 (Logo & Links Parsing) ──→ F02 (Map Location)
                            ──→ F08 (Ranking Sort)
                            ──→ F09 (Dorm Facility)

F04 (Mandatory/Optional Fields) ──→ F06 (Adaptive Prompts)
                                ──→ F15 (LOR Prompts)
                                ──→ F05 (AI Platform Links)

F14 (Intake Selection) ──→ F13 (Prefill Applications)

F11 (Document Upload/Zip) ──→ F10 (APS Docs)
                          ──→ F12 (Visa Steps)
                          ──→ F13 (Prefill Applications)

F18 (Blocked Account Calc) ──→ F19 (Currency Graph)
```

---

## 🏷️ Recommended Implementation Order

| Order | Feature ID | Feature Name | Reason |
|-------|-----------|--------------|--------|
| 1 | F16 | CI/CD Pipeline | Infrastructure first — all future work benefits |
| 2 | F17 | Git Workflow Rules | Establish process before feature branches |
| 3 | F01 | Beads Task Tracker | Track all subsequent features with dependencies |
| 4 | F03 | Official Links & Logo | Core data parsing improvement — many features depend on it |
| 5 | F04 | Mandatory/Optional Fields | Prompt system foundation |
| 6 | F06 | Adaptive Prompt Generation | Builds on F04 |
| 7 | F14 | Intake Selection & Planning | Core application management enhancement |
| 8 | F02 | University Map Location | Enhances university view |
| 9 | F05 | AI Platform Links | Quick win, enhances prompt page |
| 10 | F15 | LOR Prompt Creator | Extends prompt system |
| 11 | F08 | Global Ranking Sort | Data enrichment |
| 12 | F07 | University Finder Links | Content/resource page |
| 13 | F09 | Dorm & Accommodation | University detail enhancement |
| 14 | F11 | Document Upload & Zip | Document management upgrade |
| 15 | F10 | APS Preparation Guide | India-specific visa prep |
| 16 | F12 | Visa Application Steps | Visa process guide |
| 17 | F13 | Direct Apply & Prefill | Advanced integration |
| 18 | F18 | Blocked Account Calculator | Financial tool |
| 19 | F19 | EUR/INR Currency Graph | Financial visualization |

---

## Changelog

### v2.0.0 — Feature Roadmap Update (2026-03-24)
- Added 19 new features across 6 new phases (Phase 5–10)
- Features organized by domain: DevOps, University Data, Prompts, Documents, Visa/APS, Finance
- Added feature dependency map
- Added recommended implementation order
- Added progress summary dashboard

### v1.0.0 — Initial Release
- Full project scaffolded
- All Docker configs
- Complete Prisma schema
- All API endpoints
- All frontend pages
- Animations with Framer Motion
- Mobile responsive
- HTTPS with Nginx
