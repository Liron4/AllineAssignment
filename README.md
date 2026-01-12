# Alline Assignment

A small mono-repo containing a DB ETL script (Prisma + Postgres) and a Next.js frontend with filtering + search on the data + caching for quick performance

## Overview 
- **db-setup-script/** — ETL, Prisma schema, and Docker Compose for Postgres.
- **frontend/** — Next.js app that reads a cached `cities_cache.json` produced by the ETL.

## Prerequisites 
- Docker & Docker Compose
- Node.js (v18+ recommended) and npm

## Setup (short)

1) Configure `.env` at the repo root (for testing purposes only):

```env
# Database connection string
DATABASE_URL="postgresql://alline:alline123@localhost:5432/alline_db?schema=public"
```

Note: to avoid duplication, this repo uses the **root `.env`** for both packages — `frontend/` and `db-setup-script/` will use this file (symlinks are created).

2) Run DB setup:

```bash
cd db-setup-script && npm run setup
```

2.5) Return to the repo root:

```bash
cd ..
```

3) Start and test frontend:

```bash
cd frontend && npm run dev
```

These concise steps should be run once per folder to set up and test the project.

