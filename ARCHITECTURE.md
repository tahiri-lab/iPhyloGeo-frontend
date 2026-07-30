# Architecture

This complements [README.md](README.md) (tech stack, scripts, folder layout) with *how the pieces connect* — provider nesting, routing strategy, and the data flow through a typical analysis run. For endpoint-level detail see [API.md](API.md).

## Provider tree

```
<ThemeProvider>              # light/dark, localStorage
  <LanguageProvider>          # en/fr/es, localStorage
    <DevToolsProvider>        # in-memory error log, dev panel only
      <RouterProvider>        # React Router v7, createBrowserRouter
```

Order matters only in that outer providers must not depend on inner ones — none of the three do, so nesting order here is arbitrary and safe to reorder if a future provider needs it. See [src/App.tsx](src/App.tsx).

There is no global data-fetching or app-wide state library (no Redux/Zustand/React Query). Server data is fetched directly with the `api` client inside the page that needs it, held in local `useState`, and re-fetched on demand — see "Data flow" below.

## Routing

[src/router/index.tsx](src/router/index.tsx) defines all six routes with `createBrowserRouter`. Every page component is lazy-loaded (`React.lazy`) and wrapped in `<Suspense>`; `AppLayout` wraps every route except `/` (passed `hideNav` for the landing page, which has its own full-bleed layout).

**Prefetching:** `prefetchRoute(path)` and `prefetchLikelyRoutes()` expose the same dynamic `import()` calls used for lazy-loading, so other code can warm the module cache ahead of navigation. Two call sites:
- `NavBar` prefetches a route's chunk on link hover.
- `NavBar` also calls `prefetchLikelyRoutes()` (Upload + Results) on mount, during browser idle time (`requestIdleCallback`, falling back to a `setTimeout`), on the theory that most sessions head there next.

This is a performance optimization only — it has no effect on correctness, and a route works fine even if never prefetched.

## Layout

`AppLayout` (in `components/templates/`) renders `<NavBar>` + `<main>` + `<DevToolsPanel>` side by side with `flex`. The sidebar is `position: sticky`; the two CSS comments in that file (`CRITICAL: align-items flex-start...`, `CRITICAL: no overflow hidden/auto...`) document constraints that are easy to accidentally break when touching that file — read them before changing the layout's flex/overflow rules.

## Data flow: a typical analysis run

1. **UploadPage** — user drags in a climatic file and a genetic file (or a pre-aligned/pre-tree variant). Each upload immediately calls `api.upload.*`, storing the returned `file_id`. A debounced preview call (`api.preview.*`) shows a sample of the parsed data.
2. Still on **UploadPage**, the user optionally expands the inline settings form (`AnalysisSettingsForm`, shared with SettingsPage), seeded from the current global settings, and adjusts pipeline parameters for this run only. Submitting calls `api.jobs.create({ climatic_file_id, genetic_file_id, settings, ... })` directly — the edited settings travel with the job as a one-off override and are never written back to the global settings file (see API.md's Jobs section). This returns a `result_id`.
3. The app polls `api.jobs.status(result_id)` on an interval, driving a progress UI through the `pending → climatic_trees → alignment → genetic_trees → output → complete` states.
4. On completion, the user is routed to **ResultsPage** (`/results?id=<result_id>`). It fetches the full `AnalysisResult` via `api.results.get(id)` and renders trees (`PhyloTree`, paginated), the bootstrap chart, and the output table. A result can be re-run with different settings (`api.results.rerun`), emailed (`api.results.email`), or downloaded as XLSX (`api.results.download`).
5. **ComparePage** and **GraphPage** work off the same `AnalysisResult` shape but render two results side-by-side (diffing `settings`) or a single interactive Cytoscape graph, respectively.

Every result carries its own `settings` snapshot (`AnalysisResult.settings`) so Results/Compare can show *what parameters produced this run*, even though changing settings going forward only affects future jobs (see the global-vs-per-run distinction in API.md).

## Safari cookie workaround

Because the backend session relies on a cross-origin cookie that Safari's ITP blocks, `services/api.ts` mirrors every result ID the client has seen into `localStorage['iphylogeo_result_ids']` and sends it back as `?ids=` on `GET /api/results`. This is why `results.list()` still shows a user's own results even in a fully third-party-cookie-blocked browser. See API.md's "Safari result tracking" section before changing how results are looked up or filtered.

## i18n

All user-facing strings live in `Translations` in [LanguageContext.tsx](src/context/LanguageContext.tsx), one object per language. There's no external i18n library or lazy-loaded locale bundles — all three languages ship in the main bundle. Adding a string means adding the key to the interface and a value in all three locale objects (TypeScript enforces this).
