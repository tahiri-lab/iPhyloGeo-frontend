# pages/

Route-level components, one folder per route (see the [routing table in README.md](../../README.md#routes) and [src/router](../router/README.md)). Each page owns its own data fetching via `services/api` — there's no shared page-level state container.

| Page | Route | Owns |
|---|---|---|
| `HomePage` | `/` | Theme-aware hero video, no API calls |
| `UploadPage` | `/upload` | File upload, inline per-run settings, job creation + polling |
| `SettingsPage` | `/settings` | Global pipeline settings (get/update/reset) |
| `ResultsPage` | `/results` | Result list + detail: trees, output table, charts, re-run/delete/email/download |
| `GraphPage` | `/graph` | Single-result interactive Cytoscape tree viewer |
| `ComparePage` | `/compare` | Two-result side-by-side diff view |

## Shared patterns worth knowing before editing any of these

- **Output parsing** — `ResultsPage` and `ComparePage` each define their own `parseOutput()` that splits a result's flat `output: Record<string, CellVal[]>` table into chart points and a trailing statistics block (keyed by `STAT_KEYWORDS`). They're near-identical; if you need to change this logic, check both files.
- **Settings: global vs. per-run** — `SettingsPage` edits the global settings (`GET`/`PUT /api/settings`). `UploadPage`'s inline form and `ResultsPage`'s "edit config" panel both send settings as a one-off override on `jobs.create`/`results.rerun` — they don't touch the global file. See [API.md](../../API.md) before assuming one implies the other.
- **List → detail upgrade** — `GraphPage` and `ComparePage` both hold a `results.list()` result (which may omit tree/output data) and lazily re-fetch the full result via `results.get()` only when the user actually selects it, to avoid pulling every tree payload up front.
- **Loading/error states** — every page follows the same `if (loading) return <Spinner/PageSection>` / `if (error) return <p>` early-return shape before the main render. Match it if you add a page.
