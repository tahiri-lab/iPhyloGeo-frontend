# components/templates/

The two outermost layout wrappers, both consumed only from `src/router/index.tsx`.

| Component | Purpose |
|---|---|
| `AppLayout` | Sidebar + main content + DevToolsPanel shell; every route uses it, `/` passes `hideNav` |
| `PageContainer` | Centered content column with an optional `<h1>` title, nested inside `AppLayout`'s `<main>` |

`AppLayout` has a couple of `CRITICAL`-tagged comments in the source about why `alignItems: 'flex-start'` and no `overflow: hidden/auto` are load-bearing for the sidebar's `position: sticky` to work — read those before adjusting the flex/overflow rules here.
