# Implementation Plan - Session Inactivity Timeout with Warning Modal

Implement a configurable `SESSION_TIMEOUT_MINUTES` property (default 30 minutes) in the StoryBook dynamic system configuration subsystem, accompanied by an interactive session timeout warning modal dialog that prompts the user with a 60-second countdown before clearing session storage and redirecting to the public home page.

---

## User Review Required

> [!IMPORTANT]
> - **Configuration Tag**: `SESSION_TIMEOUT_MINUTES` will be added to `default_properties.json` and persisted in the Cloud SQL `sysConfig` table with a default value of `30` (minutes).
> - **Warning Trigger**: The modal will appear when `(SESSION_TIMEOUT_MINUTES * 60) - 60` seconds of user inactivity are reached (e.g. at 29 minutes for a 30-minute timeout).
> - **User Actions**:
>   1. **"Stay Signed In" / "Renew Session"**: Resets the inactivity timer and closes the modal.
>   2. **"Sign Out Now"**: Immediately invokes `userManager.userLogout()` and redirects to `sbPublicPage`.
>   3. **Countdown Expiration (0s)**: Automatically flushes session storage and redirects to `sbPublicPage`.

---

## Proposed Changes

### 1. Backend & Configuration (`sb-api`)

#### [MODIFY] [default_properties.json](file:///c:/Users/marks/antigravity/sb-api/config/default_properties.json)
* Add `SESSION_TIMEOUT_MINUTES`:
  ```json
  {
    "configTag": "SESSION_TIMEOUT_MINUTES",
    "configValue": "30",
    "configType": "NUMBER",
    "configGroup": "SYSTEM",
    "configDesc": "Inactivity duration in minutes before user session times out"
  }
  ```

#### [MODIFY] [sb-api/test_sys_config_endpoints.py](file:///c:/Users/marks/antigravity/sb-api/test_sys_config_endpoints.py)
* Update tests to verify bootstrapping and retrieval of `SESSION_TIMEOUT_MINUTES`.

---

### 2. Frontend Application (`sb100`)

#### [NEW] [SessionTimeoutModal.tsx](file:///c:/Users/marks/antigravity/sb100/src/components/SessionTimeoutModal.tsx)
* Responsive modal dialog component displaying:
  * Warning header with clock/shield icon.
  * Live 60-second countdown timer with visual progress indicator.
  * Informational text explaining inactivity timeout.
  * "Renew Session" (primary) and "Log Out" (secondary) buttons.

#### [NEW] [useSessionTimeout.ts](file:///c:/Users/marks/antigravity/sb100/src/hooks/useSessionTimeout.ts)
* Custom React hook:
  * Monitors user activity events (`mousemove`, `mousedown`, `keydown`, `scroll`, `touchstart`).
  * Fetches `SESSION_TIMEOUT_MINUTES` from `sysConfigApi` / in-memory cache.
  * Manages warning modal visibility state and 60-second countdown ticker.
  * Handles auto-logout and redirection to public home page (`sbPublicPage`).

#### [MODIFY] [MainLayout.tsx](file:///c:/Users/marks/antigravity/sb100/src/layouts/MainLayout.tsx)
* Integrate `SessionTimeoutModal` and `useSessionTimeout` for all active authenticated member sessions.

#### [MODIFY] [SystemPropertiesFeature.tsx](file:///c:/Users/marks/antigravity/sb100/src/features/systemProperties/components/SystemPropertiesFeature.tsx)
* Add `SESSION_TIMEOUT_MINUTES` to fallback mock list to ensure full editing support in offline/sandbox modes.

---

## Verification Plan

### Automated Tests
1. **Backend Bootstrapping & Endpoint Test**:
   ```bash
   c:/Users/marks/antigravity/sb-api/.venv/Scripts/python.exe c:/Users/marks/antigravity/sb-api/test_sys_config_endpoints.py
   ```
2. **Frontend Compilation & Type Checking**:
   ```bash
   cd c:/Users/marks/antigravity/sb100 && npm run build
   ```

### Manual Verification
1. Log into StoryBook on `http://localhost:3000`.
2. Verify `SESSION_TIMEOUT_MINUTES` appears in the **System Properties** Admin screen.
3. Test warning dialog countdown, "Renew Session" button, and auto-logout expiration on 0s.
