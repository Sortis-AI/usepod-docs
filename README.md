# Use Pod Docs

Documentation site for [Use Pod](https://usepod.ai), the inference marketplace.
Homed at **docs.usepod.ai**.

Built with the same tooling as [basehub](https://github.com/wbnns/basehub):
[Astro](https://astro.build) + [Starlight](https://starlight.astro.build), a
static-site documentation stack.

## Stack

| Tool | Role |
| --- | --- |
| Astro `^6.3.7` | Static site framework |
| `@astrojs/starlight` `^0.39.2` | Documentation theme (sidebar, search, TOC, theming) |
| Expressive Code | Code blocks (bundled with Starlight) |
| `@astrojs/check` + `typescript` | Type checking |
| `sharp` | Build-time image optimization |

## Develop

```bash
npm install
npm run dev        # http://localhost:4321
```

## Build

```bash
npm run build      # static output → ./dist
npm run preview    # serve ./dist locally
npm run check      # astro check (types + content)
```

## Layout

```
src/
├── content/docs/        Markdown/MDX pages (one folder per sidebar section)
├── content.config.ts    Starlight docs collection
├── pages/
│   ├── [...slug].md.ts   Raw-Markdown endpoint (append .md to any URL)
│   └── llms.txt.ts       llms.txt corpus index
└── styles/theme.css     Accent + palette overrides
public/
├── CNAME                docs.usepod.ai (GitHub Pages custom domain)
├── robots.txt
└── favicon.svg
astro.config.mjs         Site URL, Starlight config, sidebar
```

## Agent-friendly features

Use Pod's audience is largely AI agents, so the docs are machine-consumable:

- **Raw Markdown** — append `.md` to any page URL (e.g. `/using/quickstart.md`).
- **llms.txt** — corpus index at `/llms.txt` ([llmstxt.org](https://llmstxt.org)).

## Deploy

The build is fully static (`./dist`) — **no Astro adapter required**. It deploys
via **Cloudflare Pages** with git integration, matching the rest of usepod.ai
(whose DNS/zone is already on Cloudflare).

Project settings:

- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Production branch:** `main`
- **Node:** pinned via `.nvmrc` (also set `NODE_VERSION` in the Pages project)

Cloudflare runs `npm ci` from the committed `package-lock.json`, builds, and
publishes `dist` on every push to `main`. The custom domain `docs.usepod.ai` is
added in the Pages project's **Custom domains** tab; because the zone is in the
same Cloudflare account, the proxied DNS record and TLS cert are provisioned
automatically (no manual DNS entry, no `CNAME` file).
