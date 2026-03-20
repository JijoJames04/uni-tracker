# 🛠️ UniTracker — Skills & Technologies

## Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 14.x | React framework, App Router, SSR/SSG |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.x | Utility-first styling |
| shadcn/ui | latest | Accessible component library |
| Framer Motion | 11.x | Animations & transitions |
| Zustand | 4.x | Lightweight global state |
| TanStack Query | 5.x | Server state, caching |
| React Hook Form | 7.x | Form management |
| Zod | 3.x | Schema validation |
| Recharts | 2.x | Charts & statistics |
| react-dropzone | 14.x | File upload UI |
| date-fns | 3.x | Date utilities |
| react-big-calendar | latest | Calendar component |
| lucide-react | latest | Icons |
| clsx + tailwind-merge | latest | Class utilities |
| axios | 1.x | HTTP client |

## Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| NestJS | 10.x | Node.js framework |
| TypeScript | 5.x | Type safety |
| Prisma | 5.x | ORM & migrations |
| PostgreSQL | 16 | Primary database |
| Puppeteer | 22.x | Headless browser scraping |
| Cheerio | 1.x | HTML parsing (fast) |
| class-validator | 0.14.x | DTO validation |
| class-transformer | 0.5.x | Object transformation |
| @nestjs/swagger | 7.x | API documentation |
| multer | latest | File upload handling |
| sharp | latest | Image processing |
| node-fetch | 3.x | HTTP requests |

## Infrastructure

| Technology | Version | Purpose |
|-----------|---------|---------|
| Docker | 24.x | Containerization |
| Docker Compose | 2.x | Multi-container orchestration |
| Nginx | 1.25 Alpine | Reverse proxy, SSL termination |
| OpenSSL | latest | SSL certificate generation |

## Design Assets & Fonts

| Asset | Source | Usage |
|-------|--------|-------|
| Geist (Sans + Mono) | Google Fonts / Vercel | Primary typeface |
| Plus Jakarta Sans | Google Fonts | Display headings |
| Lucide Icons | lucide.dev | UI icons |
| Heroicons | heroicons.com | Secondary icons |
| Gradient meshes | CSS | Background decorations |

## Color System

```css
/* Primary — Deep Navy */
--primary: #1a1f36;
--primary-foreground: #ffffff;

/* Accent — Vivid Indigo */
--accent: #4f46e5;
--accent-hover: #4338ca;

/* Success — Emerald */
--success: #10b981;

/* Warning — Amber */
--warning: #f59e0b;

/* Danger — Rose */
--danger: #f43f5e;

/* Muted */
--muted: #6b7280;
--muted-bg: #f9fafb;

/* Status Colors */
--draft: #94a3b8;         /* Slate */
--sop-writing: #8b5cf6;   /* Violet */
--preparing: #f59e0b;     /* Amber */
--submitted: #3b82f6;     /* Blue */
--under-review: #6366f1;  /* Indigo */
--approved: #10b981;      /* Emerald */
--rejected: #ef4444;      /* Red */
--waitlisted: #f97316;    /* Orange */
```

## Scraping Strategy

1. **Puppeteer** — Full JS-rendered pages (most German university sites use dynamic content)
2. **Cheerio** — Fast static HTML parsing as fallback
3. **Pattern Matching** — Regex patterns for:
   - Course fees (€, EUR patterns)
   - Application deadlines (date patterns)
   - ECTS credits
   - Language requirements
   - Uni-Assist indicators
4. **Image Fetching** — Extract og:image, university logo from favicon/header

## German University Portal Detection

```typescript
const UNI_ASSIST_PATTERNS = [
  /uni-assist/i,
  /hochschulstart/i,
  /international applications.*uni-assist/i,
];

const DIRECT_APPLICATION_PATTERNS = [
  /apply.*directly/i,
  /online.*bewerbung/i,
  /bewerbungsportal/i,
];
```
