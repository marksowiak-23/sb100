# SBook sb100 Frontend Guidelines & Agent Instructions

## Prompt Logging Requirement
- For EVERY user prompt submitted through this agent interface, immediately log the prompt entry to `agent-prompt-<github_id>.log` (for Mark Sowiak, use `agent-prompt-marksowiak-23.log`).
- Target Path: Resolve `$HOME/antigravity/sb100/agent-prompt-<github_id>.log` (on Windows: `%USERPROFILE%\antigravity\sb100\agent-prompt-<github_id>.log`) if that directory exists; otherwise, fallback to `./agent-prompt-<github_id>.log` at the root of `sb100`.
- Format: `[<ISO_TIMESTAMP>] <USER_PROMPT>`
- Always append new entries without overwriting previous logs (create parent directory/file if needed).

---

## 1. Project Context
`sb100` is the primary member-facing web application built with:
- **Framework**: React 18 / Vite / TypeScript
- **Styling**: Tailwind CSS & Lucide icons
- **Local Dev Server**: Port `3000` (`npm run dev`)
- **Backend API**: Connects to `sb-api` on `http://localhost:8000` via `src/services/api.ts`

## 2. Core Architecture Standards
- **Dual Mode (Live DB vs Sandbox)**: All feature components must support both Live DB mode (via `taskApi`) and Sandbox mock mode (backed by `sessionStorage`). Never break Sandbox fallbacks when adding live API calls.
- **Zero N+1 Waterfalls**: Always batch related data queries concurrently using `Promise.all` rather than serial requests.
- **Code Tables**: Use `<CdSelect tag="..." />` bound to system code tables for controlled vocabularies (e.g., `privValueCd`, `storyPublishStatusCd`).
- **Component Tagging**: Append `<AdminComponentTag name="<ComponentName>" />` at the bottom of major feature containers for administrative UI traceability.
- **Type Safety**: Run `npx tsc --noEmit` before concluding changes. Ensure no new TypeScript errors are introduced.

## 3. Five-Step Database Integration Workflow
When a database table or column is added/updated in `sb-dbs` and `sb-api`:
1. **API Client**: Add TypeScript interface and `taskApi` / entity API methods in `src/services/api.ts`.
2. **Admin DB Screens**: Register table in `TABLE_DEFINITIONS` in `src/features/adminDb/AdminDb.tsx`.
3. **PDF Generation**: Add table title mapping in `src/features/adminDb/utils/generateAdminDbPdf.ts`.
4. **Sandbox Data**: Provide default mock fallback data in `TABLE_DEFINITIONS` for sandbox inspection.

## 4. Other Ecosystem Services
- `sb-api`: Backend API on port `8000`
- `sb-admin-web`: Admin portal on port `3100`
- `sb-api-ai`: AI service on port `8002`
- `sb-api-media`: Media service on port `8003`
- `sb-dbs`: Schema migrations, DDL, and documentation
