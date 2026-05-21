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

The build is fully static (`./dist`), so it can be hosted anywhere. Two options:

- **GitHub Pages** — the `public/CNAME` file pins the `docs.usepod.ai` custom
  domain; add a Pages workflow that builds and publishes `./dist`.
- **Cloudflare Pages** — the rest of usepod.ai already deploys here. Set the
  build command to `npm run build` and the output directory to `dist`; map the
  `docs.usepod.ai` custom domain in the Pages project. (Remove `public/CNAME`
  if you go this route — it's GitHub-Pages-specific.)

Point `docs.usepod.ai` DNS at whichever host you choose.
