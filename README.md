# sb100: StoryBook Member Web Application

The primary member-facing web application for **StoryBook (SBook)**, built with React, Vite, TypeScript, and Tailwind CSS.

---

## Service Overview

- **Port**: `3000`
- **Tech Stack**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, jsPDF
- **Authentication**: JWT token storage in `sessionStorage` with multi-tenant member context
- **Operating Modes**:
  - **Live DB Mode**: Interacts directly with `sb-api` on port `8000` and Google Cloud SQL `sbDB100`.
  - **Sandbox Mock Mode**: Client-side offline evaluation backed by browser `sessionStorage`.

---

## Quickstart

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Verify `.env.local` or `.env`:
```env
VITE_API_URL=http://localhost:8000
VITE_AI_API_URL=http://localhost:8002
VITE_MEDIA_API_URL=http://localhost:8003
```

### 3. Start Development Server
```bash
npm run dev -- --port 3000
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. TypeScript Type Checking
Before committing any changes:
```bash
npx tsc --noEmit
```

---

## Ecosystem Documentation & Developer Guides

Full architectural documentation, multi-service setup, and roadmaps are maintained in [`sb-devops`](../sb-devops):

| Guide | Description | Location |
| :--- | :--- | :--- |
| **Developer Onboarding** | Full-stack local setup, virtual environments & service ports | [docs/DEVELOPER_SETUP.md](docs/DEVELOPER_SETUP.md) (or `sb-devops/docs/DEVELOPER_SETUP.md`) |
| **Developer Roadmap & TODO** | Prioritized technical milestones (MFA, Google/Apple login, messaging, Lulu POD) | [docs/TODO.md](docs/TODO.md) (or `sb-devops/docs/TODO.md`) |
| **GitHub Workflow Guide** | Multi-repository Git & GitHub guide for Google Antigravity | `sb-devops/docs/ANTIGRAVITY_GITHUB_GUIDE.md` |
| **Deployment Guide** | Google Cloud Run, Cloud SQL, Secret Manager, and CI/CD | `sb-devops/docs/DEPLOYMENT_GUIDE.md` |

---

## SBook Multi-Service Ecosystem Ports

| Service | Port | Description |
| :--- | :--- | :--- |
| **`sb100`** | `3000` | Primary Member React Application |
| **`sb-admin-web`** | `3100` | Administrative React Application |
| **`sb-api`** | `8000` | Primary FastAPI Backend |
| **`sb-api-ai`** | `8002` | AI & StoryMate FastAPI Service |
| **`sb-api-media`** | `8003` | Media Upload & Processing FastAPI Service |
| **`sb-dbs`** | Cloud SQL | PostgreSQL Database Migrations & Schemas |
