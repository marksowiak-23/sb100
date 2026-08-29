# Implementation Plan - Proximity & Recent Story Sorting for Public Member Search

Enhance the StoryBook public landing page member explore/search feature to prioritize nearby members based on browser location / reverse geocoding, sorted by their most recent published story date.

---

## User Review Required

> [!IMPORTANT]
> **Key Architecture Decisions:**
> 1. **Default Sorting by Most Recent Published Date**: `get_mbrs` joins `mbrStat` to order members by `statLastPublishedDt DESC NULLS LAST`, ensuring active authors with new stories appear at the top.
> 2. **Proximity Scoring**: When browser proximity (e.g., `"Chicago, IL"` or `"Austin, TX"`) is detected, members residing in or from that region are ranked first, ordered by their `statLastPublishedDt DESC`, followed by other community members.
> 3. **Non-Intrusive Browser Location Detection**:
>    - Uses HTML5 `navigator.geolocation` with OpenStreetMap reverse geocoding to detect city/state.
>    - Falls back seamlessly to IP-based location lookup (`ipapi.co` / `ipwho.is`) without blocking or erroring if GPS permission is dismissed.
>    - Caches location in `sessionStorage` for the session duration.
> 4. **Search Card UX**: Displays a subtle proximity tag (e.g., *"📍 Showing members near Austin, TX • Sorted by recent stories"*) with an option to refresh or clear.

---

## Proposed Changes

### 1. Backend Service (`sb-api`)

#### [MODIFY] [routers/mbr.py](file:///c:/Users/marks/antigravity/sb-api/routers/mbr.py)
* Add `proximity: Optional[str] = None` and `sort_by: Optional[str] = "published_date"` query parameters to `GET /mbrs`.

#### [MODIFY] [crud.py](file:///c:/Users/marks/antigravity/sb-api/crud.py)
* Update `get_mbrs(...)`:
  * Outer join `models.DBMbrStat` on `mbr.mbrId == mbrStat.mbrId`.
  * If `proximity` provided: calculate case score `is_proximity_match` matching `mbrLivesCityState` or `mbrFromCityState`.
  * Order by `is_proximity_match.desc()`, `models.DBMbrStat.statLastPublishedDt.desc().nullslast()`, `models.DBMbr.mbrCreatedAt.desc()`.

#### [NEW] [test_mbr_proximity_search.py](file:///c:/Users/marks/antigravity/sb-api/test_mbr_proximity_search.py)
* Unit test suite verifying proximity scoring and published date sorting.

---

### 2. Frontend Application (`sb100`)

#### [NEW] [src/utils/userLocation.ts](file:///c:/Users/marks/antigravity/sb100/src/utils/userLocation.ts)
* Location detection utility:
  * Browser Geolocation API + reverse geocode to City/State.
  * Fast IP lookup fallback.
  * Session cache management.

#### [MODIFY] [src/services/api.ts](file:///c:/Users/marks/antigravity/sb100/src/services/api.ts)
* Update `taskApi.getMembers` to accept `proximity?: string`.

#### [MODIFY] [SbPublicPageFeature.tsx](file:///c:/Users/marks/antigravity/sb100/src/features/sbPublicPage/components/SbPublicPageFeature.tsx)
* Detect location on mount.
* Pass `proximity` to `taskApi.getMembers`.
* Support pagination / load more with proximity maintained.

#### [MODIFY] [SbPublicSearchCard.tsx](file:///c:/Users/marks/antigravity/sb100/src/features/sbPublicPage/components/SbPublicSearchCard.tsx)
* Add location indicator badge with icon showing current proximity detection status.

#### [MODIFY] [SbMemberSearchResults.tsx](file:///c:/Users/marks/antigravity/sb100/src/features/sbPublicPage/components/SbMemberSearchResults.tsx)
* Update header to reflect proximity and recent publication sort order.

---

## Verification Plan

### Automated Tests
1. **Backend Test Suite**:
   ```bash
   c:/Users/marks/antigravity/sb-api/.venv/Scripts/python.exe c:/Users/marks/antigravity/sb-api/test_mbr_proximity_search.py
   ```
2. **Frontend Build**:
   ```bash
   cd c:/Users/marks/antigravity/sb100 && npm run build
   ```

### Manual Verification
1. Open Public landing page on `http://localhost:3000`.
2. Observe detected location badge on search card.
3. Verify member cards list proximity members first, ordered by latest `LAST PUBLISHED` date.
