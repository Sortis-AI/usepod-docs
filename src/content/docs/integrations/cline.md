---
title: Cline
description: Configure the Cline VS Code agent against UsePod's OpenAI-compatible endpoint.
---

Cline has a first-class "OpenAI Compatible" provider, which is exactly what
UsePod is, so there is nothing to work around here.

## Setup

In Cline's settings panel:

1. **API Provider:** OpenAI Compatible
2. **Base URL:** `https://api.usepod.ai/proxy/<TOKEN>/v1`
3. **API Key:** `UsePod` — or any non-empty string; the token in the URL is the
   credential
4. **Model ID:** any id from the [marketplace](https://usepod.ai/marketplace),
   for example `claude-sonnet-5` or `deepseek-v4-1-flash`

Replace `<TOKEN>` with the API token from your
[dashboard](https://usepod.ai/dashboard).

## Verify

Start a Cline task and watch it respond. Because Cline shows token counts per
turn, it is a convenient place to sanity-check that usage is landing where you
expect: the same numbers appear in your dashboard's activity feed.

## Choosing a model

Cline drives long agentic loops with large contexts, which makes model choice a
cost decision more than a capability one. A cheap model doing ten turns can
easily cost more than an expensive model doing two. The marketplace lists
per-million prices for both input and output, and output is where agent loops
spend.

[Spend controls](/using/spend-controls/) are the backstop: set a per-request
price ceiling and a runaway loop cannot quietly buy the expensive tier.

## Troubleshooting

**"Model not found".** The id must match the marketplace exactly — no vendor
prefix, no date suffix.

**Cline hangs on the first turn.** Confirm the base URL carries `/v1`.

**Costs climbing faster than expected.** Check whether Cline is sending the full
file context each turn; that is a Cline setting, not a UsePod one, and it
multiplies input tokens across every turn of a loop.
