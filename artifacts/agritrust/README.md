# AgriTRUST — Web Platform

Full-stack web application for the AgriTRUST agricultural technology platform.

---

## Tech Stack

### Frontend
- React 18 with Vite
- TailwindCSS (dark mode supported)
- React Router / Wouter
- Recharts (data visualisations)
- Lucide React (icons)
- React Query (data fetching)

### Backend
- Node.js with Express.js
- PostgreSQL
- Drizzle ORM
- JWT Authentication
- Server-Sent Events (real-time features)
- OpenAI GPT-4o (DealWise, QualityScan)

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- pnpm 8+

### Installation

```bash
# Clone the repository
git clone https://github.com/AgriTRUSTHUB/agritrust-platform.git
cd agritrust-platform

# Install all dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Push the database schema
pnpm --filter @workspace/db run db:push

# Seed the database (88 users across 18 roles, under 30 seconds)
pnpm --filter @workspace/db exec tsx src/seed.ts

# Reset and reseed if needed
pnpm --filter @workspace/db exec tsx src/seed.ts --reset

# Start the web platform and API server
pnpm --filter @workspace/agritrust run dev
pnpm --filter @workspace/api-server run dev
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key (minimum 32 characters) |
| `PORT` | Backend API port (default 3001) |
| `NODE_ENV` | `development` or `production` |
| `OPENAI_API_KEY` | OpenAI key for DealWise & QualityScan |

---

## Project Structure

```
artifacts/agritrust/
├── src/
│   ├── components/        Reusable UI components
│   │   ├── layout/        Navbar, footer, sidebar
│   │   └── ui/            shadcn/ui primitives
│   ├── pages/             One file per route
│   ├── context/           Auth and Theme context
│   ├── hooks/             Custom React hooks
│   ├── services/          API service functions
│   └── lib/               Utility functions
└── public/
    └── favicon.png
```

---

## Key API Endpoints

### Auth
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
```

### Marketplace
```
GET    /api/listings
POST   /api/listings
GET    /api/listings/:id
```

### LandShare
```
GET    /api/landshare
POST   /api/landshare
POST   /api/landshare/:id/apply
```

### Harvest Finance
```
GET    /api/finance/products
POST   /api/finance/apply
```

### DealWise (AI Negotiation)
```
POST   /api/dealwise/suggest
POST   /api/dealwise/agreements
```

### QualityScan (AI Quality Check)
```
POST   /api/qualityscan/scan
GET    /api/qualityscan/reports
```

### Platform Stats
```
GET    /api/stats/platform
```

---

## Design System

| Token | Value |
|-------|-------|
| Primary green | #1A6B3A |
| Amber accent | #F5A623 |
| Trust blue | #2196F3 |
| Light background | #F8FAF5 |
| Dark background | #0F1F15 |
| UI font | DM Sans |
| Heading font | Playfair Display |

Dark mode: fully supported via Tailwind class strategy. Persists to localStorage.

---

## License

AGPLv3 — see [LICENSE](../../LICENSE) for details.
