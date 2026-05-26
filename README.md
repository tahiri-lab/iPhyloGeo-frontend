# iPhyloGeo — Frontend

Web interface for [iPhyloGeo](https://github.com/tahiri-lab/iPhyloGeo), a platform for phylogeographic analysis that correlates genetic sequences with climatic and geographic data.

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI | React 19 + TypeScript |
| Build | Vite 8 |
| Routing | React Router v7 |
| Charts | Recharts |
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
| `/upload` | UploadPage | Drag-and-drop file upload and pipeline launch |
| `/settings` | SettingsPage | Analysis parameter configuration |
| `/results` | ResultsPage | Results viewer with charts and phylogenetic trees |
| `/graph` | GraphPage | Interactive Cytoscape tree visualization |

---

## Project Structure

```
src/
├── assets/              # Images and videos
├── components/
│   ├── atoms/           # Base UI elements (Button, Badge, Spinner, ProgressBar…)
│   ├── molecules/       # Composite components (EmailInput, AlignmentViewer, ClimateChartBuilder…)
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
│   └── GraphPage/
├── router/              # React Router configuration
├── services/
│   └── api.ts           # Typed API client (upload, jobs, results, settings, preview)
├── test/                # Test setup
└── utils/               # Utility functions (newickParser, validation, svgExport)
```

---

## Features

- **Multi-language UI** — English, French, and Spanish; selection persisted across sessions
- **Dark / Light theme** — toggle persisted to `localStorage`, applied via CSS variables
- **Drag-and-drop upload** — CSV/Excel for climate data, FASTA for genetic sequences
- **Real-time job polling** — live progress indicator with optional email notification
- **Phylogenetic tree visualization** — zoomable SVG trees and interactive Cytoscape graph layouts
- **Results export** — XLSX download, SVG chart and tree export
- **Settings persistence** — analysis parameters saved to and loaded from the backend
- **Debug panel** — server status, error log, and app dependency graph (dev only)

---

## API Overview

The frontend communicates with the iPhyloGeo backend via a typed client in [src/services/api.ts](src/services/api.ts).

| Group | Method | Endpoint | Description |
|---|---|---|---|
| Upload | POST | `/api/upload/climatic` | Upload CSV/Excel climate file |
| Upload | POST | `/api/upload/genetic` | Upload FASTA sequence file |
| Jobs | POST | `/api/jobs` | Create and launch analysis job |
| Jobs | GET | `/api/jobs/{id}/status` | Poll job progress |
| Results | GET | `/api/results` | List all results |
| Results | GET | `/api/results/{id}` | Get single result |
| Results | DELETE | `/api/results/{id}` | Delete result |
| Results | GET | `/api/results/{id}/download` | Download XLSX |
| Settings | GET | `/api/settings` | Fetch analysis settings |
| Settings | PUT | `/api/settings` | Save analysis settings |

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
4. Deploy.

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
