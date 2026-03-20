# 🎓 UniTracker — German University Application Tracker

A production-grade full-stack application for tracking German university applications, managing documents, generating SOP prompts, and monitoring deadlines — all in one beautifully designed interface.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔗 **URL Parser** | Paste any German university course URL and auto-extract course name, fees, deadline, logo, and application portal type |
| 📊 **Dashboard** | Live stats: total applications, action needed, approved/rejected, upcoming deadlines |
| 📋 **Kanban & List** | Switch between list and Kanban views for your applications |
| 📄 **Document Vault** | Upload SOP, CV, transcripts per application — with version history |
| 🤖 **SOP Prompt Generator** | Auto-generates a tailored LLM prompt using your profile + course details |
| 📅 **Calendar** | Visual calendar with application deadline markers and days-left countdowns |
| ⏱ **Timeline** | Per-application action log with date-stamped entries |
| 👤 **Profile** | Store academic background, language scores, and work experience for personalised prompts |
| 🎓 **uni-assist Detection** | Automatically detects whether a course requires uni-assist or direct application |
| 📱 **Fully Responsive** | Works beautifully on mobile, tablet, and desktop |

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Git

### 1. Clone & Configure

```bash
git clone <repo-url>
cd uni-tracker
cp .env.example .env
# Edit .env and set a strong POSTGRES_PASSWORD
```

### 2. Generate SSL Certificate (dev)

```bash
chmod +x nginx/gen-ssl.sh
./nginx/gen-ssl.sh
```

### 3. Start Development

```bash
docker compose -f docker-compose.dev.yml up --build
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- API Docs (Swagger): http://localhost:4000/api/docs
- Prisma Studio: http://localhost:5555

### 4. Production Deploy

```bash
docker compose up --build -d
```

**Access:** https://localhost (or your domain)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Nginx  :80/:443  (SSL + Proxy)              │
└──────────────┬──────────────────────────┬────────────────┘
               │                          │
        Next.js :3000              NestJS :4000
        (Frontend)                 (Backend API)
               │                          │
               └──────────────────────────┘
                              │
                      PostgreSQL :5432
```

---

## 📁 Project Structure

```
uni-tracker/
├── frontend/           # Next.js 14 App Router
│   └── src/
│       ├── app/        # Pages (dashboard, applications, etc.)
│       ├── components/ # React components
│       ├── lib/        # API client, utilities
│       └── store/      # Zustand state
│
├── backend/            # NestJS API
│   └── src/
│       ├── modules/    # Feature modules
│       └── prisma/     # Database schema
│
├── nginx/              # Reverse proxy config + SSL
├── docker-compose.yml      # Production
├── docker-compose.dev.yml  # Development
├── Dockerfile              # Frontend image
├── Dockerfile.backend      # Backend image
├── plan.md
├── progress.md
└── skills.md
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/scrape` | Scrape university course from URL |
| `POST` | `/api/v1/universities/from-url` | Add university + course from URL |
| `GET`  | `/api/v1/universities` | List all universities |
| `GET`  | `/api/v1/universities/stats` | Dashboard statistics |
| `GET`  | `/api/v1/applications` | List all applications |
| `GET`  | `/api/v1/applications/kanban` | Kanban-grouped applications |
| `PATCH`| `/api/v1/applications/:id` | Update application status |
| `POST` | `/api/v1/documents/upload/:id` | Upload document |
| `GET`  | `/api/v1/prompts/sop/:id` | Generate SOP prompt |
| `GET`  | `/api/v1/calendar` | Get all calendar events |
| `GET`  | `/api/v1/profile` | Get user profile |

Full interactive docs: `http://localhost:4000/api/docs`

---

## 🔐 Security

- Non-root Docker users in all containers
- Nginx security headers (HSTS, CSP, X-Frame-Options, etc.)
- TLS 1.2/1.3 only
- Rate limiting on API and scraper endpoints
- Input validation via Zod (frontend) and class-validator (backend)
- File upload validation (type + size limits)
- Environment variable secrets (no hardcoded credentials)

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend**: NestJS, TypeScript, Prisma, PostgreSQL
- **Scraping**: Cheerio (fast HTML parsing)
- **Infrastructure**: Docker, Nginx, SSL/TLS

---

## 📖 Documentation

- [`plan.md`](./plan.md) — Full development plan and architecture
- [`progress.md`](./progress.md) — Development progress tracker
- [`skills.md`](./skills.md) — Technology reference and color system
