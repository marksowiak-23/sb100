# Implementation Plan - Member Profile Geocoding & True Distance Proximity Search

Add automatic geocoding to member profiles on save, persisting geographical coordinates (`mbrLat`, `mbrLng`) and canonical location names in PostgreSQL to enable true mathematical distance calculation in member searches.

---

## User Review Required

> [!IMPORTANT]
> **Key Architecture Decisions:**
> 1. **Database Additions**:
>    - `mbrLat` (`DECIMAL(9,6)`, NULL)
>    - `mbrLng` (`DECIMAL(9,6)`, NULL)
>    - `mbrLocationCanonical` (`VARCHAR(150)`, NULL)
> 2. **Automatic Geocode on Save**:
>    - In `sb-api`, when creating or updating a member with `mbrLivesCityState` or `mbrFromCityState`, the backend calls a cached geocoder to populate `mbrLat`, `mbrLng`, and `mbrLocationCanonical`.
> 3. **Backfill Existing Data**:
>    - A migration script will geocode and backfill all existing member records in Cloud SQL.
> 4. **True Distance Proximity Search**:
>    - `GET /mbrs` will accept `proximity_lat` & `proximity_lng` (or `proximity="City, State"`) and calculate geographical distance in miles using the PostgreSQL Haversine formula, ordering by `distance ASC, statLastPublishedDt DESC NULLS LAST`.

---

## Proposed Changes

### 1. Database Layer (`sb-dbs`)

#### [NEW] [add_geocoding_columns_to_mbr.py](file:///c:/Users/marks/antigravity/sb-dbs/migrations/add_geocoding_columns_to_mbr.py)
* Migration script to:
  1. Add columns `mbrLat`, `mbrLng`, `mbrLocationCanonical` to `mbr` table.
  2. Geocode and backfill existing member records.

#### [MODIFY] [create_table_mbr.py](file:///c:/Users/marks/antigravity/sb-dbs/schema/create_table_mbr.py)
* Update schema definition to include the new columns.

#### [MODIFY] [table_mbr.md](file:///c:/Users/marks/antigravity/sb-dbs/docs/tables/table_mbr.md) and [database_schema.md](file:///c:/Users/marks/antigravity/sb-dbs/docs/database_schema.md)
* Document the new columns in schema reference docs.

---

### 2. Backend Services (`sb-api`)

#### [NEW] [geocoding_service.py](file:///c:/Users/marks/antigravity/sb-api/geocoding_service.py)
* Geocoding service with:
  * OpenStreetMap Nominatim client.
  * In-memory LRU cache to minimize network calls and rate limits.
  * Canonical city/state/country formatting.

#### [MODIFY] [models.py](file:///c:/Users/marks/antigravity/sb-api/models.py)
* Add `mbrLat`, `mbrLng`, `mbrLocationCanonical` to `DBMbr`.

#### [MODIFY] [schemas.py](file:///c:/Users/marks/antigravity/sb-api/schemas.py)
* Update `MbrBase`, `MbrCreate`, `MbrUpdate`, `Mbr` schemas.

#### [MODIFY] [crud.py](file:///c:/Users/marks/antigravity/sb-api/crud.py)
* Update `create_mbr` and `update_mbr` to auto-geocode if coordinates not provided.
* Update `get_mbrs` to support `proximity_lat` & `proximity_lng` with mathematical Haversine distance ordering.

#### [MODIFY] [routers/mbr.py](file:///c:/Users/marks/antigravity/sb-api/routers/mbr.py)
* Expose `proximity_lat` & `proximity_lng` parameters in `GET /mbrs`.

#### [NEW] [test_geocoding_and_distance_search.py](file:///c:/Users/marks/antigravity/sb-api/test_geocoding_and_distance_search.py)
* Test suite verifying geocoding on save and distance-based proximity ranking.

---

### 3. Frontend App (`sb100`)

#### [MODIFY] [src/services/api.ts](file:///c:/Users/marks/antigravity/sb100/src/services/api.ts)
* Pass `proximity_lat` and `proximity_lng` from detected `UserLocation` to `taskApi.getMembers`.

#### [MODIFY] [SbPublicPageFeature.tsx](file:///c:/Users/marks/antigravity/sb100/src/features/sbPublicPage/components/SbPublicPageFeature.tsx)
* Supply coordinates to `taskApi.getMembers` for high-precision distance sorting.

---

## Verification Plan

### Automated Tests
1. **Database Migration & Backfill**:
   ```bash
   c:/Users/marks/antigravity/sb-api/.venv/Scripts/python.exe c:/Users/marks/antigravity/sb-dbs/migrations/add_geocoding_columns_to_mbr.py
   ```
2. **Backend Geocoding & Distance Test Suite**:
   ```bash
   c:/Users/marks/antigravity/sb-api/.venv/Scripts/python.exe c:/Users/marks/antigravity/sb-api/test_geocoding_and_distance_search.py
   ```
3. **Frontend Compilation**:
   ```bash
   cd c:/Users/marks/antigravity/sb100 && npm run build
   ```

### Manual Verification
* Save a new profile with location (e.g. *"Denver, CO"*), verify coordinates are saved in database, and confirm proximity search returns members in order of mathematical proximity.
