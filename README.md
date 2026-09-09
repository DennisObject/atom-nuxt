# Atom Nuxt

The Atom and Dusk themes for [Atom CMS](https://github.com/DennisObject/atomcms), built with Nuxt 4. Pages, layouts, components, translations and artwork live here; Laravel provides authentication, permissions, content, purchases, support and emulator integration through its [headless API](https://github.com/DennisObject/atomcms/pull/237).

## Development

Use Node 22.19+ or Node 24.11+. Start an installed Atom backend, then:

```sh
cp .env.example .env
npm ci
npm run dev
```

Open `http://127.0.0.1:3000`. Set `NUXT_BACKEND_URL` to the Laravel origin, usually `http://127.0.0.1:8000`. This setting is server-only. Nuxt forwards API and authentication requests to Laravel; the browser uses the frontend origin for both pages and requests.

Add the frontend host and port to Laravel's `SANCTUM_STATEFUL_DOMAINS`, configure its frontend origin/CORS settings, and use cookies appropriate to your HTTP development or HTTPS production environment. Laravel remains responsible for CSRF validation, session cookies and all authorization. No Laravel application key or payment secret belongs in this repository.

## Build and deploy

```sh
npm ci
npm run typecheck
npm run build
npm test
HOST=127.0.0.1 PORT=3000 NUXT_BACKEND_URL=http://127.0.0.1:8000 node .output/server/index.mjs
```

Deploy the complete `.output/` directory and run its Node server under your process supervisor. Route the public HTTPS origin to that server, preserving the original host and protocol. `.output/public` alone is insufficient: public content is rendered on the server and the server proxies Laravel requests. Set runtime environment variables in the supervisor; the production entry point does not load `.env` automatically.

Configure Laravel's public application/frontend URLs and trusted proxy settings for that origin. Nuxt forwards `/api`, `/sanctum`, `/storage`, `/housekeeping`, Livewire, housekeeping assets and authentication mutations to Laravel. Authentication page GET requests remain Nuxt pages. Theme-owned public assets are served locally; missing `/assets` files, backend asset directories and `/client` paths fall through to Laravel. PayPal processing/callback routes also reach Laravel; frontend payment-status pages remain in Nuxt. External game/media origins must remain publicly reachable. Keep Laravel's queue workers, scheduler and uploaded storage running as usual.

Responses containing session-dependent HTML are private and not cached. The badge canvas and game client render in the browser. Public news, profile homes and rules support server rendering. Payment actions and game launches happen only in response to browser actions, never while rendering a page on the server.

## Themes and project structure

Both themes live in this repository and use one Nuxt application, dependency lockfile, API client and set of feature actions. Nuxt's [local layers](https://nuxt.com/docs/4.x/getting-started/layers) supply the selected theme's presentation. There is no need to fork the frontend or create a repository per theme.

```sh
npm run dev:atom
npm run dev:dusk
npm run build:atom
npm run build:dusk
```

Alternatively set `ATOM_THEME=atom` or `ATOM_THEME=dusk` in `.env` for development, or in the build environment. Dusk remains the default. Each build contains one theme; deploy that build's entire `.output/` directory. Changing `ATOM_THEME` on an already built Node server does not change its theme. Build both themes separately when deploying two sites, saving each output before the next build replaces it.

Atom supports light and dark color modes through its navigation toggle. The preference is stored in a cookie so server rendering and client navigation agree. Dusk retains its dark appearance. Theme choice belongs to the frontend build and is independent of Laravel's Blade theme setting.

| Location                     | Responsibility                                                                     |
| ---------------------------- | ---------------------------------------------------------------------------------- |
| `app/pages/`                 | Shared URLs, access metadata and page composition                                  |
| `app/views/`                 | Common feature screens such as settings, support, articles, shop and profile homes |
| `app/composables/`           | Shared authentication, session, API, locale, navigation and page actions           |
| `app/components/`            | Shared forms, notices, editor and feature controls                                 |
| `app/assets/css/base.css`    | Shared structure and controls using theme color variables                          |
| `themes/atom/app/`           | Atom layout, page presentation, cards and stylesheet                               |
| `themes/dusk/app/`           | Dusk layout, page presentation, cards and stylesheet                               |
| `themes/*/nuxt.config.ts`    | Theme layer configuration, including editor colors                                 |
| `server/`                    | Shared Laravel proxy                                                               |
| `app/locales/`, `app/types/` | Shared translations and generated API contract                                     |
| `public/assets/`             | Retained artwork; Atom-specific assets are under `images/atom/`                    |

Change shared actions once to fix both themes. Change a theme's layout, components or CSS for visual differences. Theme components are resolved through Nuxt's component registry (`#components`), so shared screens use the selected theme's cards without importing Dusk or Atom directly. Auth and member dashboard templates share their underlying form and action modules.

To add another theme, create its local layer under `themes/`, implement the presentation components supplied by the existing themes, provide its stylesheet/editor palette, and add its name to the explicit theme allowlist in `nuxt.config.ts` and the CI matrix. Keep API calls and authorization in the shared core. Separate repositories only become useful when a frontend has independent ownership, dependencies or product behavior.

## Features

Registration, login, password reset, authenticator/recovery-code challenges and logout; account settings, password changes, session history and two-factor enrollment; news, comments and reactions; staff, teams, leaderboards, photos and applications; store categories, gifts, vouchers, purchase history and PayPal status; support tickets/replies and rules; profile homes, widgets, inventory and layout editing; badge drawing/import/download/purchase, pixel logo generation, rare values and Nitro launch.

Feature availability comes from the backend and the selected emulator. The unimplemented groups home widget remains unavailable. Flash requires a separate supported runtime; modern browsers use Nitro. Real payment delivery, mail and game entry require configured backend integrations. Ticket editing uses the original TinyMCE 7 cloud editor and the backend’s `tinymce_api_key`; that key must authorize the frontend domain.

## API types and verification

The backend publishes `docs/api/schema.d.ts`. When upgrading the API, copy that file to `app/types/api-schema.d.ts`, then run the checks above. Generated TypeScript types describe data shapes; Laravel validates requests and enforces permissions.

CI builds and checks Atom and Dusk independently. Run `ATOM_THEME=atom npm run typecheck`, `npm run build:atom`, then `ATOM_THEME=atom npm test`; repeat with `dusk`.

`npm test` uses a disposable HTTP fixture and the production Nuxt build to check server-rendered content, concurrent session isolation, guest redirects and authentication proxy cookies. It does not exercise a real emulator or payment provider.

For a configured hotel, also verify registration, login/logout, two-factor enrollment/challenge, account changes, news interactions, home editing, support and commerce in a browser. Check desktop/mobile layouts against the original selected theme and verify that failed requests retain user input without replaying purchases.

Original Atom CMS artwork and source attribution are retained under the [MIT license](LICENSE).
