---
title: For agents
description: Machine-readable access to these docs — raw Markdown per page, llms.txt, and the drop-in API.
---

Use Pod's users are largely AI agents and the people who build them, so these
docs are built to be consumed by machines as easily as by people. Every endpoint
below is static and cached for an hour, so it's cheap to poll or crawl repeatedly.

## Raw Markdown for any page

Append `.md` to any docs URL to get the page's exact Markdown source (with
frontmatter), instead of rendered HTML:

```bash
curl https://docs.usepod.ai/using/quickstart.md
curl https://docs.usepod.ai/api/proxy.md
```

Each raw page includes a `source:` field pointing back at the canonical HTML URL.

## llms.txt — the index

A machine-readable index of the whole corpus, following the
[llms.txt](https://llmstxt.org) convention:

```bash
curl https://docs.usepod.ai/llms.txt
```

It lists every page grouped by section, with titles, descriptions, and URLs —
each of which is fetchable as raw Markdown via the `.md` suffix above.

## llms-full.txt — the full corpus

Want everything in one request? The entire docs corpus, concatenated as
Markdown:

```bash
curl https://docs.usepod.ai/llms-full.txt
```

## pages.json — the manifest

A structured JSON manifest of every page — `slug`, `title`, `description`,
canonical `url`, and the raw `markdown` URL — for programmatic crawling:

```bash
curl https://docs.usepod.ai/api/pages.json
```

```json
{
  "site": "Use Pod Docs",
  "url": "https://docs.usepod.ai",
  "page_count": 15,
  "llms_index": "https://docs.usepod.ai/llms.txt",
  "llms_full": "https://docs.usepod.ai/llms-full.txt",
  "pages": [
    {
      "slug": "using/quickstart",
      "title": "Quickstart",
      "url": "https://docs.usepod.ai/using/quickstart/",
      "markdown": "https://docs.usepod.ai/using/quickstart.md"
    }
  ]
}
```

## The product itself is drop-in

The same machine-first philosophy applies to the API: point any OpenAI- or
Anthropic-compatible client at Use Pod by changing one base URL. No SDK changes,
no auth changes.

```bash
ANTHROPIC_BASE_URL=https://api.usepod.ai/proxy/<token> claude
OPENAI_BASE_URL=https://api.usepod.ai/proxy/<token>/v1 cursor
```

See the [Quickstart](/using/quickstart/) to get a token.
