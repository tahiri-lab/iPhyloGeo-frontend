# router/

`index.tsx` is the only file here: it defines the `router` (a `createBrowserRouter` instance, consumed by `<RouterProvider>` in [App.tsx](../App.tsx)) and two prefetch helpers built on the same lazy `import()` calls.

- **Adding a route:** add a `const importXPage = () => import('../pages/XPage/XPage')`, wrap it with `lazy()`, add a case to `prefetchRoute()`, and add an entry to the `router` array (wrapped in `<AppLayout>` + `<Suspense fallback={<RouteLoader />}>` like the others, unless it needs a bare layout like `/` does with `hideNav`).
- **`prefetchRoute(path)`** — triggers the dynamic import for one route without navigating. Used by `NavBar` on link hover so the chunk is likely already cached by the time the user clicks.
- **`prefetchLikelyRoutes()`** — prefetches Upload + Results specifically; called once by `NavBar` on mount during idle time, as a bet on the most common next destination.

See [ARCHITECTURE.md](../../ARCHITECTURE.md#routing) for why prefetching exists and how it fits into the rest of the app.
