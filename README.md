# iPhyloGeo — Frontend

Web interface for [iPhyloGeo](https://github.com/tahiri-lab/iPhyloGeo), a platform for phylogeographic analysis that correlates genetic sequences with climatic and geographic data.

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI | React 19 + TypeScript |
| Build | Vite 8 |
| Routing | React Router v7 |
| Charts | Recharts 3 |
| Tree graphs | Cytoscape.js 3 |
| Styling | Tailwind CSS v4 + CSS variables |
| Testing | Vitest + React Testing Library |

---

## Requirements

- Node.js ≥ 18
- A running instance of the [iPhyloGeo API](https://github.com/tahiri-lab/iPhyloGeo) (default: `http://localhost:8000`)

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
echo "VITE_API_BASE_URL=http://localhost:8000" > .env

# 3. Start development server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8000` | Base URL of the iPhyloGeo backend API |

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite development server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate test coverage report |

---

## Routes

| Path | Page | Description |
|---|---|---|
| `/` | HomePage | Landing page with animated video background |
| `/upload` | UploadPage | File upload, settings configuration, and pipeline launch |
| `/settings` | SettingsPage | Global analysis parameter configuration |
| `/results` | ResultsPage | Results viewer with charts, data table, and phylogenetic trees |
| `/graph` | GraphPage | Interactive Cytoscape tree visualization with layout selector |
| `/compare` | ComparePage | Side-by-side comparison of two analyses |

---

## Project Structure

```
src/
├── assets/              # Images and videos
├── components/
│   ├── atoms/           # Base UI elements (Button, Badge, Spinner, PhyloTree…)
│   ├── molecules/       # Composite components
│   │   ├── AnalysisSettingsForm/  # Shared settings form (Upload, Settings, Results)
│   │   ├── BootstrapChart/        # Bootstrap mean & distance dual-axis chart
│   │   ├── ClimateChartBuilder/   # Interactive chart builder for climatic data preview
│   │   ├── CytoscapeTree/         # Interactive phylogenetic tree via Cytoscape.js
│   │   ├── EmailInput/            # Email notification input
│   │   ├── Pagination/            # Tree pagination component
│   │   └── SearchBar/             # Searchable dropdown for result selection
│   ├── organisms/       # Feature-level components (NavBar, PageCard, DevToolsPanel…)
│   └── templates/       # Layout wrappers (AppLayout, PageContainer)
├── context/             # React contexts
│   ├── ThemeContext      # Dark / light mode, persisted to localStorage
│   ├── LanguageContext   # i18n (English, French, Spanish), persisted to localStorage
│   └── DevToolsContext   # Error log for the debug panel
├── pages/               # Route-level page components
│   ├── HomePage/
│   ├── UploadPage/
│   ├── SettingsPage/
│   ├── ResultsPage/
│   ├── GraphPage/
│   └── ComparePage/
├── router/              # React Router configuration with lazy loading
├── services/
│   └── api.ts           # Typed API client (upload, jobs, results, settings, preview)
├── styles/              # Shared style constants
├── test/                # Test setup
└── utils/               # Utility functions (newickParser, validation, svgExport)
```

---

## Features

- **Multi-language UI** — English, French, and Spanish; selection persisted across sessions
- **Dark / Light theme** — toggle persisted to `localStorage`, applied via CSS variables
- **Drag-and-drop upload** — CSV/Excel for climate data, FASTA for genetic sequences; file preview before launch
- **Inline settings per analysis** — configure alignment method, distance method, thresholds, and more directly on the upload form; settings are stored per result
- **Real-time job polling** — live progress indicator with estimated time and optional email notification
- **Results management** — view, edit configuration, re-run with new settings, delete, and download per result
- **Per-analysis configuration diff** — Compare page shows settings side-by-side with highlighted differences
- **Phylogenetic tree visualization** — paginated SVG trees (Results) and interactive Cytoscape.js graphs (Graph, Compare) with multiple layout options (top-down, left-right, radial, force)
- **Side-by-side analysis comparison** — Compare page renders genetic trees, bootstrap charts, and statistical test results for two analyses simultaneously
- **Safari compatibility** — result IDs stored in `localStorage` and sent as query parameter to work around cross-origin cookie restrictions (ITP)
- **Results export** — XLSX download, SVG chart and tree export
- **Debug panel** — server status, error log, and app dependency graph (dev only)

---

## API Overview

The frontend communicates with the iPhyloGeo backend via a typed client in [src/services/api.ts](src/services/api.ts).

| Group | Method | Endpoint | Description |
|---|---|---|---|
| Upload | POST | `/api/upload/climatic` | Upload CSV/Excel climate file |
| Upload | POST | `/api/upload/genetic` | Upload FASTA sequence file |
| Upload | POST | `/api/upload/aligned` | Upload pre-aligned genetic file |
| Upload | POST | `/api/upload/tree` | Upload pre-computed genetic tree |
| Upload | GET | `/api/upload/climatic/{id}/preview` | Preview climatic file columns and rows |
| Upload | GET | `/api/upload/genetic/{id}/preview` | Preview genetic sequences |
| Jobs | POST | `/api/jobs` | Create and launch analysis job with optional settings |
| Jobs | GET | `/api/jobs/{id}/status` | Poll job progress and estimated time |
| Results | GET | `/api/results` | List results (paginated; supports `?ids=` for Safari) |
| Results | GET | `/api/results/check-name` | Check if an analysis name is already taken |
| Results | GET | `/api/results/{id}` | Get single result with trees and output |
| Results | DELETE | `/api/results/{id}` | Delete result (returns 204 No Content) |
| Results | GET | `/api/results/{id}/download` | Download output as XLSX |
| Results | POST | `/api/results/{id}/email` | Send results-ready email notification |
| Results | POST | `/api/results/{id}/rerun` | Re-run analysis with new settings, reusing uploaded files |
| Settings | GET | `/api/settings` | Fetch global analysis settings |
| Settings | PUT | `/api/settings` | Save global analysis settings |

---

## Testing

Tests are located in `src/__tests__/` and cover utilities, React contexts, shared components, and page-level rendering.

```bash
npm test
```

Test coverage includes:

- **Utils** — `newickParser` (Newick format parsing), `validation` (email validation)
- **Contexts** — `ThemeContext` (toggle, localStorage, CSS class), `LanguageContext` (language switch, translations, localStorage)
- **Components** — `Button` (variants, interactions, disabled state), `Badge` (rendering)
- **Pages** — `HomePage`, `UploadPage`, `SettingsPage` (rendering, API integration)
- **API client** — all endpoints with mocked `fetch` (success and error cases)

---

## Deploy to Vercel

This repository is configured for Vercel with SPA route rewrites via `vercel.json`.

### Option 1: Deploy from GitHub (recommended)

1. Push this repository to GitHub.
2. In Vercel, import the repository.
3. Set the project settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
4. Add the `VITE_API_BASE_URL` environment variable pointing to your deployed backend.
5. Deploy.

### Option 2: Deploy from CLI

```bash
npm install -g vercel
vercel
```

For production deployment:

```bash
vercel --prod
```

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes following [Conventional Commits](https://www.conventionalcommits.org/)
4. Open a pull request against `main`
