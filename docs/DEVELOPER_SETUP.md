# SBook Developer Onboarding & Local Setup Guide

Welcome to the SBook project! This repository ecosystem consists of multiple collaborating services (FastAPI backends, React frontends, and Cloud SQL database migrations).

---

## 1. Prerequisites

Make sure the following tools are installed on your machine:
- **Node.js**: `v18.0.0` or higher (`node -v`, `npm -v`)
- **Python**: `3.11` or higher (`python --version`)
- **Google Cloud SDK**: (`gcloud --version`) with authenticated access to Google Cloud SQL `sb100-500301`.
- **Git**: (`git --version`)

---

## 2. One-Time Repository Setup

Clone or check out the repositories into a shared workspace folder:
```
sbook/
├── sb100/           # Primary Member React Application (Port 3000)
├── sb-admin-web/    # Administrative React Application (Port 3100)
├── sb-api/          # Primary FastAPI Backend (Port 8000)
├── sb-api-ai/       # AI & LLM Service (Port 8002)
├── sb-api-media/    # Media Upload Service (Port 8003)
└── sb-dbs/          # Database Migrations & Schemas
```

### A. Frontend Dependencies & Environment
In each frontend project, install dependencies and create your local `.env.local` for local secret overrides (non-secret defaults live in `.env.dev`, `.env.stage`, and `.env.prod`):

```bash
# 1. Main Member App (sb100)
cd sb100
npm install
cp .env.example .env.local

# 2. Admin Portal (sb-admin-web)
cd ../sb-admin-web
npm install
cp .env.example .env.local
```

### B. Python Virtual Environments & Dependencies
Set up virtual environments for each FastAPI backend and copy `.env.example` to `.env.local` for local secret overrides:

```bash
# 1. Primary API (sb-api)
cd ../sb-api
python -m venv .venv
# On Windows:
.venv\Scripts\pip install -r requirements.txt
# On macOS/Linux:
# .venv/bin/pip install -r requirements.txt
cp .env.example .env.local

# 2. AI Service (sb-api-ai)
cd ../sb-api-ai
python -m venv .venv
.venv\Scripts\pip install -r requirements.txt
cp .env.example .env.local

# 3. Media Service (sb-api-media)
cd ../sb-api-media
python -m venv .venv
.venv\Scripts\pip install -r requirements.txt
cp .env.example .env.local
```

---

## 3. Database & Cloud Storage Authentication (Google Cloud)

The primary database `sbDB100` runs on Google Cloud SQL (`sb100-500301:us-central1:sb-data`), and media files are stored in Google Cloud Storage (`sb-media-01`).
The backends connect using the **Cloud SQL Python Connector** and **GCS Client** with IAM Application Default Credentials.

1. Ensure your Google account has IAM access to the `sb100-500301` GCP project.
2. Run authentication once in your terminal:
   ```bash
   gcloud auth application-default login
   ```
3. Configure your local secrets in each service's `.env.local`:
   - **`sb-api/.env.local`**: Set `DB_PASSWORD`, `JWT_SECRET_KEY`, and `GEMINI_API_KEY` (used for AI content moderation on story publishing).
   - **`sb-api-ai/.env.local`**: Set `GEMINI_API_KEY` (used for StoryMate AI chat and story generation).
   - **`sb-api-media/.env.local`**: Optionally set `GOOGLE_APPLICATION_CREDENTIALS` if using a service account key file instead of `gcloud auth application-default login`.

---

## 4. Multi-Environment Configuration (`dev`, `stage`, `prod`)

StoryBook uses three environment tiers across all repositories, where **Dev/Local** is a single unified environment (`dev`):
- **`dev` (Dev / Local)**: Default local development environment (`SB_ENV=dev` / Vite `--mode dev`).
- **`stage` (Staging)**: Pre-production staging environment (`SB_ENV=stage` / Vite `--mode stage`).
- **`prod` (Production)**: Live production environment (`SB_ENV=prod` / Vite `--mode prod`).

### Environment Files & Load Precedence
Each service repository contains:
1. `.env.<env>.local`: Git-ignored environment-specific secret overrides (highest file precedence).
2. `.env.local`: Git-ignored local secret overrides (`DB_PASSWORD`, `JWT_SECRET_KEY`, `GEMINI_API_KEY`).
3. `.env.dev` / `.env.stage` / `.env.prod`: Tracked non-secret settings and service URLs per environment.
4. `.env`: Fallback file if present.

*(Note: Explicit OS/Cloud Run environment variables always take top precedence over `.env*` files.)*

---

## 5. Starting & Managing Services

You can start all 5 services concurrently using the automated startup script:

### Windows PowerShell:
```powershell
# Default: starts all services in Dev/Local mode (SB_ENV=dev)
powershell -ExecutionPolicy Bypass -File sb100\scripts\start_all_services.ps1

# Or explicitly target Stage or Prod config locally:
powershell -ExecutionPolicy Bypass -File sb100\scripts\start_all_services.ps1 -Env stage
powershell -ExecutionPolicy Bypass -File sb100\scripts\start_all_services.ps1 -Env prod
```

> **Note on Backend Code Changes**: The FastAPI backends (`sb-api`, `sb-api-ai`, `sb-api-media`) run via `uvicorn` without `--reload` when launched by `start_all_services.ps1` for stability. When you modify backend Python files (`crud.py`, `routers/`, `graph.py`, etc.), restart that backend service (or run `uvicorn main:app --port <PORT> --reload` during active backend development) so changes take effect in memory.

### Running Database Diagnostics & Migrations (`sb-dbs`):
```powershell
# Dev / Local (default)
sb-api\.venv\Scripts\python.exe sb-dbs/diagnostics/connect_test.py

# Stage
$env:SB_ENV="stage"; sb-api\.venv\Scripts\python.exe sb-dbs/diagnostics/connect_test.py

# Production
$env:SB_ENV="prod"; sb-api\.venv\Scripts\python.exe sb-dbs/diagnostics/connect_test.py
```

### Service Port Map:
| Service | Type | Local Port | Health Check |
| :--- | :--- | :--- | :--- |
| **`sb100`** | Member Frontend (Vite) | `3000` | http://localhost:3000 |
| **`sb-admin-web`** | Admin Frontend (Vite) | `3100` | http://localhost:3100 |
| **`sb-api`** | Primary FastAPI Backend | `8000` | http://localhost:8000/health |
| **`sb-api-ai`** | AI FastAPI Service | `8002` | http://localhost:8002/health |
| **`sb-api-media`** | Media FastAPI Service | `8003` | http://localhost:8003/health |

---

## 6. Working with AI Coding Agents (Antigravity / Cursor / Claude)

All repositories include an **`AGENTS.md`** file that guides AI coding assistants to follow team conventions:
- **Five-Step Database Protocol**: All table/column changes follow a strict lifecycle across `sb-dbs`, `sb-api`, `sb100`, and `sb-admin-web`.
- **Frontend Standards**: Dual-mode support (Live DB vs Sandbox with `sessionStorage`), `<CdSelect>` for code tables, and batching via `Promise.all`.
- **Type Checking**: Run `npx tsc --noEmit` inside `sb100` and `sb-admin-web` to verify TypeScript builds before concluding changes.
- **Prompt Logging**: For prompt auditability, the agent appends user prompts to `%USERPROFILE%\antigravity\sb100\agent-prompt-<your_github_id>.log` (or `<workspace_root>/sb100/agent-prompt-<your_github_id>.log`).
