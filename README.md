# Allin Assignment

A small mono-repo containing a DB ETL script (Prisma + Postgres) and a Next.js frontend with filtering + search on the data + caching for quick performance

## Overview 
- **db-setup-script/** — ETL, Prisma schema, and Docker Compose for Postgres.
- **frontend/** — Next.js app that acts as a frontend, search & filtering, displays query

## Prerequisites 
- Docker & Docker Compose
- Node.js (v18+ recommended) and npm

## Setup (short)

1) Configure `.env` at the repo root (for testing purposes only):

```env
# Database connection string
DATABASE_URL="postgresql://allin:allin123@localhost:5432/allin_db?schema=public"
```

Note: to avoid duplication, this repo uses the **root `.env`** for both packages — package scripts explicitly load it (for example via `dotenv -e ../.env -- <command>`), so no symlinks are required.

2) Run DB setup (install deps then setup):

```bash
cd db-setup-script
npm install
npm run setup
```

3) Return to the repo root:

```bash
cd ..
```

4) Start and test frontend (install deps then run dev):

```bash
cd frontend
npm install
npm run dev
```

These concise steps should be run once per folder to set up and test the project.

