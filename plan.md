# 🎓 UniTracker — German University Application Tracker
## Development Plan

---

## 🎯 Project Overview

A comprehensive German university application tracking platform designed for international students. It combines web scraping, document management, LLM prompt generation, and progress tracking into a polished, production-grade application.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    NGINX (Reverse Proxy)                  │
│              SSL Termination + Security Headers           │
└──────────────┬──────────────────────────┬────────────────┘
               │                          │
        ┌──────▼──────┐           ┌───────▼──────┐
        │  Frontend   │           │   Backend    │
        │  Next.js 14 │           │   NestJS     │
        │  Port 3000  │           │   Port 4000  │
        └──────┬──────┘           └───────┬──────┘
               │                          │
        ┌──────▼──────────────────────────▼──────┐
        │              PostgreSQL                 │
        │         (via Docker + Prisma)           │
        └─────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Animations**: Framer Motion
- **State**: Zustand + React Query (TanStack Query)
- **Forms**: React Hook Form + Zod
- **Calendar**: FullCalendar / react-big-calendar
- **Charts**: Recharts
- **File Upload**: react-dropzone

### Backend
- **Framework**: NestJS 10
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL 16
- **Scraping**: Puppeteer + Cheerio
- **File Storage**: MinIO (S3-compatible) / Local filesystem
- **Validation**: class-validator + class-transformer
- **API Docs**: Swagger/OpenAPI

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Proxy**: Nginx
- **SSL**: Let's Encrypt / Self-signed (dev)
- **Database**: PostgreSQL in Docker

---

## 📋 Features

### 1. Dashboard Overview
- Total applications: pending, action-needed, approved, rejected
- Total fees summary (€)
- Upcoming deadlines widget
- Recent activity feed
- Quick-add university button

### 2. University Course Parser
- Input: University course URL
- Output: Course name, university name, logo, address, fees, description, application portal type
- Technology: Puppeteer + Cheerio + LLM extraction
- Detection: Uni-Assist vs Direct Application

### 3. Application Tracking
- Status pipeline: `Draft → SOP Writing → Documents Ready → Submitted → Under Review → Decision`
- Color-coded status badges
- Per-university, per-course sections
- Timeline of actions per application

### 4. Document Management
- Upload SOP per university/course
- Version history for documents
- Document checklist per application
- Required documents tracker

### 5. SOP Prompt Generator
- Combines: university details + course info + personal profile
- Generates structured LLM prompt
- Copy-to-clipboard functionality
- Template library

### 6. Calendar & Deadlines
- Application deadline markers
- Days-left countdown per course
- Pre-planning calendar
- Deadline alerts

### 7. Timeline Tracking
- Per-application action log
- Date-stamped entries
- Milestone markers

### 8. Profile Management
- Personal details (for SOP generation)
- Academic background
- Language scores (IELTS/TOEFL/TestDaF)
- Work experience

---

## 📁 Project Structure

```
uni-tracker/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/         # Main dashboard
│   │   │   ├── applications/      # All applications list
│   │   │   │   └── [id]/         # Application detail page
│   │   │   ├── universities/      # Universities list
│   │   │   ├── calendar/          # Calendar view
│   │   │   ├── documents/         # Document vault
│   │   │   ├── profile/           # User profile
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx          # Root redirect
│   │   ├── components/
│   │   │   ├── ui/               # shadcn components
│   │   │   ├── dashboard/        # Dashboard widgets
│   │   │   ├── applications/     # Application components
│   │   │   ├── calendar/         # Calendar components
│   │   │   ├── documents/        # Document components
│   │   │   ├── layout/           # Sidebar, Navbar, etc.
│   │   │   └── shared/           # Reusable components
│   │   ├── lib/                  # Utilities, API client
│   │   ├── hooks/                # Custom hooks
│   │   ├── types/                # TypeScript types
│   │   └── store/                # Zustand stores
│   ├── public/
│   ├── package.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── universities/     # University CRUD
│   │   │   ├── applications/     # Application management
│   │   │   ├── documents/        # File upload/management
│   │   │   ├── scraper/          # Web scraping service
│   │   │   ├── prompts/          # SOP prompt generation
│   │   │   ├── profile/          # User profile
│   │   │   └── timeline/         # Activity timeline
│   │   ├── prisma/               # Prisma schema + migrations
│   │   ├── config/               # App configuration
│   │   └── main.ts
│   ├── package.json
│   └── tsconfig.json
│
├── nginx/
│   ├── nginx.conf                # Production config
│   ├── nginx.dev.conf            # Dev config
│   └── ssl/                      # SSL certificates
│
├── docker-compose.yml            # Production
├── docker-compose.dev.yml        # Development
├── Dockerfile                    # Frontend production
├── Dockerfile.dev                # Frontend development
├── .dockerignore
├── plan.md
├── progress.md
└── skills.md
```

