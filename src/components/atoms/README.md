# components/atoms/

Smallest, most reusable UI pieces — no API calls, minimal internal state (besides pure UI state like zoom/drag). Styled with inline `style` objects and CSS variables (`var(--...)`), not a CSS-in-JS library or utility classes, except where noted.

| Component | Purpose |
|---|---|
| `Button` | Styled button with named color variants (`primary`, `actions`, `error`, …) |
| `Badge` | Small uppercase status pill |
| `Spinner` | Loading indicator (uses global `@keyframes spin`) |
| `ProgressBar` | Percentage fill bar for job progress |
| `CoffeeLoader` | Full-screen "analysis running" modal with animated mug + optional email capture |
| `PhyloTree` | Static SVG cladogram renderer for a single Newick string (pan/zoom/export) |
| `PageGrid` | Equal-width CSS grid layout + `PageField` label wrapper + shared `inputStyle` |

## Before adding a new atom

Check `../../styles/commonStyles.ts` first — several cross-cutting inline styles (e.g. `selectStyle`, `zoomBtnStyle`) already live there rather than in a component, specifically so plain `<select>`/`<button>` elements across different files can share a look without wrapping them in a component.

## PhyloTree vs. CytoscapeTree

`PhyloTree` here draws a fixed cladogram from scratch (see its own `buildLayout` function) with no external graph library — used in ResultsPage's paginated tree grid. The interactive, draggable version used in GraphPage/ComparePage is `CytoscapeTree` (in `molecules/`), built on Cytoscape.js. They intentionally don't share layout code — if a tree bug shows up, check which one you're actually looking at.
