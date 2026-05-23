# AgriTRUST Platform

> From farm to market, from soil to future.

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Platform](https://img.shields.io/badge/Platform-Web%20%2B%20Mobile-green.svg)]()
[![Status](https://img.shields.io/badge/Status-Prototype-orange.svg)]()

AgriTRUST is a global agricultural technology platform powered by AI, blockchain, secure payments, harvest finance, barter exchange, LandShare, smart negotiation, QualityScan, farmer protection, ethical AI, mentorship, and green economy innovation.

Built for farmers, landowners, buyers, exporters, cooperatives, and communities across Southern Africa.

---

## Repository Structure

| Folder | Description |
|--------|-------------|
| `artifacts/agritrust/` | Full-stack web platform (React + Vite + TailwindCSS) |
| `artifacts/agritrust-mobile/` | Mobile application (React Native + Expo) |
| `artifacts/api-server/` | Shared backend API (Node.js + Express + PostgreSQL) |
| `lib/db/` | Database schema and seed scripts (Drizzle ORM) |

---

## Platform Pillars (26)

| # | Pillar | Description |
|---|--------|-------------|
| 1 | Marketplace | Buy and sell livestock, crops, equipment |
| 2 | Harvest Finance | Low-interest loans repaid through harvest |
| 3 | LandShare | Lease unused land to verified farmers |
| 4 | Barter Exchange | Trade goods and services without cash |
| 5 | DealWise | AI-powered negotiation assistant |
| 6 | QualityScan | AI harvest quality verification |
| 7 | InputGuard | Detect fake seeds and farm inputs |
| 8 | AgriTRUST Protect | Insurance and disaster recovery |
| 9 | SafeTrade | Dispute resolution centre |
| 10 | Farm Accounting | Simple farm P&L tracking |
| 11 | FarmScore | Farm readiness and credit score |
| 12 | Market Stabilizer | Redirect surplus harvests |
| 13 | Mentorship Network | Farmer-to-farmer knowledge transfer |
| 14 | Co-op Treasury | Cooperative fund management |
| 15 | Climate Credits | Track biodiversity and carbon actions |
| 16 | AgriHaul | Transport and logistics booking |
| 17 | AgriEnergy | Renewable energy marketplace |
| 18 | AgriSave | Bookmarks and saved items |
| 19 | AgriVoice | Voice-first AI in local languages |
| 20 | AgriLive | Live video marketplace and auctions |
| 21 | AgriPredict | AI harvest and income forecasting |
| 22 | Smart Contracts | Automated agricultural agreements |
| 23 | AgriID | Portable digital farmer identity |
| 24 | AgriWatch | Community theft prevention network |
| 25 | AgriData | Ethical agricultural data intelligence |
| 26 | Academy | Agricultural courses and certificates |

---

## Launch Markets

| Country | Status |
|---------|--------|
| 🇳🇦 Namibia | Primary launch market |
| 🇧🇼 Botswana | Phase 1 expansion |
| 🇿🇦 South Africa | Phase 1 expansion |
| 🇿🇲 Zambia | Phase 1 expansion |
| 🇿🇼 Zimbabwe | Phase 1 expansion |

---

## Leadership

| Name | Role |
|------|------|
| Loide Dawid | Chief Executive Officer & Co-Founder |
| Paulus Indongo | Chief Technology Officer & Co-Founder |

---

## Tech Stack

### Web Platform
- **Frontend:** React 18, Vite, TailwindCSS
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL + Drizzle ORM
- **Auth:** JWT + bcrypt
- **AI:** OpenAI GPT-4o (DealWise, QualityScan)
- **Real-time:** Server-Sent Events

### Mobile App
- React Native with Expo
- Expo Router (file-based navigation)
- React Navigation v6
- Shared backend API

---

## Prototype Data

| Entity | Count |
|--------|-------|
| Users | 88 (across 17 roles) |
| Listings | 180 |
| Transactions | 200 |
| Barter Offers | 45 |
| Land Listings | 22 |
| Harvest Loans | 15 |
| Quality Reviews | 160 |
| Community Posts | 40 |
| Impact Records | 88 |
| Mentorship Sessions | 12 |

---

## Quick Start

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

# Set up the database schema
pnpm --filter @workspace/db run db:push

# Seed the database (88 users, under 30 seconds)
pnpm --filter @workspace/db exec tsx src/seed.ts

# Reset and reseed if needed
pnpm --filter @workspace/db exec tsx src/seed.ts --reset

# Start web platform
pnpm --filter @workspace/agritrust run dev

# Start API server (in a separate terminal)
pnpm --filter @workspace/api-server run dev

# Start mobile app (in a separate terminal)
pnpm --filter @workspace/agritrust-mobile run dev
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key (minimum 32 characters) |
| `PORT` | Backend API port (default 3001) |
| `NODE_ENV` | `development` or `production` |
| `OPENAI_API_KEY` | OpenAI key for DealWise & QualityScan AI |

---

## License

Licensed under the GNU Affero General Public License v3.0 (AGPLv3).
See [LICENSE](./LICENSE) for full details.

✅ Free to use, study, modify, and distribute
✅ Modifications must be shared under AGPLv3
❌ Cannot be made proprietary or closed-source

---

## Contact

Website: https://agritrusthub.com
Email: hello@agritrust.com

> AgriTRUST — Agriculture with trust at its roots.
