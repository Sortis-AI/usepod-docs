---
title: Integrations
description: Every client that speaks OpenAI or Anthropic can point at UsePod by changing one base URL. These are the ones we have wired and verified.
---

UsePod is a base-URL swap, which means the list below is not a list of things we
built adapters for — it is a list of clients we have actually pointed at the
proxy and watched answer. Anything that lets you override an OpenAI or Anthropic
base URL belongs on it whether or not it is named here.

Two URLs cover almost everything:

| Surface | Base URL |
|---|---|
| OpenAI-compatible | `https://api.usepod.ai/proxy/<token>/v1` |
| Anthropic-compatible | `https://api.usepod.ai/proxy/<token>` |

The token in the path **is** the credential, so wherever a client demands an API
key you can hand it any non-empty string — `UsePod` reads well in a config file
— and the field will simply be ignored. That one detail trips more people than
everything else combined, because a client that refuses to start without a key
looks like an authentication problem when it is really just a required field.

## Coding agents

- **[Claude Code](/integrations/claude-code/)** — terminal coding agent. Two
  environment variables against the Anthropic-compatible endpoint.
- **[Codex CLI](/integrations/codex/)** — terminal coding agent. A provider
  block in `~/.codex/config.toml`; it ignores `OPENAI_BASE_URL` entirely, which
  is the single most common reason a Codex wire-up appears to do nothing.
- **[OpenCode](/integrations/opencode/)** — terminal coding agent. A provider
  block in `opencode.json`.
- **[Cline](/integrations/cline/)** — VS Code agent. Settings panel, "OpenAI
  Compatible" provider.
- **[Aider](/integrations/aider/)** — terminal pair programmer. Environment
  variables or flags.
- **[Cursor](/integrations/cursor/)** — editor. Settings panel, with an OpenAI
  base-URL override.

## SDKs

The official SDKs need nothing but the base URL, so they are documented together
on [Drop-in API](/using/drop-in-api/) rather than a page each:

- **OpenAI Python / Node / Go** — `base_url` on the client.
- **Anthropic Python / Node** — `base_url` on the client, no `/v1` suffix.

## Frameworks and extensions

- **Continue.dev** — a model entry in `~/.continue/config.json` with `apiBase`
  set to the OpenAI-compatible URL; set `"provider": "anthropic"` and drop the
  `/v1` to use the Anthropic surface instead.
- **LangChain, LangGraph** — pass `base_url` to `ChatOpenAI`, or
  `anthropic_api_url` to `ChatAnthropic`.
- **LiteLLM** — configure UsePod as an `openai/`-prefixed model with
  `api_base` pointing at the proxy.

## Anything else

If a client accepts a custom base URL, it works, and the fastest way to find out
is [raw curl](/using/drop-in-api/) against the same URL you are about to paste
into it. A streaming reply from curl and a failure inside the client narrows the
problem to the client's configuration rather than the account, which is usually
the answer.

Once a tool is connected, [spend controls](/using/spend-controls/) apply to it
without any further configuration: the per-request price ceilings are HTTP
headers, so they travel with any client that can set one.
