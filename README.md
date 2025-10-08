# SmartCart Starter

This is a minimal starter for SmartCart with:
- Next.js 14 storefront
- Express + Apollo GraphQL API
- Prisma + Postgres (Docker)
- Redis (Docker)
- Seed data

## Quick Start
0) Install Node 20+, pnpm, and Docker Desktop (running).
1) Unzip this project and open it in VS Code.
2) Create your env: `cp .env.example .env`
3) Start DBs: `pnpm db:up`
4) Install deps: `pnpm i`
5) Prisma: `pnpm --filter @smartcart/api prisma:generate`
6) Migrate: `pnpm --filter @smartcart/api prisma:migrate`
7) Seed: `pnpm seed`
8) Run API: `pnpm --filter @smartcart/api dev`
9) In another terminal, run Web: `pnpm --filter @smartcart/web dev`

Open:
- Web: http://localhost:3000
- GraphQL: http://localhost:4000/graphql
