# context/

React Context providers mounted once near the app root (see [App.tsx](../App.tsx)) and consumed anywhere below via their hooks. None of these talk to the backend — they hold purely client-side state.

| Provider | Hook | State | Persistence |
|---|---|---|---|
| `ThemeProvider` | `useTheme()` | `theme: 'light' \| 'dark'`, `toggleTheme()` | `localStorage['iphylogeo-theme']`; falls back to OS `prefers-color-scheme` |
| `LanguageProvider` | `useLang()` | `lang: 'en' \| 'fr' \| 'es'`, `setLang()`, `t` (translation strings) | `localStorage['iphylogeo-lang']` |
| `DevToolsProvider` | `useDevTools()` | `errors: DevError[]` (last 30), `reportError()`, `clearErrors()` | none — in-memory only, resets on reload |

## Adding a new translation string

1. Add the key to the `Translations` interface in [LanguageContext.tsx](LanguageContext.tsx).
2. Add a value for it under all three of `translations.en`, `.fr`, and `.es` — TypeScript errors on any locale missing a key, so the build will catch a forgotten translation.
3. Use it in components via `const { t } = useLang(); t.your_key`.

## Theming

`ThemeProvider` only toggles the `dark` class on `<html>`; the actual colors live in CSS variables in the stylesheets. There's no per-component theme prop — components read `var(--...)` directly in inline styles.

## DevTools

`DevToolsContext` backs the dev-only debug panel ([DevToolsPanel](../components/organisms/DevToolsPanel/DevToolsPanel.tsx)). It's a simple ring buffer of error messages for local debugging, not an error-tracking/telemetry integration.
