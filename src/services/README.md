# services/

Typed HTTP client for the iPhyloGeo backend.

- **[api.ts](api.ts)** — the only file here. Exports one namespaced object per resource (`upload`, `jobs`, `results`, `settings`, `preview`), all re-exported together as `api` (default export). Every function returns a typed `Promise` and throws a plain `Error` on non-2xx responses — there's no separate error type to catch.

For full request/response contracts and known frontend/backend gaps, see [API.md](../../API.md) at the repo root. Don't duplicate that content here — this file just orients you to where the client lives.

## Conventions used in `api.ts`

- `BASE` comes from `VITE_API_BASE_URL` (see root README's Environment Variables section).
- The internal `request<T>()` helper centralizes `fetch`, error handling, and the `credentials: "include"` needed for the cookie-based session.
- `getStoredIds`/`addStoredId` implement the Safari cookie-blocking workaround — see API.md's "Safari result tracking" section before changing how result IDs are looked up.
