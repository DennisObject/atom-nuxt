# Atom Nuxt

The Dusk theme for [Atom CMS](https://github.com/DennisObject/atomcms), built with Nuxt 4. Pages, layouts, components, translations and artwork live here; Laravel provides authentication, permissions, content, purchases, support and emulator integration through its [headless API](https://github.com/DennisObject/atomcms/pull/237).

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

## Theme development

The original Dusk theme is the visual reference. Its artwork and translations are retained.

- `app/pages/` defines public URLs and page access metadata.
- `app/layouts/dusk.vue` contains the Dusk navigation, page shell and footer.
- `app/views/` implements the feature pages shared by related routes.
- `app/components/` contains reusable theme controls and home widgets.
- `app/assets/css/dusk.css` carries the Dusk styles and Tailwind setup.
- `app/composables/` owns request-scoped session, locale and API access.
- `public/assets/` contains theme-owned artwork.

Develop a theme by changing its layout, pages, components and styles while preserving the API calls and server access checks. Nuxt's standard layers can share this foundation between separate theme projects; there is no custom theme loader or second implementation of Laravel's business rules.

## Features

Registration, login, password reset, authenticator/recovery-code challenges and logout; account settings, password changes, session history and two-factor enrollment; news, comments and reactions; staff, teams, leaderboards, photos and applications; store categories, gifts, vouchers, purchase history and PayPal status; support tickets/replies and rules; profile homes, widgets, inventory and layout editing; badge drawing/import/download/purchase, pixel logo generation, rare values and Nitro launch.

Feature availability comes from the backend and the selected emulator. The unimplemented groups home widget remains unavailable. Flash requires a separate supported runtime; modern browsers use Nitro. Real payment delivery, mail and game entry require configured backend integrations. Ticket editing uses the original TinyMCE 7 cloud editor and the backend’s `tinymce_api_key`; that key must authorize the frontend domain.

## API types and verification

The backend publishes `docs/api/schema.d.ts`. When upgrading the API, copy that file to `app/types/api-schema.d.ts`, then run the checks above. Generated TypeScript types describe data shapes; Laravel validates requests and enforces permissions.

`npm test` uses a disposable HTTP fixture and the production Nuxt build to check server-rendered content, concurrent session isolation, guest redirects and authentication proxy cookies. It does not exercise a real emulator or payment provider.

For a configured hotel, also verify registration, login/logout, two-factor enrollment/challenge, account changes, news interactions, home editing, support and commerce in a browser. Check desktop/mobile layouts against the original Dusk theme and verify that failed requests retain user input without replaying purchases.

Original Atom CMS artwork and source attribution are retained under the [MIT license](LICENSE).
