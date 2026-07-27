# components/organisms/

Feature-level building blocks that assemble atoms/molecules into a section of a page, plus two app-chrome components mounted by `AppLayout`.

| Component | Purpose |
|---|---|
| `NavBar` | Collapsible sidebar navigation, with route-chunk prefetching |
| `PageCard` | Rounded card surface every page's content sits in |
| `PageSection` | One divided block inside a `PageCard`, optional icon+title header |
| `SettingsView` | Read-only display of an `AnalysisSettings` snapshot — single view or two-column diff |
| `DevToolsPanel` | Floating dev panel: server latency check, error log, static app-structure diagram |

## `DevToolsPanel` is not dev-gated

Despite the name (and despite the root README previously claiming otherwise), `DevToolsPanel` is rendered unconditionally by `AppLayout` — there's no `import.meta.env.DEV` check anywhere in this codebase. It's always present as the floating `</>` button in the corner, in every build including production. If you want it dev-only, that gating needs to be added, not assumed.

Its "App Graph" tab (`APP_NODES`/`APP_EDGES` in `DevToolsPanel.tsx`) is a **hand-maintained** diagram of providers/pages/state, not derived from the source — expect it to drift out of date as the app changes.

## `PageCard` + `PageSection` layout trick

`PageCard` applies `padding: 0 24px`; each `PageSection` cancels that with `margin: 0 -24px` and re-applies its own `padding: 24px`, so a section's top border spans the card's full width. The first section in a card should pass `style={{ borderTop: 'none' }}` — see any page for the pattern.
