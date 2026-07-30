# components/molecules/

Composite components built from atoms, usually with their own local state and sometimes their own chart/graph rendering. Each folder is self-contained (component + nothing else).

| Component | Used in | Purpose |
|---|---|---|
| `AnalysisSettingsForm` | Upload, Settings, Results (edit-config panel) | The full pipeline-settings form; `readOnly` mode reuses the same layout for viewing |
| `BootstrapChart` | Results, Compare | Dual-axis bootstrap-mean/distance line chart (Recharts) |
| `ClimateChartBuilder` | Upload | Ad-hoc table + chart builder over a climatic file preview |
| `AlignmentViewer` | Upload | MSA-style genetic sequence preview with conservation/gap bars |
| `CytoscapeTree` | Graph, Compare | Interactive pan/zoom tree (`TreeGraph`) built on Cytoscape.js, plus its element/stylesheet builders |
| `EmailInput` | Results | Simple email + send button, with local format validation |
| `HelpSection` | Upload, Settings | Layout wrapper for the "how it works" / parameter-guide help blocks |
| `Pagination` | Results, Compare, Graph (via `TreePagination`) | Generic paginated grid for a list of trees |
| `SearchBar` | Results, Compare | Filterable combobox for picking a result (search by name/status/date) |

## Two tree renderers, on purpose

`CytoscapeTree`'s `TreeGraph` (interactive, draggable, used in Graph/Compare) and `atoms/PhyloTree` (static SVG, used in Results' paginated grid) both parse the same Newick format but lay it out independently — see the comparison note in `atoms/README.md`. If you're fixing a tree rendering bug, confirm which component actually renders the view you're looking at before editing.

## Output parsing lives in the pages, not here

`BootstrapChart` and `AlignmentViewer`/`ClimateChartBuilder` render already-shaped data; the table-splitting logic that produces `chartData`/`statMap` (`parseOutput`) lives in `ResultsPage.tsx` and `ComparePage.tsx` respectively, not in a shared molecule — see `pages/README.md`.