---

## 🔄 Application Status Flow

```
[Add URL] → [Parsing] → [Draft] → [SOP Writing] → [Documents Preparing]
                                                           ↓
[Decision] ← [Under Review] ← [Submitted] ← [Documents Ready]
     ↓
[Approved / Rejected / Waitlisted]
```

### Color Codes
- 🔴 `action-needed` — Missing SOP, missing documents
- 🟡 `in-progress` — SOP writing, documents preparing
- 🔵 `submitted` — Application submitted
- 🟢 `approved` — Accepted
- ⚫ `rejected` — Rejected
- 🟣 `waitlisted` — Waitlisted

---

## 🗓️ Development Phases

### Phase 1: Foundation (Week 1)
- [x] Project structure setup
- [x] Docker environment
- [x] Database schema (Prisma)
- [x] Basic NestJS API
- [x] Next.js app shell

### Phase 2: Core Features (Week 2)
- [ ] University scraper service
- [ ] Application CRUD
- [ ] Document upload
- [ ] Basic dashboard

### Phase 3: Advanced Features (Week 3)
- [ ] Calendar integration
- [ ] Timeline tracking
- [ ] SOP prompt generator
- [ ] Animations & polish

### Phase 4: Production (Week 4)
- [ ] Docker production build
- [ ] HTTPS/SSL
- [ ] Performance optimization
- [ ] SEO optimization

---

## 🔐 Security Checklist

- [ ] Non-root Docker user
- [ ] Environment variables (no hardcoded secrets)
- [ ] CORS configuration
- [ ] Rate limiting
- [ ] Input validation (Zod + class-validator)
- [ ] File upload validation (type + size)
- [ ] Security headers (Nginx)
- [ ] HTTPS enforced

---

## 📊 Database Schema (Prisma)

```prisma
model University {
  id          String   @id @default(cuid())
  name        String
  logoUrl     String?
  address     String?
  website     String?
  country     String   @default("Germany")
  createdAt   DateTime @default(now())
  courses     Course[]
}

model Course {
  id              String      @id @default(cuid())
  universityId    String
  name            String
  description     String?
  fees            Float?
  currency        String      @default("EUR")
  deadline        DateTime?
  applicationUrl  String?
  applicationVia  AppVia      @default(DIRECT)
  language        String?
  duration        String?
  degree          String?
  createdAt       DateTime    @default(now())
  university      University  @relation(fields: [universityId], references: [id])
  application     Application?
}

enum AppVia {
  DIRECT
  UNI_ASSIST
  BOTH
}

model Application {
  id          String      @id @default(cuid())
  courseId    String      @unique
  status      AppStatus   @default(DRAFT)
  notes       String?
  appliedAt   DateTime?
  decisionAt  DateTime?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  course      Course      @relation(fields: [courseId], references: [id])
  documents   Document[]
  timeline    Timeline[]
}

enum AppStatus {
  DRAFT
  SOP_WRITING
  DOCUMENTS_PREPARING
  DOCUMENTS_READY
  SUBMITTED
  UNDER_REVIEW
  APPROVED
  REJECTED
  WAITLISTED
}

model Document {
  id            String      @id @default(cuid())
  applicationId String
  type          DocType
  name          String
  filePath      String
  version       Int         @default(1)
  uploadedAt    DateTime    @default(now())
  application   Application @relation(fields: [applicationId], references: [id])
}

enum DocType {
  SOP
  CV
  TRANSCRIPT
  LANGUAGE_CERT
  RECOMMENDATION
  PASSPORT
  OTHER
}

model Timeline {
  id            String      @id @default(cuid())
  applicationId String
  action        String
  description   String?
  createdAt     DateTime    @default(now())
  application   Application @relation(fields: [applicationId], references: [id])
}

model Profile {
  id              String    @id @default(cuid())
  firstName       String
  lastName        String
  email           String    @unique
  phone           String?
  nationality     String?
  dateOfBirth     DateTime?
  address         String?
  bachelor        String?
  bachelorsGrade  Float?
  ieltsScore      Float?
  toeflScore      Float?
  testDafScore    Int?
  gre             Int?
  workExperience  String?
  skills          String[]
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```
