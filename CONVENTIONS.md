# Conventions

Code-style and structure rules for `client/`. Behaviour and visuals are never
affected by these rules — they only govern where files live and how they're
formatted.

## Target structure

```
src/
  main.jsx            entry: imports styles/index.css, renders <App/>
  App.jsx             routes + StoreLayout
  components/         shared UI; each component's CSS sits next to it with the same name
    Header.jsx  Header.css   SiteFooter.jsx  SiteFooter.css   ProductCard.jsx  ProductCard.css
    TrustStrip.jsx  TrustStrip.css   QtyStepper.jsx  QtyStepper.css   ProductPhoto.jsx  ProductPhoto.css
    BrandMark.jsx  BrandMark.css   Ornament.jsx  Ornament.css
  pages/
    store/  LandingPage.jsx  LandingPage.css  LandingPage.test.jsx
            ProductPage.jsx  ProductPage.css  ProductPage.test.jsx
            CartPage.jsx  CheckoutPage.jsx  ThanksPage.jsx  shop.css   (shared by the 3 checkout-flow pages)
    admin/  AdminApp.jsx … all admin pages  admin.css   (today's "Admin" block from index.css;
            imported by AdminLayout.jsx and LoginPage.jsx — the two admin entry points that
            render outside AdminLayout's own children still need it directly)
  hooks/     useLandingMotion.js  useProductMotion.js
  context/   CartContext.jsx  CartContext.test.jsx  AdminAuthContext.jsx
  lib/       api.js  formatPrice.js  motion.js  productImage.js  checkoutValidation.js (+ .test.js)
  data/      photoManifest.js  productFacts.js
  styles/    index.css (only @imports, in order)  tokens.css  base.css  primitives.css
  test/      setup.js
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
- A CSS file takes the exact name of the component or page it styles
  (`ProductCard.jsx` → `ProductCard.css`).
- CSS shared by several pages in the same area lives at the folder level with
  a lowercase name (`shop.css`, `admin.css`).

## CSS

- `styles/tokens.css` — `:root` custom properties only. No selectors beyond
  `:root`.
- `styles/base.css` — reset, element styles, `.app-shell`/`.app-main`, focus
  handling, `.lux`, smooth scroll.
- `styles/primitives.css` — classes used across areas: `.btn*`, `.btn-outline`,
  `.btn-gold`, forms, `.container`, `.eyebrow`, `.mono-label`, `.chip`,
  `.swatch`, `.blend`, `.warm-frame`, `.section-title`, `.toolbar`,
  `.product__actions`. A BEM-shaped name doesn't guarantee page scope: if a
  class is used from more than one area (e.g. `.product__actions` styles the
  store product page's buy row and is reused by the admin product form), it
  belongs in `primitives.css`, not in either page's CSS.
- Every component or page imports its own `.css` file directly.
- Class names use BEM: `block__el--mod`.
- Page CSS is scoped under that page's root class (`.landing`, `.pd`, `.shop`,
  `.admin-shell`) — never bare element selectors at page scope.
- Colours always come from tokens (`var(--token-name)`), never literal hex/rgb
  values.

## Imports

Order, top to bottom, with a blank line between groups:

1. External packages
2. `@/…` absolute imports
3. Same-folder relative imports
4. The CSS import (always last)

```js
import { useEffect, useState } from 'react';

import { getProduct } from '@/lib/api.js';
import { formatPrice } from '@/lib/formatPrice.js';

import ProductPhoto from './ProductPhoto.jsx';

import './ProductPage.css';
```

- `@/` maps to `src/` (configured in `vite.config.js` `resolve.alias` and
  mirrored in `jsconfig.json` `paths` so editors resolve it too).
- Keep explicit file extensions on imports, as the codebase does today.

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

- Colocated next to the file under test: `X.test.jsx` / `X.test.js`.
- Written with Vitest and React Testing Library.

## Formatting and linting

- Prettier: `singleQuote`, `semi`, `printWidth: 100`, `trailingComma: 'es5'`.
  Run `npm run format` / `npm run format:check`.
- ESLint flat config (`eslint.config.js`): `@eslint/js` recommended,
  `eslint-plugin-react-hooks` recommended, `eslint-plugin-react-refresh`, and
  browser globals via `globals`, with a `globals.vitest` override for test
  files. Run `npm run lint` / `npm run lint:fix`.
