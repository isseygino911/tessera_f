# Conventions

Code-style and structure rules for `client/`. Behaviour and visuals are never
affected by these rules — they only govern where files live and how they're
formatted.

## Target structure

```
src/
  main.jsx            entry: imports styles/index.css, renders <App/>
  App.jsx             routes + StoreLayout
  components/         shared UI
    Header.jsx  SiteFooter.jsx  ProductCard.jsx  TrustStrip.jsx
    QtyStepper.jsx  ProductPhoto.jsx  BrandMark.jsx
    styles/           one CSS file per component, same name (Header.css …)
  pages/
    store/  LandingPage.jsx  ProductPage.jsx  CartPage.jsx  CheckoutPage.jsx  ThanksPage.jsx
            styles/  LandingPage.css  ProductPage.css
                     shop.css   (shared by the 3 checkout-flow pages)
    admin/  AdminApp.jsx … all admin pages
            styles/  admin.css  (imported by AdminLayout.jsx and LoginPage.jsx — LoginPage
                     renders outside AdminLayout, so it needs it directly)
  hooks/     useLanding{Hero,Reveal,Stones,Story}Motion.js  useProductMotion.js
  context/   CartContext.jsx  AdminAuthContext.jsx
  lib/       api.js  formatPrice.js  motion.js  productImage.js  checkoutValidation.js
  data/      landingContent.js  photoManifest.js  productFacts.js
  styles/    index.css (only @imports, in order)  tokens.css  base.css  primitives.css
  test/      setup.js + all tests, mirroring src/ paths
             (test/pages/store/LandingPage.test.jsx tests pages/store/LandingPage.jsx)
```

## Where does my new file go?

1. Is it a route? → `pages/<area>/`.
2. Is it UI reused by more than one page, or by layout? → `components/`.
3. Is it a `useX` hook? → `hooks/`.
4. Is it a React context provider? → `context/`.
5. Is it static content or a manifest (no logic)? → `data/`.
6. Is it framework-free logic/helpers? → `lib/`.
7. Is it global CSS (tokens, reset, cross-area primitives)? → `styles/`.
8. Anything else — ask before adding a new top-level folder.

## Naming

- Components and pages: PascalCase `.jsx`.
- Modules (`lib/`, `data/`): camelCase `.js`.
- Hooks: `useX.js`.
- CSS lives in a `styles/` subfolder next to the files it styles, and takes the
  exact name of the component or page (`ProductCard.jsx` →
  `styles/ProductCard.css`). Global CSS is the only CSS in `src/styles/`.
- CSS shared by several pages in the same area lives in that folder's
  `styles/` with a lowercase name (`shop.css`, `admin.css`).

## CSS

- `styles/tokens.css` — `:root` custom properties only. No selectors beyond
  `:root`.
- `styles/base.css` — reset, element styles, `.app-shell`/`.app-main`, focus
  handling, `.lux`, smooth scroll.
- `styles/primitives.css` — classes used across areas: `.btn*`, `.btn-outline`,
  `.btn-gold`, forms, `.container`, `.site-container`, `.eyebrow`, `.blend`,
  `.toolbar`, `.product__actions`. A BEM-shaped name doesn't guarantee page
  scope: if a class is used from more than one area (e.g. `.product__actions`
  styles the store product page's buy row and is reused by the admin product
  form), it belongs in `primitives.css`, not in either page's CSS.
- Every component or page imports its own `./styles/X.css` file directly.
- Class names use BEM: `block__el--mod`.
- Page CSS is scoped under that page's root class (`.landing`, `.pd`, `.shop`,
  `.admin-shell`) — never bare element selectors at page scope.
- Colours always come from tokens (`var(--token-name)`), never literal hex/rgb
  values.

## Imports

Order, top to bottom, with no blank lines between groups:

1. External packages
2. `@/…` absolute imports (anything outside the current folder — never `../`)
3. Same-folder relative imports
4. The CSS import (always last)

```js
import { useEffect, useState } from 'react';
import { api } from '@/lib/api.js';
import { formatPrice } from '@/lib/formatPrice.js';
import ProductPhoto from './ProductPhoto.jsx';
import './styles/ProductCard.css';
```

- `@/` maps to `src/` (configured in `vite.config.js` `resolve.alias` and
  mirrored in `jsconfig.json` `paths` so editors resolve it too).
- Keep explicit file extensions on imports, as the codebase does today.

## Data and state

Who may call `api` (from `lib/api.js`, the only module that calls `fetch`):

- **Context** — data read by more than one page, or session-long state
  (admin session, cart, product catalogue). Consumed only via its hook
  (`useCart()`, `useAdminAuth()`).
- **Pages** — data only that page needs, and actions (submit, save, status
  change).
- **Components** — never. Data in via props, events out via `onX` callbacks.

Rule of thumb: read by more than one page → context; otherwise → page.

- Keep state local; derive values during render instead of mirroring them in
  state. Resetting state when a prop changes happens during render (`prevX`
  pattern), not in an effect.
- Every data view renders loading, error, and empty states.
- No data/state library (React Query, Redux, …) without asking.

## Code splitting

- `App.jsx` loads the whole `admin/` area lazily: `const AdminApp = lazy(() =>
import('@/pages/admin/AdminApp.jsx'))`, wrapped in `<Suspense>`. This keeps
  admin-only code (and `admin.css`, pulled in via `AdminLayout`/`LoginPage`) out
  of the storefront's main bundle — confirmed by the separate
  `AdminApp-*.js`/`AdminApp-*.css` chunks in `npm run build` output.
- Anything imported only from inside `pages/admin/` rides along in that chunk
  automatically; no extra setup needed when adding a new admin page.

## Exports

- Components and pages: default export.
- Hooks, `lib/`, `data/`, `context/`: named exports.

## Tests

- All tests live in `src/test/`, mirroring the path of the file under test:
  `pages/store/ProductPage.jsx` → `test/pages/store/ProductPage.test.jsx`.
- Tests import the code under test with `@/…` paths, never relative ones.
- Written with Vitest and React Testing Library.

## Formatting and linting

- Prettier: `singleQuote`, `semi`, `printWidth: 100`, `trailingComma: 'es5'`.
  Run `npm run format` / `npm run format:check`.
- ESLint flat config (`eslint.config.js`): `@eslint/js` recommended,
  `eslint-plugin-react-hooks` recommended, `eslint-plugin-react-refresh`, and
  browser globals via `globals`, with a `globals.vitest` override for test
  files. Run `npm run lint` / `npm run lint:fix`.
