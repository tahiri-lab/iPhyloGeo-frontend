# utils/

Small, dependency-free helper functions — no React, no API calls (except types).

| File | Exports | Purpose |
|---|---|---|
| `newickParser.ts` | `parseNewick`, `TreeNode` | Hand-rolled Newick format parser, shared by both tree renderers |
| `svgExport.ts` | `downloadSvgElement`, `downloadSvgFromContainer` | Download a live `<svg>` as a standalone file — see below for why this isn't a one-liner |
| `validation.ts` | `validateEmail` | Basic email format regex |
| `validationParamsSettings.ts` | `validateSettings` | Client-side pre-check for `AnalysisSettings` before submitting |

## Why SVG export isn't trivial

An exported `.svg` is opened outside the page, so it has no access to this app's CSS (`var(--...)` custom properties, `.recharts-wrapper` styles, etc.). Both export functions clone the SVG, insert an explicit background `<rect>` (otherwise a dark-theme export looks like nothing on a white background), and `downloadSvgFromContainer` additionally resolves every `var(--...)` in the serialized markup to its current computed value via regex — see the JSDoc on each function before changing this.

## Known duplication: two `validateEmail`s

`utils/validation.ts` and `molecules/EmailInput.tsx` each define their own copy of the same email regex — they're not sharing one function. If the validation rule ever needs to change, update both.

## Client-side settings validation is a subset, not a mirror

`validateSettings` only checks a handful of numeric fields (window/step size, rate, permutations, thresholds) that are cheap to give instant feedback on. It does not cover everything the backend's Pydantic model validates (e.g. `permutations_mantel_test`, preprocessing thresholds) — a value that passes this check can still come back as an API error, so don't treat "no error from `validateSettings`" as "the request will succeed."
