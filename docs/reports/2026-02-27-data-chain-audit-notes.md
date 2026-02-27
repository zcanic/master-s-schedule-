# Data Chain Audit Notes (2026-02-27)

Scope: multi-semester Time Machine path (storage, parsing, import, export, snapshot restore).

## Chain map (verified)

1. Bootstrap and persistence
- `hooks/useCoursesStore.ts`: `readStorage` -> `parseStoredStore` -> optional cloud bootstrap -> `setStore` -> `writeStorage`.
- Local persistence runs after init (`useEffect` on `store`).

2. Time Machine mutations
- `updateCourses` appends snapshot for active semester.
- `restoreSnapshotToActive` appends a new snapshot based on selected snapshot courses.
- `restoreSnapshotAsNewSemester` creates a new semester from snapshot courses.

3. Data import/export
- CSV export/import and Excel import live in `components/DataEditor.tsx`.
- External import routes through `importFromExternal` in `hooks/useCoursesStore.ts`.
- Void Drop import/export routes through `importFromVoidDropPayload` / `exportForVoidDrop`.

## Findings (priority)

### P0 / critical-like
- Cloud bootstrap precedence can still override local expectation in empty/invalid-local scenarios.
  - Current policy is safer than before (`shouldTryCloudBootstrap = !localStore`) but still needs explicit user-facing precedence messaging.
- Full-store Void Drop download is destructive by design (`setStore(parsedStore)`), now with backup, but recovery UX is still implicit.

### P1 / high
- Semester routing by name is strict equality in `importFromExternal`.
  - Trim/case/Unicode variants can route unexpectedly (new semester vs overwrite current).
- CSV delimiter is still comma-only.
  - `parseCSVRows` handles quoted commas/newlines well, but semicolon-delimited external CSV fails to split fields.

### P2 / medium
- `types.ts` uses `version: 8` literal type.
  - Runtime has `CURRENT_STORE_VERSION`; type-level literal can hinder future migrations.
- Snapshot/course arrays are stored by reference at append/create boundaries.
  - Current UI mostly uses immutable updates, but defensive cloning would reduce accidental aliasing risk.

### P3 / low
- Excel parser has heuristic defaults (`weeks` defaults to 1..16 when weeks line missing).
  - This favors import completeness but may over-approximate schedules.

## Repro notes

1. CSV quoted newline (PASS)
- `parseCSVRows` now keeps quoted newline inside one field.

2. CSV semicolon delimiter (FAIL)
- Entire row remains one cell; parser rejects as malformed (expected with current comma-only parser).

3. Formula-prefix sanitization (PASS)
- Export sanitization prefixes tab for values beginning with `= + - @`.

## Follow-up checklist

1. Add delimiter sniffing for CSV (`,`, `;`, `\t`) before parse.
2. Canonicalize semester name comparison for import routing (trim + Unicode normalize + case fold where relevant).
3. Promote schema type to numeric `version: number` and add explicit migration table.
4. Add explicit restore mode confirmation for Void Drop full-store replace vs merge.
5. Add invariant checks in tests:
   - unique course IDs within semester,
   - active semester must exist,
   - snapshots are bounded and stable.
