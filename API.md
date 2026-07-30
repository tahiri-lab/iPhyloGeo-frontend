# API Contract

Detailed request/response shapes for the endpoints consumed by [src/services/api.ts](src/services/api.ts). For a one-line-per-endpoint summary see the [API Overview table in README.md](README.md#api-overview).

All requests are sent with `credentials: "include"` (cross-origin cookies). Non-2xx responses throw `Error(body.detail ?? "HTTP <status>")` — see `request()` in `api.ts`.

Cross-checked against the [tahiri-lab/iPhyloGeo-backend](https://github.com/tahiri-lab/iPhyloGeo-backend) upstream repo, which implements every endpoint below including pagination, `check-name`, `rerun`, and `settings/reset`.

## Upload — `upload.*`

| Function | Request | Response |
|---|---|---|
| `upload.climatic(file)` | `POST /api/upload/climatic`, multipart `file` (`.csv`/`.xlsx`/`.xls`, ≤50MB) | `{ file_id: string }` |
| `upload.genetic(file)` | `POST /api/upload/genetic`, multipart `file` (`.fasta`, ≤50MB) | `{ file_id: string }` |
| `upload.aligned(file)` | `POST /api/upload/aligned`, multipart `file` (`.fasta`/`.json`) | `{ file_id: string }` |
| `upload.tree(file)` | `POST /api/upload/tree`, multipart `file` (`.json`) | `{ file_id: string }` |

Uploaded files are stored server-side (MongoDB) and referenced by `file_id` in subsequent calls — the file content itself is never re-sent.

## Previews — `preview.*`

| Function | Request | Response |
|---|---|---|
| `preview.climatic(fileId)` | `GET /api/upload/climatic/{fileId}/preview` | `ClimaticPreview { columns: string[], rows: Record<string, unknown>[] }` (first 200 rows) |
| `preview.genetic(fileId)` | `GET /api/upload/genetic/{fileId}/preview` | `GeneticPreview { sequences: Record<string,string>, full_length: number }` (sequences truncated to 300 chars) |

## Jobs — `jobs.*`

| Function | Request | Response |
|---|---|---|
| `jobs.create(body)` | `POST /api/jobs`, JSON `CreateJobRequest` | `{ result_id: string }` |
| `jobs.status(resultId)` | `GET /api/jobs/{resultId}/status` | `JobStatus` |

`CreateJobRequest` requires `climatic_file_id` plus **exactly one** genetic source (`genetic_file_id` for raw FASTA to align, `aligned_genetic_file_id` for a pre-aligned file, or `genetic_tree_file_id` for a pre-computed tree). `jobs.create` records the returned `result_id` in `localStorage` (see "Safari result tracking" below) so it survives even if third-party cookies are blocked.

`JobStatus.status` progresses through: `pending → climatic_trees → alignment → genetic_trees → output → complete`, or `error` / `not_found`.

`CreateJobRequest.settings`, when present, is stored on the result document and used as a full one-off override for that run (`settings_override` in the pipeline) — it replaces the global settings entirely for this job rather than merging field-by-field, and it does **not** overwrite the global settings file. This is what lets Upload's inline per-analysis settings differ from whatever's saved on the Settings page. Since `UploadPage` seeds its local settings state from `settings.get()` before letting the user edit them, the object it sends is normally complete; omitting the field entirely (or passing `{}`) instead falls back to whatever's in the global settings file at run time.

## Results — `results.*`

| Function | Request | Response |
|---|---|---|
| `results.list(params?)` | `GET /api/results?limit=&skip=&ids=` | `ResultsPage { data: AnalysisResult[], total, skip, limit }` |
| `results.get(id)` | `GET /api/results/{id}` | `AnalysisResult` |
| `results.delete(id)` | `DELETE /api/results/{id}` | `204 No Content` |
| `results.download(id)` | `GET /api/results/{id}/download` | `Blob` (`.xlsx`) |
| `results.email(id, email, lang?)` | `POST /api/results/{id}/email` | `{ message: string }` |
| `results.checkName(name)` | `GET /api/results/check-name?name=` | `{ taken: boolean }` |
| `results.rerun(id, settings, name?)` | `POST /api/results/{id}/rerun` | `{ result_id: string }` |

`results.list` normalizes a legacy plain-array response (older backends) into the `ResultsPage` envelope, and merges in any result IDs cached in `localStorage` via the `ids` query param — this is what lets a browser without third-party cookies still see results it created. Server-side, the backend unions the `ids` query param with whatever IDs are in the session cookie, so a result is visible if it's known through *either* mechanism; if neither yields any IDs, the list comes back empty rather than returning every result in the database (there's no "list everyone's results" mode).

`results.rerun` creates a **new** result (new `result_id`) that reuses the original's uploaded files but applies the given `settings` as that run's override, rather than mutating the original result in place.

## Settings — `settings.*`

| Function | Request | Response |
|---|---|---|
| `settings.get()` | `GET /api/settings` | `AnalysisSettings` |
| `settings.update(body)` | `PUT /api/settings`, JSON `AnalysisSettings` | `AnalysisSettings` |
| `settings.reset()` | `POST /api/settings/reset` | `AnalysisSettings` |

These settings are **global**, stored server-side as a flat JSON file (`genetic_settings_file.json`), not per-user or per-session. `AnalysisSettings` fields map 1:1 to `aphylogeo` pipeline parameters (alignment method, distance method, thresholds, permutation counts, etc.) — see the type definition in `api.ts` for the full field list and allowed enum values.

## Safari result tracking

Because Safari's Intelligent Tracking Prevention blocks cross-origin cookies, the frontend keeps its own list of result IDs in `localStorage['iphylogeo_result_ids']` (see the top of `api.ts`). `jobs.create`, `results.get`, and `results.rerun` all add to this list; `results.list` sends it as `?ids=` so the backend can return results even without a session cookie.
