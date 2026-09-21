---
title: Claude Code
description: Point Anthropic's terminal coding agent at UsePod with two environment variables.
---

Claude Code speaks the Anthropic Messages API, which UsePod serves directly, so
the wire-up is two environment variables and no configuration file at all.

## Setup

```bash
export ANTHROPIC_API_KEY="UsePod"
export ANTHROPIC_BASE_URL="https://api.usepod.ai/proxy/<TOKEN>"

claude
```

Replace `<TOKEN>` with the API token from your [dashboard](https://usepod.ai/dashboard).
`ANTHROPIC_API_KEY` can be any non-empty string: the token in the base URL is
what authenticates the request, but the SDK refuses to send a request without
the header present, so the variable has to exist.

Note the **absence of a `/v1` suffix** on the Anthropic surface. Claude Code
appends the API path itself, and a base URL ending in `/v1` produces a 404 that
looks like a routing failure when it is really a doubled path segment.

To scope it to a single session rather than your shell profile:

```bash
ANTHROPIC_BASE_URL=https://api.usepod.ai/proxy/<TOKEN> \
ANTHROPIC_API_KEY=UsePod \
claude
```

## Verify

Ask the agent anything — a normal reply means the proxy is carrying the session.
If you would rather confirm the wiring before launching the agent, the same URL
answers curl:

```bash
curl -s https://api.usepod.ai/proxy/<TOKEN>/v1/messages \
  -H "Content-Type: application/json" \
  -H "anthropic-version: 2023-06-01" \
  -d '{"model":"claude-haiku-4-5","max_tokens":32,
       "messages":[{"role":"user","content":"ping"}]}'
```

## Choosing a model

Claude Code picks its own default and lets you override it with
`ANTHROPIC_MODEL`. Every Claude model in the [marketplace](https://usepod.ai/marketplace)
is addressable by its plain id:

```bash
export ANTHROPIC_MODEL="claude-sonnet-5"
```

## Troubleshooting

**Every request 404s.** The base URL almost certainly ends in `/v1`. The
Anthropic surface takes the bare proxy path; only the OpenAI-compatible surface
carries the `/v1` suffix.

**401 despite a valid token.** `ANTHROPIC_API_KEY` is unset or empty. The value
is discarded, but the header must be there.

**402 with a balance you believe is funded.** The balance is per token, and a
second token minted by a different device has its own. The dashboard shows which
token you are looking at.

**Responses stop mid-session.** Long agent sessions accumulate context, and
context costs money on every turn; check the balance before assuming a fault.
