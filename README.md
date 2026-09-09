<div align="center">
<img src="https://i.imgur.com/9ePNdJ4.png" alt="Atom CMS" />

# Atom Nuxt

The Atom and Dusk themes you know, built with Nuxt.

[![Discord](https://img.shields.io/badge/Discord-Join%20Server-5865F2?style=flat&logo=discord&logoColor=white)](https://discord.gg/pP6HyZedAj)
[![Nuxt](https://img.shields.io/badge/Nuxt-4-00DC82?style=flat&logo=nuxt&logoColor=white)](https://nuxt.com)
[![Vue](https://img.shields.io/badge/Vue-3-4FC08D?style=flat&logo=vuedotjs&logoColor=white)](https://vuejs.org)

[Getting Started](#getting-started) • [Themes](#themes) • [Documentation](#documentation) • [Contributing](#contributing)

</div>

## About

Want to work on your hotel’s frontend with Vue? Atom Nuxt brings both Atom CMS themes into one project. Pick your favourite, make it your own, and let [Atom CMS](https://github.com/DennisObject/atomcms) take care of accounts, housekeeping and your emulator.

### What’s included?

- **Atom and Dusk** — both themes, with light and dark mode in Atom.
- **Community pages** — news, reactions, photos, leaderboards and applications.
- **Player accounts** — registration, settings, referrals and two-factor authentication.
- **Hotel features** — the shop, profile homes, support tickets and Nitro entry.
- **Translations** — the languages already included with Atom CMS.

Available features depend on your backend and emulator. Payments, email and Nitro still need their usual Atom CMS setup.

## Getting Started

You’ll need a running [Atom CMS backend](https://github.com/DennisObject/atomcms/blob/dev/docs/headless-mode.md) and Node.js 22.19+ or 24.11+.

Grab the project and install its dependencies:

```bash
git clone https://github.com/DennisObject/atom-nuxt.git
cd atom-nuxt
cp .env.example .env
npm ci
```

Set your backend address in `.env`:

```dotenv
NUXT_BACKEND_URL=http://127.0.0.1:8000
```

On the Laravel side, add `127.0.0.1:3000` to `SANCTUM_STATEFUL_DOMAINS` and configure the frontend origin and cookies using the [headless setup guide](https://github.com/DennisObject/atomcms/blob/dev/docs/headless-mode.md). That lets the two apps share your login.

Then start your favourite theme:

```bash
npm run dev:dusk
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000) and you’re ready to go! Prefer Atom? Use `npm run dev:atom` instead.

## Themes

Both themes live here, so fixes to shared features help both of them.

| Theme | Start development | Build |
| --- | --- | --- |
| Atom | `npm run dev:atom` | `npm run build:atom` |
| Dusk | `npm run dev:dusk` | `npm run build:dusk` |

Dusk is the default for `npm run dev` and `npm run build`. You can change that with `ATOM_THEME` in `.env` or your build environment.

Want to change something?

- **A theme’s look:** head to `themes/atom/` or `themes/dusk/`.
- **A shared page or feature:** look in `app/views/`, `app/components/` and `app/composables/`.
- **Text or artwork:** check `app/locales/` and `public/assets/`.

Each build contains one theme. Rebuild when switching themes, and save each `.output/` separately if you’re hosting both.

## Going Live

Build your theme, then start the server:

```bash
npm run build:dusk
HOST=127.0.0.1 PORT=3000 NUXT_BACKEND_URL=http://127.0.0.1:8000 node .output/server/index.mjs
```

Deploy the whole `.output/` folder and keep the Node process running with your hosting service. Point your HTTPS domain at it. Production settings belong in the server’s environment; this command doesn’t load `.env`.

The [deployment guide](https://github.com/DennisObject/atomcms/blob/dev/docs/headless-mode.md#build-workers-and-verification) covers the Laravel side, proxy settings and cookies. Using the ticket editor? Make sure your TinyMCE key allows the frontend domain.

## Contributing

Found a bug or have an idea? We’d love your help! Open an issue or send a pull request, and follow the [Atom CMS contribution guidelines](https://github.com/DennisObject/atomcms/blob/dev/docs/wiki/0.-Contribution-guidelines.md).

Before submitting changes, check both themes:

```bash
ATOM_THEME=atom npm run typecheck
npm run build:atom
ATOM_THEME=atom npm test

ATOM_THEME=dusk npm run typecheck
npm run build:dusk
ATOM_THEME=dusk npm test
```

Give the pages you changed a try on desktop and mobile too. If you update the backend API, copy its `docs/api/schema.d.ts` into `app/types/api-schema.d.ts` before running the checks.

## Documentation

- [Atom CMS wiki](https://github.com/DennisObject/atomcms/wiki) — hotel setup and features.
- [Headless setup](https://github.com/DennisObject/atomcms/blob/dev/docs/headless-mode.md) — connecting and hosting your backend.
- [Nuxt documentation](https://nuxt.com/docs/4.x/getting-started/introduction) — getting comfortable with Nuxt.

## Credits

A big thank you to the [Atom CMS contributors](https://github.com/DennisObject/atomcms#credits) for the themes, artwork, translations and features this project builds on.

Released under the [MIT license](LICENSE).

<div align="center">

Made with ❤️ by the Atom CMS Community

</div>
