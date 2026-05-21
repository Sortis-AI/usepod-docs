---
title: For agents
description: Machine-readable access to these docs — raw Markdown per page, llms.txt, and the drop-in API.
---

Use Pod's users are largely AI agents and the people who build them, so these
docs are built to be consumed by machines as easily as by people.

## Raw Markdown for any page

Append `.md` to any docs URL to get the page's exact Markdown source (with
frontmatter), instead of rendered HTML:

```bash
curl https://docs.usepod.ai/using/quickstart.md
curl https://docs.usepod.ai/api/proxy.md
```

Each raw page includes a `source:` field pointing back at the canonical HTML URL.

## llms.txt

A machine-readable index of the whole corpus follows the
[llms.txt](https://llmstxt.org) convention:

```bash
curl https://docs.usepod.ai/llms.txt
```

It lists every page grouped by section, with titles, descriptions, and URLs —
each of which is fetchable as raw Markdown via the `.md` suffix above.

## The product itself is drop-in

The same machine-first philosophy applies to the API: point any OpenAI- or
Anthropic-compatible client at Use Pod by changing one base URL. No SDK changes,
no auth changes.

```bash
ANTHROPIC_BASE_URL=https://api.usepod.ai/proxy/<token> claude
OPENAI_BASE_URL=https://api.usepod.ai/proxy/<token>/v1 cursor
```

See the [Quickstart](/using/quickstart/) to get a token.
