# Workbook Persistence Audit

_Date: 2025-10-04_

This document captures the verification steps and findings from the persistence audit of the "Sổ tay công tác" module.

## Scope

- Ensure weekly workbook metadata is created once per user/week
- Confirm day entries (main focus, tasks, notes, progress) are stored in `workbook_entries`
- Validate quick task interactions (add, toggle, delete, batch, templates, paste) persist updates
- Check quick notes panel saves to `workbooks.quick_notes`
- Verify status updates and week navigation rely on server data

## Key Observations

1. **Workbook bootstrap**
   - `WorkbookController.index` calls `Workbook.findByWeek`; if no record, `Workbook.create` inserts a `draft` workbook. Returned `workbook.id` propagates to the view via `data-workbook` attributes.
   - Database queries guard against mysql2's array format to avoid `undefined` rows.

2. **Day entry persistence**
   - All write paths eventually POST to `/workbook/entry`, handled by `WorkbookController.saveEntry`.
   - Controller validates ownership, normalises task payload (stringifies arrays), and calls `WorkbookEntry.createOrUpdate` which decides between `INSERT` and `UPDATE` using the unique `(workbook_id, day_of_week)` key.
   - Progress defaults to 0 when not supplied; DB constraint `chk_progress_range` rejects out-of-range values.

3. **Quick task manager**
   - `public/js/workbook-enhanced.js` keeps a `currentEntries` cache. Every mutation (`addTaskEnhanced`, `toggleTask`, `deleteTask`, `addBatchTasks`, `applyQuickTemplate`, `pasteFromClipboard`, inline edit) updates the cache and then invokes `persistEntry` which POSTs JSON `{workbook_id, day_of_week, tasks, ...}` with `credentials: 'same-origin'` so session cookies are included.
   - `fetchEntry` normalises server responses, parsing `entry.tasks` JSON strings before updating the cache.

4. **Modal workflow**
   - Opening a day pulls fresh data via `/workbook/entry`. Submitting the form reuses the same endpoint, ensuring parity between modal edits and inline quick actions.

5. **Quick notes**
   - `saveQuickNotes` PUTs to `/workbook/:id/notes`; controller double-checks ownership and uses `Workbook.updateQuickNotes` to persist the longtext field.
   - `loadQuickNotes` lazily fetches the existing value on page init.

6. **Status + week management**
   - Week creation POSTs `/workbook/create`, protected by `Workbook.findByWeek` to prevent duplicates.
   - Submissions PUT `/workbook/:id/status` and rely on server-side validation of allowed states.
   - Week navigation (`/workbook/find`) ensures redirection uses persisted workbook IDs instead of building data client-side.

7. **Database schema safety nets**
   - `workbook_entries` enforces unique `(workbook_id, day_of_week)`, ensuring updates target the same row.
   - CHECK constraints verify `day_of_week` ∈ [1,7] and `progress` ∈ [0,100]; any invalid payload is rejected at the DB level.

## Recommended Regression Checks

1. Create a new workbook week and confirm a single `workbooks` row is inserted.
2. For each day: add, toggle, inline-edit, batch-add, template-add, and delete tasks; verify `workbook_entries.tasks` stores the resulting JSON array.
3. Update main focus, notes, progress via the modal and confirm the DB row reflects changes.
4. Enter quick notes and ensure `workbooks.quick_notes` stores the text.
5. Submit the workbook (`status = 'submitted'`) and verify the status badge, then inspect the DB row.
6. Reload the page to ensure all persisted data renders correctly.

All automated fetches now operate over HTTP on localhost to avoid SSL issues; HSTS is disabled in development, and the layout script forces `https://localhost` visitors onto `http://127.0.0.1`. With these safeguards, every data path reaches the Express controllers and commits to MySQL.
