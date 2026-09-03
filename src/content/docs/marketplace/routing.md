---
title: Routing & matching
description: How the coordinator selects a provider for each request, with centralized fallback.
---

For each request, the coordinator selects where to send it. The goal is the
cheapest source that satisfies your model, price, and health constraints — with a
centralized provider always available as a fallback.

## Selection order

1. **Load candidates** for the requested model: active marketplace providers
   (live agents that are online and healthy) and active key relay listings.
2. **Cap prices** at the cheapest centralized price for the model, on both the
   input and output axes.
3. **Filter** by your per-request price ceiling (see
   [Spend controls](/using/spend-controls/)), throttle, and capacity/health.
4. **Sort** by listed price and pick the best.

If a marketplace or key relay candidate is selected, the request is dispatched to it.
Otherwise it **falls through to the centralized router** — the always-on
tier-zero fallback (Anthropic, OpenAI, Venice, Together, Groq, OpenRouter,
Bedrock).

## Routing modes

Set with the `X-Pod-Routing-Mode` request header:

| Value | Behaviour |
| --- | --- |
| `auto` (default) | Prefer the cheapest eligible marketplace/key relay candidate; fall through to centralized when none qualifies |
| `marketplace-only` | Restrict to marketplace/key relay candidates; if none qualify at your price, return a no-provider-at-price result rather than using centralized |
| `centralized-only` | Skip the marketplace entirely and route through the centralized tier |

```bash
curl https://api.usepod.ai/proxy/$TOKEN/v1/chat/completions \
  -H "X-Pod-Routing-Mode: centralized-only" \
  -H "Content-Type: application/json" \
  -d '{"model":"claude-haiku-4-5","messages":[{"role":"user","content":"hi"}]}'
```

## Pinning specific providers

Routing optimizes for price, so the source that serves you can change between
two identical requests as relays drain, refill, and rotate. If you need the
throughput you measured yesterday to be the throughput you get today, pin the
request to the providers you want with `X-Pod-Providers`:

```bash
# Only Venice.
-H "X-Pod-Providers: venice"

# OpenAI first, OpenRouter as the backup — and nothing else.
-H "X-Pod-Providers: openai,openrouter"
```

Valid names are `anthropic`, `openai`, `bedrock`, `venice`, `together`, `groq`,
`openrouter`, `nousresearch`, `google`, `surplus`, `c0mpute`, and `uomi`. The
order you list them in is the order they are tried.

Three things to know:

- **A pin is a hard constraint.** If none of the pinned providers can serve the
  request, it fails with a `503` naming the pin. It never quietly falls back to
  a provider you excluded — a pin that degrades to "anything" would be worse
  than no pin, because you would believe you had a guarantee you did not.
- **A pin skips the marketplace.** "Only these providers" excludes the several
  hundred relays you did not name, so pinning implies `centralized-only`.
  Combining `X-Pod-Providers` with `X-Pod-Routing-Mode: marketplace-only` is
  contradictory and returns `400`.
- **An unknown name is rejected**, rather than silently pinning to nothing. A
  typo returns `400` listing the valid names, so a config mistake never reads
  as an outage.

Check `X-Pod-Provider-Id` on the response to confirm which provider served the
request.

## Provider health

Both tiers demote providers on their own recent record. A marketplace relay or
centralized provider whose failure rate or mean time-to-headers is out of band
is moved behind healthy ones, so a cheap provider that is currently stalling
cannot win routing on price alone.

Demotion, never exclusion — a degraded provider still serves when it is the
only thing that can, because the centralized tier is what makes drop-in
compatibility work. What it no longer does is set your latency floor.

## Why fallback is always on

Drop-in compatibility is the load-bearing promise: clients must never break
because the marketplace is thin for a given model at a given moment. Centralized
fallback guarantees a request can always be served, so the marketplace can grow
density without stranding users.

The `X-Pod-Route` response header tells you which path served each request.
