# Multi-Semester + Time Machine MVP Test Report

Date: 2026-02-27
Environment: local dev (`http://127.0.0.1:4173/schedule/`)
Scope: `复盘 > 本学期 / time machine`, multi-semester storage, CSV import/export, legacy migration, Void Drop payload compatibility

## 1) Code Changes Verified in This Round

- `hooks/useCoursesStore.ts`
  - Added deterministic unique semester naming (`buildUniqueSemesterName`)
  - New semester creation now avoids duplicate names (e.g. `2026年1学期 (2)`)
- `components/VoidDropModal.tsx`
  - Migrated to store-payload API (`onExportStorePayload`, `onImportStorePayload`)
- `App.tsx`
  - Updated Void Drop props to match new modal contract

## 2) White-Box Verification

### 2.1 Type and Build

- `npm run typecheck` -> PASS
- `npm test` (`typecheck + clean + build`) -> PASS
- `npm run build` -> PASS

Notes:
- One temporary `EBUSY` build error occurred only when two builds were started in parallel and both touched `dist/`; sequential build passed immediately.
- Existing Vite chunk-size warning remains (pre-existing, non-blocking for MVP).

### 2.2 Storage Schema / Migration Assertions

Using browser runtime checks via `localStorage.getItem('zcanic_courses_v7')`:

- Fresh initialization creates schema:
  - `version: 8`
  - `semesters.length: 1`
  - active semester defaults to `2026年1学期`
- Legacy array migration test:
  - Manually wrote legacy `Course[]` to storage
  - Reload migrated successfully to v8 store wrapper
  - Created semester name: `Legacy 导入学期`
  - Course data preserved

## 3) Black-Box Functional Verification

### 3.1 UI Structure (Requested MVP)

- `复盘` tab contains:
  - `本学期`
  - `time machine`
- `time machine` contains sub-tabs:
  - `学期管理`
  - `全部课程`
- `本学期` shows original review analytics/grid behavior

Result: PASS

### 3.2 Semester Management

- Created new semester via `学期管理 > 新建学期` prompt (`2025年2学期`)
- Active semester switched to newly created one
- Semester list and snapshot panel updated accordingly

Result: PASS

### 3.3 Cross-Semester Import Coexistence

Scenario: current semester = `2025年2学期`, import CSV metadata semester = `2026年1学期`.

- When confirm = `确定` (create new semester):
  - New semester created
  - Existing semester data preserved
  - After duplicate-name fix, imported semester becomes `2026年1学期 (2)` (unique)
- When confirm = `取消` (import into current semester):
  - Semester count unchanged
  - Current semester replaced with imported course set

Result: PASS

### 3.4 CSV Export / Re-import Roundtrip

- Exported CSV from DataEditor includes metadata headers:
  - `# zcanic_schedule_csv_v2`
  - `# semester:<active semester name>`
- Re-import of generated format succeeds and restores course fields (`name/day/row/type/weeks/location`)
- Legacy CSV (without metadata headers) imports correctly to current semester

Result: PASS

### 3.5 Time Machine Course Aggregation

- `time machine > 全部课程` renders merged cross-semester course list
- Pagination controls render and enable/disable properly at boundaries

Result: PASS

## 4) Data Integrity Focus (User Critical Concern)

Validated against requested concern:

- "Only 26-1 exists, then import 25-2" -> both periods coexist as independent semesters.
- Import parser behavior:
  - v2 CSV with `# semester:` supports cross-semester decision path.
  - legacy CSV without metadata falls back to current semester replacement flow.
- Self-export/self-import compatibility:
  - Exported CSV can be imported back with expected value fidelity.

## 5) Known Non-Blocking Items

- TypeScript LSP diagnostics tool unavailable in this environment (`typescript-language-server` not installed).
  - Compensated with `tsc --noEmit` and full build/test checks.
- Build chunk-size warning exists but does not affect correctness.

## 6) Conclusion

MVP requirements are implemented and validated:

- New review hierarchy (`本学期` / `time machine`) is working.
- Semester management + all-course management pages are functional.
- Multi-semester persistence, migration, and import/export coexistence are working.
- Cross-semester import behavior now avoids ambiguous duplicate semester names.

Overall status: PASS (MVP complete)
