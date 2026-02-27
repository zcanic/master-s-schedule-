# Code Review Summary

Date: 2026-02-27
Scope: `App` data flow, storage/cloud sync, DataEditor interaction, 3D rendering stability.

## Findings

### 1. Cloud/local payload validation gap could overwrite schedule with unintended empty data
- Severity: High
- Files:
  - `hooks/useCoursesStore.ts`
  - `components/VoidDropModal.tsx`
- Risk:
  - Non-array JSON payloads were normalized to `[]` and treated as successful loads.
  - This could replace in-memory and localStorage data with empty course lists.
- Impacted code blocks:
  - `App.tsx` state source (`courses`)
  - `components/ScheduleGrid.tsx`
  - `components/ReviewMode.tsx`
  - `components/Visualization3D.tsx`
  - `components/MetroMap.tsx`
- Remediation:
  - Enforce `Array.isArray(parsedPayload)` before normalization.
  - Reject payloads where original array is non-empty but normalized result is empty.
  - Keep fallback to local/default data when cloud payload is invalid.

### 2. DataEditor search state existed without any input entry point
- Severity: Medium
- File:
  - `components/DataEditor.tsx`
- Risk:
  - `searchTerm`/`filteredCourses` logic was present, but users had no UI to change search term.
  - This created dead logic and reduced editing efficiency for larger schedules.
- Impacted code blocks:
  - `DataEditor` action bar
  - `DataEditor` course card list (`filteredCourses`)
- Remediation:
  - Add search input in the action bar and bind to `searchTerm`.

### 3. 3D voxel list used index-based React keys
- Severity: Medium-Low
- File:
  - `components/Visualization3D.tsx`
- Risk:
  - `key={index}` may cause unstable reconciliation when dataset changes order/shape, producing visual glitches.
- Impacted code blocks:
  - `Visualization3D` voxel rendering loop
- Remediation:
  - Use deterministic voxel keys based on course/time dimensions.
  - Tighten voxel list typing (remove `any[]`).

## Change Safety Notes

- No path changes.
- No component/file renames.
- No import path rewrites across modules.
- Data model (`Course`) and public props signatures remain unchanged.

## Verification Status

- `npm run typecheck`: PASS
- Full `npm test`: previously blocked in `clean` step on Windows due to `EPERM` deleting a locked file under `dist/assets`.
