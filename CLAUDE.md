# Client (React storefront + admin)

React 19 · Vite · React Router 7 · GSAP · plain CSS · Vitest + Testing Library.
Every change must follow the structure below. The full rules, with examples,
are in `CONVENTIONS.md`. If you change a rule, update both files in the same
change.

## Done means green

Run from `client/`. All four must pass before you report a task as done:

```
npm run lint          # 0 errors
npm run format:check  # run `npm run format` to fix
npm test
npm run build
```

When a change affects what the user sees, also check it in the browser at
1440px and 390px wide.

## Where files go

```
src/
  main.jsx, App.jsx   entry point, routes and layouts
  pages/<area>/       route components (store/, admin/)
    styles/           CSS for those pages
  components/         UI used by more than one page, or by a layout
    styles/           one CSS file per component
  hooks/              useX.js hooks
  context/            React context providers and their useX() hooks
  lib/                logic with no React in it: api, formatting, validation, motion
  data/               static content and manifests, no logic
  styles/             global CSS only: tokens, base, primitives
  test/               setup.js and all tests, with the same paths as src/
```

- Never add a file at the `src/` root, and never add a new top-level folder
  without asking.
- A component used by only one page stays inside that page file. Once the page
  is over about 250 lines, split its sections into `components/`.

## Data and state

| Layer         | May call `api`                   | Owns                                                                                                |
| ------------- | -------------------------------- | --------------------------------------------------------------------------------------------------- |
| `lib/api.js`  | the only file that calls `fetch` | request and error handling (`ApiError`)                                                             |
| `context/`    | yes                              | data that several pages read, or that lasts the whole visit: admin session, cart, product catalogue |
| `pages/`      | yes                              | data that only this page needs, and actions (submit, save, change status)                           |
| `components/` | **never**                        | nothing fetched: data comes in as props, events go out as `onX` callbacks                           |

- If data is read by more than one page, it belongs in context. Everything else
  stays in the page.
- Use a context only through its hook (`useCart()`, `useAdminAuth()`), never
  through `useContext` directly.
- Keep state local. Derive values while rendering instead of copying them into
  state. When state has to reset because a prop changes, update it during render
  (`prevX` pattern, see `ProductPage`), not in a `useEffect`. The lint rule
  `react-hooks/set-state-in-effect` enforces this.
- Every data view handles its loading, error and empty states.
- Do not add a data-fetching or state library (React Query, Redux, Zustand, …)
  without asking.

## Components and pages

- Pages and components use a default export. Hooks, `lib/`, `data/` and
  `context/` use named exports.
- Components are PascalCase `.jsx`. Modules are camelCase `.js`. Hooks are
  `useX.js`.
- Event handlers are named `handleX`, callback props `onX`, and module
  constants `UPPER_SNAKE`.
- Content (copy lists, galleries, status lists) goes in `data/`. Helpers used by
  more than one file go in `lib/`. Never copy them into a second page.
- Animation always goes through `lib/motion.js` inside a `hooks/useXMotion.js`,
  gated by `gsap.matchMedia(MOTION_OK)` so reduced-motion users get none.
- Accessibility: use semantic elements, give every section an
  `aria-labelledby`, give icon-only buttons an `aria-label`, and use
  `role="alert"` on errors.

## Imports

List imports in this order: external packages, `@/…` imports, same-folder
`./X.jsx`, then the CSS import last. Always use `@/` for anything outside the
current folder, never `../`. Keep the file extension on every import.

## CSS

- Every page or component imports its own `./styles/X.css`.
- Name classes with BEM (`block__el--mod`). Page CSS is scoped under the page's
  root class (`.landing`, `.pd`, `.shop`, `.admin-shell`).
- Colours, spacing and fonts come only from tokens in `styles/tokens.css`,
  never literal values.
- A class used by more than one area goes in `styles/primitives.css`.
- Design language: dark tokens from `styles/tokens.css` (`--color-bg`,
  `--color-text`, `--color-accent`, …) — never literal colours.
- Type: `--font-serif` (Source Serif 4) for headlines and names, `--font-wide`
  (Archivo) for codes and caps, `--font-body` (Inter) for everything else,
  including 12px caps eyebrows (`.eyebrow`, form `NN / Label`).
- Shapes: square corners, 1px hairlines (`--color-border`), and
  no-background product photos (`.blend` + a `--stone` glow) — no radius, no
  gem ornaments on new work.

## Tests

- Put tests in `src/test/`, at the same path as the file they test:
  `pages/store/ProductPage.jsx` → `test/pages/store/ProductPage.test.jsx`.
- Import the code under test with `@/…`. Mock the network with
  `vi.mock('@/lib/api.js')`, never `fetch`.
- Test what the user sees (roles and text), not implementation details.

## Known drift: do not copy these

This code breaks the rules above and is waiting for a planned clean-up. Do not
use it as an example. Fix it only when a task asks for it.

- `LandingPage` and `ProductPage` each fetch `getProducts()`. The catalogue
  should come from a `ProductsContext`.
- Loading data (`useEffect` + `.then`/`.catch`) is written out by hand in every
  page, and the admin pages don't cancel it on unmount. The plan is a shared
  `hooks/useFetch.js`.
- `err instanceof ApiError ? err.message : '…'` is repeated in many files. The
  plan is a `getErrorMessage(err, fallback)` helper in `lib/api.js`.
- Loading and error markup differs from page to page. The plan is a shared
  `StatusMessage` component.
- `STATUSES`/`formatDate` are duplicated in the two admin order pages, and
  `GALLERY` data is inline in `ProductPage`.
- There are two image systems, `lib/productImage.js` and
  `data/photoManifest.js`, which should become one.

Remove each item from this list when it is fixed.
